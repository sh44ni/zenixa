"use client"

import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Package } from "lucide-react"

interface OrderCardProps {
    order: {
        id: string
        orderNumber: string
        customerName: string
        customerEmail: string
        total: number
        status: string
        createdAt: string
        items?: Array<{
            product?: {
                name: string
                images: string[]
            }
        }>
    }
    selected?: boolean
    onSelect?: (id: string) => void
    onClick?: () => void
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    PENDING: "warning",
    CONFIRMED: "default",
    PROCESSING: "default",
    SHIPPED: "secondary",
    DELIVERED: "success",
    CANCELLED: "destructive",
}

function getRelativeTime(date: string): string {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return past.toLocaleDateString()
}

export function OrderCard({ order, selected, onSelect, onClick }: OrderCardProps) {
    const handleCheckbox = (e: React.MouseEvent) => {
        e.stopPropagation()
        onSelect?.(order.id)
    }

    return (
        <div
            className={cn(
                "bg-background rounded-xl p-4 shadow-sm border transition-all active:scale-[0.98]",
                selected && "ring-2 ring-primary border-primary",
                onClick && "cursor-pointer hover:shadow-md"
            )}
            onClick={onClick}
        >
            <div className="flex items-start gap-3">
                {/* Checkbox for selection */}
                {onSelect && (
                    <div
                        onClick={handleCheckbox}
                        className="pt-1"
                    >
                        <Checkbox checked={selected} />
                    </div>
                )}

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm">#{order.orderNumber}</span>
                        <Badge variant={statusColors[order.status]} className="text-[10px]">
                            {order.status}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="font-medium truncate">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{getRelativeTime(order.createdAt)}</p>
                        </div>
                        <p className="font-bold text-lg whitespace-nowrap">{formatPrice(order.total)}</p>
                    </div>

                    {/* Product thumbnails */}
                    {order.items && order.items.length > 0 && (
                        <div className="flex items-center gap-1 mt-3 overflow-hidden">
                            {order.items.slice(0, 4).map((item, idx) => (
                                <div
                                    key={idx}
                                    className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0"
                                >
                                    {item.product?.images[0] ? (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product?.name || "Product"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {order.items.length > 4 && (
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-muted-foreground">+{order.items.length - 4}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
