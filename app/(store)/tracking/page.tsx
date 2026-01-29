"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Package, CheckCircle2, Truck, MapPin, AlertCircle, ShoppingBag } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import Image from "next/image"

// Define status steps for the timeline
const TIMELINE_STEPS = [
    { id: "PENDING", label: "Order Placed", icon: ShoppingBag },
    { id: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
    { id: "PROCESSING", label: "Processing", icon: Package },
    { id: "SHIPPED", label: "Shipped", icon: Truck },
    { id: "DELIVERED", label: "Delivered", icon: MapPin },
]

function TrackingContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const initialOrderId = searchParams.get("order") || ""

    const [orderId, setOrderId] = useState(initialOrderId)
    const [loading, setLoading] = useState(false)
    const [order, setOrder] = useState<any>(null)
    const [error, setError] = useState("")

    const fetchOrder = async (id: string) => {
        if (!id) return
        setLoading(true)
        setError("")
        setOrder(null)

        try {
            const res = await fetch(`/api/tracking?id=${id}`)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Order not found")
            }
            setOrder(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Auto-search if URL has param
    useEffect(() => {
        if (initialOrderId) {
            fetchOrder(initialOrderId)
        }
    }, [initialOrderId])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (orderId.trim()) {
            router.push(`/tracking?order=${orderId.trim()}`)
        }
    }

    // Calculate current step index
    const getCurrentStepIndex = (status: string) => {
        return TIMELINE_STEPS.findIndex(step => step.id === status)
    }

    const currentStepIndex = order ? getCurrentStepIndex(order.status) : -1
    const isCancelled = order?.status === "CANCELLED"

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl min-h-[60vh]">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
                <p className="text-muted-foreground">Enter your order number to check the status</p>
            </div>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Order Number (e.g. ZNX-123...)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-8">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            )}

            {order && (
                <div className="space-y-6 animate-fade-in">
                    {/* Status Timeline */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <CardTitle>Order Status</CardTitle>
                                <Badge variant={isCancelled ? "destructive" : "outline"} className="text-sm">
                                    {order.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isCancelled ? (
                                <div className="text-center py-6 text-red-600">
                                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="font-medium">This order has been cancelled.</p>
                                </div>
                            ) : (
                                <div className="relative py-8">
                                    {/* Progress Line */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 hidden md:block" />

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                                        {TIMELINE_STEPS.map((step, index) => {
                                            const Icon = step.icon
                                            const isComputable = currentStepIndex !== -1
                                            const isCompleted = isComputable && index <= currentStepIndex
                                            const isCurrent = isComputable && index === currentStepIndex

                                            return (
                                                <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1 relative bg-white md:bg-transparent z-10 w-full md:w-auto">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm border-2",
                                                        isCompleted
                                                            ? "bg-[hsl(221,83%,53%)] border-[hsl(221,83%,53%)] text-white"
                                                            : "bg-white border-gray-200 text-gray-400"
                                                    )}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className={cn(
                                                            "text-sm font-medium transition-colors",
                                                            isCompleted ? "text-[hsl(222,47%,11%)]" : "text-gray-400",
                                                            isCurrent && "text-[hsl(221,83%,53%)] font-bold"
                                                        )}>
                                                            {step.label}
                                                        </p>
                                                        {isCurrent && (
                                                            <p className="text-xs text-muted-foreground md:absolute md:-bottom-6 md:left-1/2 md:-translate-x-1/2 whitespace-nowrap">
                                                                Current Status
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipment Details */}
                    {(order.courier || order.trackingId) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-[hsl(221,83%,53%)]" />
                                    Shipment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Courier Service</p>
                                    <p className="font-medium text-lg">{order.courier || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Tracking ID</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-mono font-medium text-lg bg-gray-50 px-2 py-1 rounded">
                                            {order.trackingId || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Order Summary & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Address */}
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-base">Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {order.shippingAddress}
                                    <br />
                                    <span className="font-medium text-gray-900">{order.city}</span>
                                </p>
                            </CardContent>
                        </Card>

                        {/* Items */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base">Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.items.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="relative h-14 w-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.image || "/placeholder.jpg"}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate text-sm">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <Separator />
                                    <div className="flex justify-between font-bold pt-2">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function TrackingPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8 max-w-3xl min-h-[60vh]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <TrackingContent />
        </Suspense>
    )
}

