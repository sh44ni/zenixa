import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
} from "lucide-react"

async function getDashboardStats() {
  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    recentOrders,
    lowStockProducts,
    ordersByStatus,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.product.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: true },
        },
      },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: true },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
  ])

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalProducts,
    totalUsers,
    recentOrders,
    lowStockProducts,
    ordersByStatus,
  }
}

const statusColors: Record<string, string> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back! Here&apos;s your overview</p>
      </div>

      {/* Stats Cards - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* Revenue */}
        <div className="admin-stat-card revenue">
          <div className="flex items-start justify-between mb-3">
            <div className="admin-icon-box blue">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-[hsl(222,47%,11%)] tracking-tight">
            {formatPrice(stats.totalRevenue)}
          </p>
          <p className="text-sm text-[hsl(220,9%,46%)] mt-1">Total Revenue</p>
        </div>

        {/* Orders */}
        <div className="admin-stat-card orders">
          <div className="flex items-start justify-between mb-3">
            <div className="admin-icon-box purple">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-[hsl(222,47%,11%)] tracking-tight">
            {stats.totalOrders}
          </p>
          <p className="text-sm text-[hsl(220,9%,46%)] mt-1">Total Orders</p>
        </div>

        {/* Products */}
        <div className="admin-stat-card products">
          <div className="flex items-start justify-between mb-3">
            <div className="admin-icon-box green">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-[hsl(222,47%,11%)] tracking-tight">
            {stats.totalProducts}
          </p>
          <p className="text-sm text-[hsl(220,9%,46%)] mt-1">Products</p>
        </div>

        {/* Customers */}
        <div className="admin-stat-card customers">
          <div className="flex items-start justify-between mb-3">
            <div className="admin-icon-box orange">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-[hsl(222,47%,11%)] tracking-tight">
            {stats.totalUsers}
          </p>
          <p className="text-sm text-[hsl(220,9%,46%)] mt-1">Customers</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[hsl(222,47%,11%)] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[hsl(221,83%,53%)]" />
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-[hsl(221,83%,53%)] font-medium flex items-center gap-1"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="admin-list-card">
          {stats.recentOrders.length === 0 ? (
            <div className="admin-empty-state">
              <ShoppingCart className="icon" />
              <p className="title">No orders yet</p>
              <p className="description">Orders will appear here when customers place them</p>
            </div>
          ) : (
            stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href="/admin/orders"
                className="admin-list-item"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[hsl(222,47%,11%)]">
                      #{order.orderNumber}
                    </span>
                    <span className={`admin-badge ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[hsl(220,9%,46%)] truncate">
                      {order.customerName}
                    </span>
                    <span className="text-xs text-[hsl(220,9%,60%)]">
                      • {getRelativeTime(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[hsl(222,47%,11%)]">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[hsl(222,47%,11%)] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[hsl(38,92%,50%)]" />
              Low Stock Alert
            </h2>
            <Link
              href="/admin/products"
              className="text-sm text-[hsl(221,83%,53%)] font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="admin-list-card">
            {stats.lowStockProducts.map((variant) => (
              <div key={variant.id} className="admin-list-item">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[hsl(222,47%,11%)] truncate">
                    {variant.product.name}
                  </p>
                  <p className="text-xs text-[hsl(220,9%,46%)]">
                    {variant.size} {variant.color}
                  </p>
                </div>
                <Badge
                  variant={variant.stock === 0 ? "destructive" : "warning"}
                  className="text-xs"
                >
                  {variant.stock} left
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
