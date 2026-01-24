import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ZNX-${timestamp}-${random}`
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const data = await request.json()

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      postalCode,
      paymentMethod,
      notes,
      items,
      subtotal,
      shipping,
      total,
    } = data

    // Validate payment method
    const settings = await prisma.paymentSettings.findFirst()
    if (paymentMethod === "BANK_TRANSFER" && !settings?.bankTransferEnabled) {
      return NextResponse.json(
        { error: "Bank transfer is not available" },
        { status: 400 }
      )
    }
    if (paymentMethod === "COD" && !settings?.codEnabled) {
      return NextResponse.json(
        { error: "Cash on delivery is not available" },
        { status: 400 }
      )
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.user?.id || null,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        postalCode: postalCode || null,
        subtotal,
        shipping,
        total,
        paymentMethod,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    // Update stock for each item
    for (const item of items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Order create error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
