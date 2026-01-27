"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, ShoppingBag, ExternalLink } from "lucide-react"

interface Order {
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: string
    items: Array<{
        quantity: number
        product: {
            name: string
            images: string[]
            slug: string
        }
    }>
}

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch("/api/account/orders")
                const data = await res.json()
                setOrders(data)
            } catch (error) {
                console.error("Failed to fetch orders")
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(221,83%,53%)]" />
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
                <Link href="/products">
                    <Button className="bg-[hsl(221,83%,53%)]">Browse Products</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-500">Track and view your order history</p>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-blue-100 transition-colors">
                        <div className="bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                                <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                                <p className="text-sm text-gray-500">
                                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link href={`/tracking?order=${order.orderNumber}`}>
                                    <Button variant="outline" size="sm" className="hidden sm:flex rounded-full">
                                        Track Order
                                    </Button>
                                </Link>
                                <Badge className={statusColors[order.status]}>{order.status}</Badge>
                                <div className="font-bold text-lg">{formatPrice(order.total)}</div>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.product.images[0] || "/placeholder.jpg"}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <Link href={`/products/${item.product.slug}`}>
                                        <Button variant="ghost" size="sm" className="text-[hsl(221,83%,53%)]">
                                            View Product
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
