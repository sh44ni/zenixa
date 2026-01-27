import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function escapeCSV(value: string | null | undefined): string {
    if (value === null || value === undefined) return ""
    const str = String(value)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        // Create CSV header
        const headers = [
            "Order Number",
            "Date",
            "Customer Name",
            "Email",
            "Phone",
            "Address",
            "City",
            "Postal Code",
            "Items",
            "Subtotal",
            "Shipping",
            "Total",
            "Payment Method",
            "Payment Status",
            "Order Status",
            "Notes",
        ]

        // Create CSV rows
        const rows = orders.map((order) => {
            const itemsSummary = order.items
                .map((item) => {
                    let name = item.product.name
                    if (item.variant) {
                        const parts = []
                        if (item.variant.size) parts.push(item.variant.size)
                        if (item.variant.color) parts.push(item.variant.color)
                        if (parts.length > 0) name += ` (${parts.join(", ")})`
                    }
                    return `${name} x${item.quantity}`
                })
                .join("; ")

            return [
                escapeCSV(order.orderNumber),
                escapeCSV(new Date(order.createdAt).toLocaleDateString()),
                escapeCSV(order.customerName),
                escapeCSV(order.customerEmail),
                escapeCSV(order.customerPhone),
                escapeCSV(order.shippingAddress),
                escapeCSV(order.city),
                escapeCSV(order.postalCode),
                escapeCSV(itemsSummary),
                escapeCSV(order.subtotal.toString()),
                escapeCSV(order.shipping.toString()),
                escapeCSV(order.total.toString()),
                escapeCSV(order.paymentMethod),
                escapeCSV(order.paymentStatus),
                escapeCSV(order.status),
                escapeCSV(order.notes),
            ].join(",")
        })

        const csv = [headers.join(","), ...rows].join("\n")

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        })
    } catch (error) {
        console.error("Orders export error:", error)
        return NextResponse.json(
            { error: "Failed to export orders" },
            { status: 500 }
        )
    }
}
