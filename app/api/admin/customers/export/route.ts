import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Export customers to CSV
export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const users = await prisma.user.findMany({
            where: { role: "USER" },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                createdAt: true,
                orders: {
                    select: {
                        total: true,
                        createdAt: true,
                    }
                },
            },
            orderBy: { createdAt: "desc" }
        })

        // Build CSV
        const headers = ["Name", "Email", "Phone", "City", "Orders", "Total Spent", "Last Order", "Registered"]
        const rows = users.map(user => {
            const orderCount = user.orders.length
            const totalSpent = user.orders.reduce((sum, o) => sum + o.total, 0)
            const lastOrder = user.orders.length > 0
                ? new Date(Math.max(...user.orders.map(o => new Date(o.createdAt).getTime()))).toISOString().split('T')[0]
                : "N/A"

            return [
                user.name || "N/A",
                user.email,
                user.phone || "N/A",
                user.city || "N/A",
                orderCount.toString(),
                totalSpent.toFixed(2),
                lastOrder,
                new Date(user.createdAt).toISOString().split('T')[0],
            ]
        })

        const csv = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n")

        return new Response(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        })
    } catch (error) {
        console.error("Error exporting customers:", error)
        return NextResponse.json(
            { error: "Failed to export customers" },
            { status: 500 }
        )
    }
}
