import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cloneExternalImages } from "@/lib/clone-image"

function parseCSV(text: string): string[][] {
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
                currentLine.push(currentField)
                currentField = ""
            } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
                currentLine.push(currentField)
                lines.push(currentLine)
                currentLine = []
                currentField = ""
                if (char === "\r") i++
            } else if (char !== "\r") {
                currentField += char
            }
        }
    }

    if (currentField || currentLine.length > 0) {
        currentLine.push(currentField)
        lines.push(currentLine)
    }

    return lines
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        const text = await file.text()
        const rows = parseCSV(text)

        if (rows.length < 2) {
            return NextResponse.json({ error: "CSV must have header and at least one data row" }, { status: 400 })
        }

        const headers = rows[0].map(h => h.toLowerCase().trim())
        const dataRows = rows.slice(1)

        // Required columns
        const nameIdx = headers.indexOf("name")
        const priceIdx = headers.indexOf("price")
        const categoryIdx = headers.indexOf("category")

        if (nameIdx === -1 || priceIdx === -1 || categoryIdx === -1) {
            return NextResponse.json(
                { error: "CSV must have Name, Price, and Category columns" },
                { status: 400 }
            )
        }

        // Optional columns
        const descIdx = headers.indexOf("description")
        const featuredIdx = headers.indexOf("featured")
        const imagesIdx = headers.indexOf("images")
        const slugIdx = headers.indexOf("slug")

        let created = 0
        let updated = 0
        let errors: string[] = []

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i]
            const rowNum = i + 2 // 1-indexed, accounting for header

            try {
                const name = row[nameIdx]?.trim()
                const priceStr = row[priceIdx]?.trim()
                const categoryName = row[categoryIdx]?.trim()

                if (!name || !priceStr || !categoryName) {
                    errors.push(`Row ${rowNum}: Missing required field`)
                    continue
                }

                const price = parseFloat(priceStr)
                if (isNaN(price)) {
                    errors.push(`Row ${rowNum}: Invalid price`)
                    continue
                }

                // Find or create category
                let category = await prisma.category.findFirst({
                    where: { name: { equals: categoryName, mode: "insensitive" } },
                })

                if (!category) {
                    category = await prisma.category.create({
                        data: {
                            name: categoryName,
                            slug: slugify(categoryName),
                        },
                    })
                }

                const slug = slugIdx !== -1 && row[slugIdx]?.trim()
                    ? row[slugIdx].trim()
                    : slugify(name)

                const description = descIdx !== -1 ? row[descIdx]?.trim() || null : null
                const featured = featuredIdx !== -1
                    ? ["yes", "true", "1"].includes(row[featuredIdx]?.toLowerCase().trim())
                    : false
                let images = imagesIdx !== -1 && row[imagesIdx]?.trim()
                    ? row[imagesIdx].split(";").map(s => s.trim()).filter(Boolean)
                    : []

                // Clone external images to local storage
                if (images.length > 0) {
                    images = await cloneExternalImages(images)
                }

                // Check if product exists by slug
                const existingProduct = await prisma.product.findUnique({
                    where: { slug },
                })

                if (existingProduct) {
                    await prisma.product.update({
                        where: { id: existingProduct.id },
                        data: {
                            name,
                            price,
                            description,
                            featured,
                            images,
                            categoryId: category.id,
                        },
                    })
                    updated++
                } else {
                    await prisma.product.create({
                        data: {
                            name,
                            slug,
                            price,
                            description,
                            featured,
                            images,
                            categoryId: category.id,
                        },
                    })
                    created++
                }
            } catch (err) {
                errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : "Unknown error"}`)
            }
        }

        return NextResponse.json({
            success: true,
            created,
            updated,
            errors: errors.slice(0, 10), // Limit error messages
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
