import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: All products with stock levels
export async function GET(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const filter = searchParams.get("filter") || "all" // all, low, out

        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                images: true,
                variants: {
                    select: {
                        id: true,
                        size: true,
                        color: true,
                        stock: true,
                        minStock: true,
                    }
                },
                category: {
                    select: {
                        name: true,
                    }
                }
            },
            orderBy: { name: "asc" }
        })

        // Flatten products with variants and calculate status
        const inventory = products.flatMap(product =>
            product.variants.map(variant => {
                let status: "ok" | "low" | "out" = "ok"
                if (variant.stock === 0) {
                    status = "out"
                } else if (variant.stock <= variant.minStock) {
                    status = "low"
                }

                const variantLabel = [variant.size, variant.color].filter(Boolean).join(" / ") || "Default"

                return {
                    productId: product.id,
                    variantId: variant.id,
                    productName: product.name,
                    variantLabel,
                    image: product.images[0] || null,
                    category: product.category.name,
                    stock: variant.stock,
                    minStock: variant.minStock,
                    status,
                }
            })
        )

        // Filter if needed
        let filtered = inventory
        if (filter === "low") {
            filtered = inventory.filter(i => i.status === "low")
        } else if (filter === "out") {
            filtered = inventory.filter(i => i.status === "out")
        }

        // Stats
        const stats = {
            total: inventory.length,
            ok: inventory.filter(i => i.status === "ok").length,
            low: inventory.filter(i => i.status === "low").length,
            out: inventory.filter(i => i.status === "out").length,
        }

        return NextResponse.json({
            inventory: filtered,
            stats,
        })
    } catch (error) {
        console.error("Error fetching inventory:", error)
        return NextResponse.json(
            { error: "Failed to fetch inventory" },
            { status: 500 }
        )
    }
}

// PATCH: Update stock levels
export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { updates } = body // Array of { variantId, stock, minStock }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: "Invalid updates array" }, { status: 400 })
        }

        // Update each variant
        const results = await Promise.all(
            updates.map(update =>
                prisma.productVariant.update({
                    where: { id: update.variantId },
                    data: {
                        ...(update.stock !== undefined && { stock: update.stock }),
                        ...(update.minStock !== undefined && { minStock: update.minStock }),
                    }
                })
            )
        )

        return NextResponse.json({
            updated: results.length,
            message: `Updated ${results.length} variant(s)`,
        })
    } catch (error) {
        console.error("Error updating inventory:", error)
        return NextResponse.json(
            { error: "Failed to update inventory" },
            { status: 500 }
        )
    }
}
