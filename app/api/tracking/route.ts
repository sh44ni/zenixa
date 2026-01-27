import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
        return NextResponse.json({ error: "Order number is required" }, { status: 400 })
    }

    try {
        const order = await prisma.order.findUnique({
            where: { orderNumber: id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                slug: true,
                                images: true
                            }
                        }
                    }
                }
            }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Sanitize and return relevant tracking info
        return NextResponse.json({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            courier: order.courier,
            trackingId: order.trackingId,
            shippingAddress: order.shippingAddress,
            city: order.city,
            total: order.total,
            items: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                image: item.product.images[0],
                slug: item.product.slug
            }))
        })
    } catch (error) {
        console.error("Tracking API Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
