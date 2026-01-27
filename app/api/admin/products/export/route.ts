import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function escapeCSV(value: string | null | undefined): string {
    if (value === null || value === undefined) return ""
    const str = String(value)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const products = await prisma.product.findMany({
            include: {
                category: true,
                variants: true,
            },
            orderBy: { createdAt: "desc" },
        })

        // Create CSV header
        const headers = [
            "ID",
            "Name",
            "Slug",
            "Category",
            "Price",
            "Description",
            "Featured",
            "Images",
            "Variants (Size|Color|Stock|PriceModifier)",
            "Created At",
        ]

        // Create CSV rows
        const rows = products.map((product) => {
            const variantsSummary = product.variants
                .map((v) => `${v.size || "-"}|${v.color || "-"}|${v.stock}|${v.priceModifier}`)
                .join("; ")

            return [
                escapeCSV(product.id),
                escapeCSV(product.name),
                escapeCSV(product.slug),
                escapeCSV(product.category.name),
                escapeCSV(product.price.toString()),
                escapeCSV(product.description),
                escapeCSV(product.featured ? "Yes" : "No"),
                escapeCSV(product.images.join("; ")),
                escapeCSV(variantsSummary),
                escapeCSV(new Date(product.createdAt).toLocaleDateString()),
            ].join(",")
        })

        const csv = [headers.join(","), ...rows].join("\n")

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="products-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        })
    } catch (error) {
        console.error("Products export error:", error)
        return NextResponse.json(
            { error: "Failed to export products" },
            { status: 500 }
        )
    }
}
