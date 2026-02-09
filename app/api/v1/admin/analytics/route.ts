import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/analytics
 * Permission: analytics:read
 *
 * Returns comprehensive dashboard analytics: revenue, orders, customers, trends.
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "analytics:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const [orders, customerCount, productCount] = await Promise.all([
      prisma.order.findMany({
        select: { total: true, status: true, createdAt: true },
      }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count(),
    ])

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const totalOrders = orders.length

    const todayOrders = orders.filter((o) => o.createdAt >= todayStart)
    const weekOrders = orders.filter((o) => o.createdAt >= weekStart)
    const monthOrders = orders.filter((o) => o.createdAt >= monthStart)

    // Status breakdown
    const statusBreakdown: Record<string, number> = {}
    for (const order of orders) {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1
    }

    // Top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    })

    const topProductDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { id: true, name: true, slug: true, images: true, price: true },
        })
        return {
          product,
          totalQuantity: tp._sum.quantity || 0,
          totalRevenue: tp._sum.price || 0,
        }
      })
    )

    // Low stock alerts
    const lowStock = await prisma.productVariant.findMany({
      where: { OR: [{ stock: 0 }, { stock: { lte: prisma.productVariant.fields?.minStock as any } }] },
      select: {
        id: true, size: true, color: true, stock: true, minStock: true,
        product: { select: { id: true, name: true, images: true } },
      },
      take: 10,
    }).catch(() => [])

    // 7-day sales trend
    const salesTrend = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart)
      dayStart.setDate(dayStart.getDate() - i)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayOrders = orders.filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd)
      salesTrend.push({
        date: dayStart.toISOString().split("T")[0],
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      })
    }

    return withCors(apiSuccess({
      overview: {
        totalRevenue,
        totalOrders,
        customerCount,
        productCount,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      },
      periods: {
        today: { orders: todayOrders.length, revenue: todayOrders.reduce((s, o) => s + o.total, 0) },
        week: { orders: weekOrders.length, revenue: weekOrders.reduce((s, o) => s + o.total, 0) },
        month: { orders: monthOrders.length, revenue: monthOrders.reduce((s, o) => s + o.total, 0) },
      },
      statusBreakdown,
      topProducts: topProductDetails,
      lowStockAlerts: lowStock,
      salesTrend,
    }))
  } catch (error) {
    console.error("Admin analytics error:", error)
    return withCors(apiServerError())
  }
}
