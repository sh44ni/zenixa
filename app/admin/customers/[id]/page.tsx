"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    ShoppingBag,
    DollarSign,
    Calendar,
    Package
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CustomerData {
    customer: {
        id: string
        name: string
        email: string
        phone: string
        address: string
        city: string
        createdAt: string
    }
    addresses: string[]
    orders: Array<{
        id: string
        orderNumber: string
        total: number
        status: string
        createdAt: string
        items: Array<{
            id: string
            quantity: number
            price: number
            product: { name: string; images: string[] }
            variant: { size: string; color: string } | null
        }>
    }>
    stats: {
        totalOrders: number
        totalSpent: number
        averageOrderValue: number
        firstOrder: string | null
        lastOrder: string | null
    }
}

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
}

export default function CustomerProfilePage() {
    const params = useParams()
    const [data, setData] = useState<CustomerData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await fetch(`/api/admin/customers/${params.id}`)
                if (!response.ok) throw new Error("Not found")
                const result = await response.json()
                setData(result)
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch customer",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchCustomer()
    }, [params.id])

    const formatDate = (date: string | null) => {
        if (!date) return "N/A"
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

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
                <p className="text-[hsl(220,9%,46%)]">Customer not found</p>
                <Link href="/admin/customers">
                    <Button className="mt-4">Back to Customers</Button>
                </Link>
            </div>
        )
    }

    const { customer, addresses, orders, stats } = data

    return (
        <div className="space-y-4 animate-fade-in overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/admin/customers">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="admin-page-title">{customer.name || "Customer"}</h1>
                    <p className="admin-page-subtitle">Customer since {formatDate(customer.createdAt)}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="admin-stat-card orders">
                    <div className="flex items-center justify-between">
                        <div className="admin-icon-box purple">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-3">{stats.totalOrders}</p>
                    <p className="text-sm text-[hsl(220,9%,46%)]">Total Orders</p>
                </div>

                <div className="admin-stat-card revenue">
                    <div className="flex items-center justify-between">
                        <div className="admin-icon-box blue">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-3">{formatPrice(stats.totalSpent)}</p>
                    <p className="text-sm text-[hsl(220,9%,46%)]">Total Spent</p>
                </div>

                <div className="admin-stat-card products">
                    <div className="flex items-center justify-between">
                        <div className="admin-icon-box green">
                            <Package className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-3">{formatPrice(stats.averageOrderValue)}</p>
                    <p className="text-sm text-[hsl(220,9%,46%)]">Avg Order</p>
                </div>

                <div className="admin-stat-card customers">
                    <div className="flex items-center justify-between">
                        <div className="admin-icon-box orange">
                            <Calendar className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="text-lg font-bold mt-3">{formatDate(stats.lastOrder)}</p>
                    <p className="text-sm text-[hsl(220,9%,46%)]">Last Order</p>
                </div>
            </div>

            {/* Contact Info */}
            <div className="admin-list-card p-4">
                <h2 className="font-semibold text-[hsl(222,47%,11%)] mb-3">Contact Information</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[hsl(220,14%,96%)] flex items-center justify-center">
                            <Mail className="h-4 w-4 text-[hsl(220,9%,46%)]" />
                        </div>
                        <span className="text-sm">{customer.email}</span>
                    </div>
                    {customer.phone && (
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-[hsl(220,14%,96%)] flex items-center justify-center">
                                <Phone className="h-4 w-4 text-[hsl(220,9%,46%)]" />
                            </div>
                            <span className="text-sm">{customer.phone}</span>
                        </div>
                    )}
                    {customer.address && (
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-[hsl(220,14%,96%)] flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-[hsl(220,9%,46%)]" />
                            </div>
                            <span className="text-sm">{customer.address}, {customer.city}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Shipping Addresses */}
            {addresses.length > 0 && (
                <div className="admin-list-card p-4">
                    <h2 className="font-semibold text-[hsl(222,47%,11%)] mb-3">Shipping Addresses Used</h2>
                    <div className="space-y-2">
                        {addresses.map((addr, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-[hsl(220,9%,46%)]">
                                <MapPin className="h-3.5 w-3.5" />
                                {addr}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Order History */}
            <div className="admin-list-card">
                <div className="p-4 border-b border-[hsl(220,13%,91%)]">
                    <h2 className="font-semibold text-[hsl(222,47%,11%)]">Order History</h2>
                </div>

                {orders.length === 0 ? (
                    <div className="p-8 text-center text-[hsl(220,9%,46%)]">
                        No orders yet
                    </div>
                ) : (
                    <div className="divide-y divide-[hsl(220,13%,91%)]">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/admin/orders/${order.id}`}
                                className="block p-4 hover:bg-[hsl(220,14%,98%)] transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-[hsl(222,47%,11%)]">
                                        #{order.orderNumber}
                                    </span>
                                    <Badge className={statusColors[order.status]}>
                                        {order.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[hsl(220,9%,46%)]">
                                        {formatDate(order.createdAt)} • {order.items.length} item(s)
                                    </span>
                                    <span className="font-medium text-[hsl(222,47%,11%)]">
                                        {formatPrice(order.total)}
                                    </span>
                                </div>
                                {/* Order items preview */}
                                <div className="flex gap-2 mt-3 overflow-x-auto">
                                    {order.items.slice(0, 4).map((item) => (
                                        <div
                                            key={item.id}
                                            className="relative h-10 w-10 rounded-lg overflow-hidden bg-[hsl(220,14%,96%)] flex-shrink-0"
                                        >
                                            <Image
                                                src={item.product.images[0] || "/placeholder.jpg"}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                    {order.items.length > 4 && (
                                        <div className="h-10 w-10 rounded-lg bg-[hsl(220,14%,96%)] flex items-center justify-center text-xs font-medium text-[hsl(220,9%,46%)]">
                                            +{order.items.length - 4}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
