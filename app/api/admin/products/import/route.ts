import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cloneExternalImages } from "@/lib/clone-image"

// Parse CSV with header row
function parseCSV(text: string): { headers: string[], rows: Record<string, string>[] } {
    const lines: string[][] = []
    let currentLine: string[] = []
    let currentField = ""
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const nextChar = text[i + 1]

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                currentField += '"'
                i++
            } else if (char === '"') {
                inQuotes = false
            } else {
                currentField += char
            }
        } else {
            if (char === '"') {
                inQuotes = true
            } else if (char === ",") {
                currentLine.push(currentField.trim())
                currentField = ""
            } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
                currentLine.push(currentField.trim())
                if (currentLine.some(f => f)) {
                    lines.push(currentLine)
                }
                currentLine = []
                currentField = ""
                if (char === "\r") i++
            } else if (char !== "\r") {
                currentField += char
            }
        }
    }

    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim())
        if (currentLine.some(f => f)) {
            lines.push(currentLine)
        }
    }

    if (lines.length < 2) {
        return { headers: [], rows: [] }
    }

    const headers = lines[0].map(h => h.toLowerCase().replace(/\s+/g, "_"))
    const rows = lines.slice(1).map(line => {
        const row: Record<string, string> = {}
        headers.forEach((header, i) => {
            row[header] = line[i] || ""
        })
        return row
    })

    return { headers, rows }
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

interface ParsedProduct {
    type: "single" | "variable" | "variant"
    sku: string
    name: string
    category: string
    description: string
    price: number
    comparePrice: number | null
    image: string
    gallery: string[]
    stock: number
    featured: boolean
    parentSku: string
    color: string
    size: string
    isDefault: boolean
}

function parseRow(row: Record<string, string>): ParsedProduct | null {
    const type = row.type?.toLowerCase()
    if (!["single", "variable", "variant"].includes(type)) {
        return null
    }

    const price = parseFloat(row.price) || 0
    const comparePrice = row.compare_price ? parseFloat(row.compare_price) : null
    const gallery = row.gallery ? row.gallery.split("|").map(s => s.trim()).filter(Boolean) : []

    return {
        type: type as "single" | "variable" | "variant",
        sku: row.sku || "",
        name: row.name || "",
        category: row.category || "",
        description: row.description || "",
        price,
        comparePrice: isNaN(comparePrice as number) ? null : comparePrice,
        image: row.image || "",
        gallery,
        stock: parseInt(row.stock) || 0,
        featured: row.featured === "1",
        parentSku: row.parent_sku || "",
        color: row.color || "",
        size: row.size || "",
        isDefault: row.is_default === "1",
    }
}

async function cloneImages(urls: string[]): Promise<string[]> {
    if (urls.length === 0) return []
    try {
        return await cloneExternalImages(urls)
    } catch {
        return urls // Return original URLs on failure
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const text = await file.text()
        const { rows } = parseCSV(text)

        if (rows.length === 0) {
            return NextResponse.json({ error: "CSV is empty" }, { status: 400 })
        }

        // Parse all valid rows
        const products: ParsedProduct[] = []
        for (const row of rows) {
            const parsed = parseRow(row)
            if (parsed) {
                products.push(parsed)
            }
        }

        // Track products by SKU
        const productMap = new Map<string, string>() // SKU -> Product ID

        let created = 0
        let updated = 0
        let skipped = 0
        const errors: string[] = []

        // Process single and variable (parent) products first
        const parentProducts = products.filter(p => p.type === "single" || p.type === "variable")

        for (const product of parentProducts) {
            try {
                // Find or create category
                let category = await prisma.category.findFirst({
                    where: { name: { equals: product.category || "Uncategorized", mode: "insensitive" } }
                })
                if (!category) {
                    category = await prisma.category.create({
                        data: {
                            name: product.category || "Uncategorized",
                            slug: slugify(product.category || "uncategorized"),
                        }
                    })
                }

                // Clone images
                let images: string[] = []
                const allImages = [product.image, ...product.gallery].filter(Boolean)
                if (allImages.length > 0) {
                    images = await cloneImages(allImages)
                }

                const slug = slugify(product.sku || product.name)

                // Check if exists
                const existing = await prisma.product.findFirst({
                    where: { OR: [{ slug }, { name: product.name }] }
                })

                if (existing) {
                    await prisma.product.update({
                        where: { id: existing.id },
                        data: {
                            name: product.name,
                            description: product.description || undefined,
                            price: product.price || existing.price,
                            comparePrice: product.comparePrice,
                            images: images.length > 0 ? images : undefined,
                            featured: product.featured,
                            categoryId: category.id,
                        }
                    })
                    productMap.set(product.sku, existing.id)
                    updated++
                } else {
                    const created_product = await prisma.product.create({
                        data: {
                            name: product.name,
                            slug: slug + "-" + Date.now().toString(36),
                            description: product.description || null,
                            price: product.price,
                            comparePrice: product.comparePrice,
                            images,
                            featured: product.featured,
                            categoryId: category.id,
                        }
                    })
                    productMap.set(product.sku, created_product.id)
                    created++
                }
            } catch (err) {
                errors.push(`${product.sku}: ${err instanceof Error ? err.message : "Unknown error"}`)
            }
        }

        // Process variants
        const variants = products.filter(p => p.type === "variant")

        for (const variant of variants) {
            try {
                const parentId = variant.parentSku ? productMap.get(variant.parentSku) : null

                if (!parentId) {
                    // Parent not in this import, try finding in DB
                    const parentProduct = await prisma.product.findFirst({
                        where: { slug: { contains: slugify(variant.parentSku) } }
                    })
                    if (!parentProduct) {
                        skipped++
                        continue
                    }
                    productMap.set(variant.parentSku, parentProduct.id)
                }

                const finalParentId = productMap.get(variant.parentSku)!

                // Clone variant images
                let images: string[] = []
                const allImages = [variant.image, ...variant.gallery].filter(Boolean)
                if (allImages.length > 0) {
                    images = await cloneImages(allImages)
                }

                // Check if variant exists by SKU
                const existingVariant = await prisma.productVariant.findFirst({
                    where: { productId: finalParentId, sku: variant.sku }
                })

                if (existingVariant) {
                    await prisma.productVariant.update({
                        where: { id: existingVariant.id },
                        data: {
                            name: variant.name,
                            price: variant.price || undefined,
                            comparePrice: variant.comparePrice,
                            stock: variant.stock,
                            color: variant.color || undefined,
                            size: variant.size || undefined,
                            images,
                        }
                    })
                    updated++
                } else {
                    await prisma.productVariant.create({
                        data: {
                            productId: finalParentId,
                            sku: variant.sku,
                            name: variant.name,
                            price: variant.price || undefined,
                            comparePrice: variant.comparePrice,
                            stock: variant.stock,
                            color: variant.color || undefined,
                            size: variant.size || undefined,
                            images,
                        }
                    })
                    created++
                }
            } catch (err) {
                errors.push(`${variant.sku}: ${err instanceof Error ? err.message : "Unknown error"}`)
            }
        }

        return NextResponse.json({
            success: true,
            created,
            updated,
            skipped,
            errors: errors.slice(0, 10),
            totalErrors: errors.length,
        })
    } catch (error) {
        console.error("Products import error:", error)
        return NextResponse.json(
            { error: "Failed to import products" },
            { status: 500 }
        )
    }
}
