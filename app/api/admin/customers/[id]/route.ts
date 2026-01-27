import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Single customer with full details
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: params.id },
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
                        id: true,
                        orderNumber: true,
                        total: true,
                        status: true,
                        paymentMethod: true,
                        shippingAddress: true,
                        city: true,
                        createdAt: true,
                        items: {
                            select: {
                                id: true,
                                quantity: true,
                                price: true,
                                product: {
                                    select: {
                                        name: true,
                                        images: true,
                                    }
                                },
                                variant: {
                                    select: {
                                        size: true,
                                        color: true,
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
            },
        })

        if (!user) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 })
        }

        // Get unique addresses from orders
        const addresses = [...new Set(user.orders.map(o => `${o.shippingAddress}, ${o.city}`))]

        // Calculate stats
        const stats = {
            totalOrders: user.orders.length,
            totalSpent: user.orders.reduce((sum, o) => sum + o.total, 0),
            averageOrderValue: user.orders.length > 0
                ? user.orders.reduce((sum, o) => sum + o.total, 0) / user.orders.length
                : 0,
            firstOrder: user.orders[user.orders.length - 1]?.createdAt || null,
            lastOrder: user.orders[0]?.createdAt || null,
        }

        return NextResponse.json({
            customer: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                city: user.city,
                createdAt: user.createdAt,
            },
            addresses,
            orders: user.orders,
            stats,
        })
    } catch (error) {
        console.error("Error fetching customer:", error)
        return NextResponse.json(
            { error: "Failed to fetch customer" },
            { status: 500 }
        )
    }
}
