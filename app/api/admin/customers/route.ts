import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: List all customers with aggregated order data
export async function GET(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""
        const sortBy = searchParams.get("sortBy") || "createdAt"
        const sortOrder = searchParams.get("sortOrder") || "desc"

        // Get all users with their order stats
        const users = await prisma.user.findMany({
            where: {
                role: "USER",
                OR: search ? [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search, mode: "insensitive" } },
                ] : undefined,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                createdAt: true,
                orders: {
                    select: {
                        id: true,
                        total: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
            },
        })

        // Calculate aggregated stats for each customer
        const customers = users.map(user => {
            const orderCount = user.orders.length
            const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0)
            const lastOrder = user.orders[0]?.createdAt || null

            return {
                id: user.id,
                name: user.name || "N/A",
                email: user.email,
                phone: user.phone || "N/A",
                city: user.city || "N/A",
                orderCount,
                totalSpent,
                lastOrder,
                createdAt: user.createdAt,
            }
        })

        // Sort customers
        customers.sort((a, b) => {
            let comparison = 0
            switch (sortBy) {
                case "name":
                    comparison = (a.name || "").localeCompare(b.name || "")
                    break
                case "orderCount":
                    comparison = a.orderCount - b.orderCount
                    break
                case "totalSpent":
                    comparison = a.totalSpent - b.totalSpent
                    break
                case "lastOrder":
                    comparison = new Date(a.lastOrder || 0).getTime() - new Date(b.lastOrder || 0).getTime()
                    break
                default:
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            }
            return sortOrder === "desc" ? -comparison : comparison
        })

        return NextResponse.json({
            customers,
            total: customers.length,
        })
    } catch (error) {
        console.error("Error fetching customers:", error)
        return NextResponse.json(
            { error: "Failed to fetch customers" },
            { status: 500 }
        )
    }
}
