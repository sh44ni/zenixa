import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { ids } = await request.json()

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No IDs provided" }, { status: 400 })
        }

        // Delete variants first (foreign key constraint)
        await prisma.productVariant.deleteMany({
            where: { productId: { in: ids } },
        })

        // Delete products
        const result = await prisma.product.deleteMany({
            where: { id: { in: ids } },
        })

        return NextResponse.json({
            success: true,
            deleted: result.count,
        })
    } catch (error) {
        console.error("Bulk delete products error:", error)
        return NextResponse.json(
            { error: "Failed to delete products" },
            { status: 500 }
        )
    }
}
