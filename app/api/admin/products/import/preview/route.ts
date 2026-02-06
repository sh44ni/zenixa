import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
        const { headers, rows } = parseCSV(text)

        if (rows.length === 0) {
            return NextResponse.json({ error: "CSV is empty or missing header row" }, { status: 400 })
        }

        // Validate required columns
        const requiredColumns = ["type", "sku", "name"]
        const missingColumns = requiredColumns.filter(c => !headers.includes(c))
        if (missingColumns.length > 0) {
            return NextResponse.json({
                error: `Missing required columns: ${missingColumns.join(", ")}`,
            }, { status: 400 })
        }

        // Parse all rows
        const products: ParsedProduct[] = []
        const errors: string[] = []

        for (let i = 0; i < rows.length; i++) {
            const parsed = parseRow(rows[i])
            if (parsed) {
                products.push(parsed)
            } else {
                errors.push(`Row ${i + 2}: Invalid product type "${rows[i].type}"`)
            }
        }

        // Count by type
        const singleCount = products.filter(p => p.type === "single").length
        const variableCount = products.filter(p => p.type === "variable").length
        const variantCount = products.filter(p => p.type === "variant").length

        // Get preview sample (first 10)
        const preview = products.slice(0, 10).map(p => ({
            type: p.type,
            sku: p.sku,
            name: p.name,
            price: p.price,
            image: p.image,
            color: p.color,
            parentSku: p.parentSku,
            isDefault: p.isDefault,
        }))

        return NextResponse.json({
            success: true,
            totalRows: rows.length,
            validProducts: products.length,
            singleCount,
            variableCount,
            variantCount,
            preview,
            errors: errors.slice(0, 5),
            hasHeaders: true,
            detectedColumns: headers,
        })
    } catch (error) {
        console.error("Preview error:", error)
        return NextResponse.json(
            { error: "Failed to parse CSV" },
            { status: 500 }
        )
    }
}
