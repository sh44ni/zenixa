"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import {
    Loader2,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    AlertTriangle,
    ArrowRight,
    BarChart3
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AnalyticsData {
    overview: {
        totalRevenue: number
        totalOrders: number
        customerCount: number
        averageOrderValue: number
    }
    today: { orders: number; revenue: number }
    thisWeek: { orders: number; revenue: number }
    thisMonth: { orders: number; revenue: number }
    statusBreakdown: Record<string, number>
    topProducts: Array<{
        id: string
        name: string
        image: string | null
        quantity: number
        revenue: number
    }>
    lowStockAlerts: Array<{
        id: string
        productName: string
        variant: string
        image: string | null
        stock: number
        minStock: number
    }>
    salesTrend: Array<{
        date: string
        day: string
        orders: number
        revenue: number
    }>
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch("/api/admin/analytics")
                const result = await response.json()
                setData(result)
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load analytics",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(221,83%,53%)]" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="admin-list-card p-8 text-center">
                <p className="text-[hsl(220,9%,46%)]">Failed to load analytics</p>
            </div>
        )
    }

    const maxRevenue = Math.max(...data.salesTrend.map(d => d.revenue), 1)

    return (
        <div className="space-y-4 animate-fade-in overflow-x-hidden">
            {/* Header */}
            <div>
                <h1 className="admin-page-title">Analytics</h1>
                <p className="admin-page-subtitle hidden md:block">
                    Business performance at a glance
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="admin-stat-card revenue">
                    <div className="flex items-center justify-between">
                        <div className="admin-icon-box blue">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-3">{formatPrice(data.overview.totalRevenue)}</p>
                    <p className="text-sm text-[hsl(220,9%,46%)]">Total Revenue</p>
                </div>

                <div className="admin-stat-card orders">
                    <div className="flex items-center justify-between">
                        <div className="admin-icon-box purple">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-3">{data.overview.totalOrders}</p>
                    <p className="text-sm text-[hsl(220,9%,46%)]">Total Orders</p>
                </div>

                <div className="admin-stat-card customers">
                    <div className="flex items-center justify-between">
                        <div className="admin-icon-box orange">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-3">{data.overview.customerCount}</p>
                    <p className="text-sm text-[hsl(220,9%,46%)]">Customers</p>
                </div>

                <div className="admin-stat-card products">
                    <div className="flex items-center justify-between">
                        <div className="admin-icon-box green">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-3">{formatPrice(data.overview.averageOrderValue)}</p>
                    <p className="text-sm text-[hsl(220,9%,46%)]">Avg Order</p>
                </div>
            </div>

            {/* Period Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="admin-list-card p-4 text-center">
                    <p className="text-xs text-[hsl(220,9%,46%)] mb-1">Today</p>
                    <p className="text-lg font-bold text-[hsl(222,47%,11%)]">{data.today.orders}</p>
                    <p className="text-xs text-[hsl(142,76%,36%)]">{formatPrice(data.today.revenue)}</p>
                </div>
                <div className="admin-list-card p-4 text-center">
                    <p className="text-xs text-[hsl(220,9%,46%)] mb-1">This Week</p>
                    <p className="text-lg font-bold text-[hsl(222,47%,11%)]">{data.thisWeek.orders}</p>
                    <p className="text-xs text-[hsl(142,76%,36%)]">{formatPrice(data.thisWeek.revenue)}</p>
                </div>
                <div className="admin-list-card p-4 text-center">
                    <p className="text-xs text-[hsl(220,9%,46%)] mb-1">This Month</p>
                    <p className="text-lg font-bold text-[hsl(222,47%,11%)]">{data.thisMonth.orders}</p>
                    <p className="text-xs text-[hsl(142,76%,36%)]">{formatPrice(data.thisMonth.revenue)}</p>
                </div>
            </div>

            {/* Sales Trend Chart */}
            <div className="admin-list-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-[hsl(221,83%,53%)]" />
                    <h2 className="font-semibold text-[hsl(222,47%,11%)]">Last 7 Days</h2>
                </div>
                <div className="flex items-end justify-between gap-2 h-32">
                    {data.salesTrend.map((day) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className="w-full bg-[hsl(221,83%,53%)] rounded-t-lg transition-all"
                                style={{
                                    height: `${Math.max((day.revenue / maxRevenue) * 100, 4)}%`,
                                    minHeight: '4px'
                                }}
                            />
                            <span className="text-[10px] text-[hsl(220,9%,46%)]">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Products */}
            <div className="admin-list-card">
                <div className="flex items-center justify-between p-4 border-b border-[hsl(220,13%,91%)]">
                    <h2 className="font-semibold text-[hsl(222,47%,11%)]">Top Products</h2>
                    <Link href="/admin/products" className="text-sm text-[hsl(221,83%,53%)]">
                        View all
                    </Link>
                </div>
                {data.topProducts.length === 0 ? (
                    <div className="p-8 text-center text-[hsl(220,9%,46%)]">
                        No sales yet
                    </div>
                ) : (
                    <div className="divide-y divide-[hsl(220,13%,91%)]">
                        {data.topProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center gap-3 p-3">
                                <span className="w-5 text-center font-bold text-[hsl(220,9%,46%)]">
                                    {index + 1}
                                </span>
                                <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-[hsl(220,14%,96%)]">
                                    <Image
                                        src={product.image || "/placeholder.jpg"}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-[hsl(222,47%,11%)] truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-[hsl(220,9%,46%)]">
                                        {product.quantity} sold
                                    </p>
                                </div>
                                <span className="font-medium text-[hsl(142,76%,36%)]">
                                    {formatPrice(product.revenue)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Low Stock Alerts */}
            {data.lowStockAlerts.length > 0 && (
                <div className="admin-list-card">
                    <div className="flex items-center justify-between p-4 border-b border-[hsl(220,13%,91%)]">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <h2 className="font-semibold text-[hsl(222,47%,11%)]">Low Stock Alerts</h2>
                        </div>
                        <Link href="/admin/inventory" className="text-sm text-[hsl(221,83%,53%)]">
                            Manage
                        </Link>
                    </div>
                    <div className="divide-y divide-[hsl(220,13%,91%)]">
                        {data.lowStockAlerts.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-3">
                                <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-[hsl(220,14%,96%)]">
                                    <Image
                                        src={item.image || "/placeholder.jpg"}
                                        alt={item.productName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-[hsl(222,47%,11%)] truncate">
                                        {item.productName}
                                    </p>
                                    <p className="text-xs text-[hsl(220,9%,46%)]">
                                        {item.variant}
                                    </p>
                                </div>
                                <span className={`font-bold ${item.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {item.stock}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Order Status Breakdown */}
            <div className="admin-list-card p-4">
                <h2 className="font-semibold text-[hsl(222,47%,11%)] mb-3">Order Status</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(data.statusBreakdown).map(([status, count]) => (
                        <div key={status} className="text-center p-2 rounded-lg bg-[hsl(220,14%,96%)]">
                            <p className="font-bold text-[hsl(222,47%,11%)]">{count}</p>
                            <p className="text-[10px] text-[hsl(220,9%,46%)] capitalize">{status.toLowerCase()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
