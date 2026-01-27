import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Analytics dashboard data
export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Get all orders
        const orders = await prisma.order.findMany({
            select: {
                id: true,
                total: true,
                status: true,
                createdAt: true,
            }
        })

        // Orders today/week/month
        const ordersToday = orders.filter(o => new Date(o.createdAt) >= startOfToday)
        const ordersThisWeek = orders.filter(o => new Date(o.createdAt) >= startOfWeek)
        const ordersThisMonth = orders.filter(o => new Date(o.createdAt) >= startOfMonth)

        // Revenue calculations
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
        const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0)
        const revenueThisWeek = ordersThisWeek.reduce((sum, o) => sum + o.total, 0)
        const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.total, 0)

        // Order status breakdown
        const statusBreakdown = {
            pending: orders.filter(o => o.status === "PENDING").length,
            confirmed: orders.filter(o => o.status === "CONFIRMED").length,
            processing: orders.filter(o => o.status === "PROCESSING").length,
            shipped: orders.filter(o => o.status === "SHIPPED").length,
            delivered: orders.filter(o => o.status === "DELIVERED").length,
            cancelled: orders.filter(o => o.status === "CANCELLED").length,
        }

        // Top selling products (by order count)
        const orderItems = await prisma.orderItem.findMany({
            select: {
                productId: true,
                quantity: true,
                price: true,
                product: {
                    select: {
                        name: true,
                        images: true,
                    }
                }
            }
        })

        const productSales: Record<string, { name: string, image: string | null, quantity: number, revenue: number }> = {}
        orderItems.forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = {
                    name: item.product.name,
                    image: item.product.images[0] || null,
                    quantity: 0,
                    revenue: 0,
                }
            }
            productSales[item.productId].quantity += item.quantity
            productSales[item.productId].revenue += item.price * item.quantity
        })

        const topProducts = Object.entries(productSales)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)

        // Low stock alerts - fetch all variants and filter in JS
        const allVariants = await prisma.productVariant.findMany({
            select: {
                id: true,
                stock: true,
                minStock: true,
                size: true,
                color: true,
                product: {
                    select: {
                        name: true,
                        images: true,
                    }
                }
            },
        })

        // Filter variants where stock <= minStock
        const lowStockVariants = allVariants
            .filter(v => v.stock === 0 || v.stock <= v.minStock)
            .slice(0, 10)

        // Sales trend (last 7 days)
        const salesTrend = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)
            const nextDay = new Date(date)
            nextDay.setDate(nextDay.getDate() + 1)

            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.createdAt)
                return orderDate >= date && orderDate < nextDay
            })

            salesTrend.push({
                date: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                orders: dayOrders.length,
                revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
            })
        }

        // Customer count
        const customerCount = await prisma.user.count({
            where: { role: "USER" }
        })

        return NextResponse.json({
            overview: {
                totalRevenue,
                totalOrders: orders.length,
                customerCount,
                averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
            },
            today: {
                orders: ordersToday.length,
                revenue: revenueToday,
            },
            thisWeek: {
                orders: ordersThisWeek.length,
                revenue: revenueThisWeek,
            },
            thisMonth: {
                orders: ordersThisMonth.length,
                revenue: revenueThisMonth,
            },
            statusBreakdown,
            topProducts,
            lowStockAlerts: lowStockVariants.map(v => ({
                id: v.id,
                productName: v.product.name,
                variant: [v.size, v.color].filter(Boolean).join(" / ") || "Default",
                image: v.product.images[0] || null,
                stock: v.stock,
                minStock: v.minStock,
            })),
            salesTrend,
        })
    } catch (error) {
        console.error("Error fetching analytics:", error)
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        )
    }
}
