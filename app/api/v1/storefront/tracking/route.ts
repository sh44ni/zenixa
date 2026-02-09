import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiValidationError, apiNotFound, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/storefront/tracking?order_number=ZNX-xxx&email=john@example.com
 *
 * Track an order by order number and customer email.
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get("order_number")
    const email = searchParams.get("email")

    if (!orderNumber || !email) {
      return withCors(apiValidationError("order_number and email query parameters are required"))
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        customerEmail: { equals: email, mode: "insensitive" },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, images: true } },
            variant: { select: { id: true, size: true, color: true } },
          },
        },
      },
    })

    if (!order) {
      return withCors(apiNotFound("Order"))
    }

    return withCors(apiSuccess({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      courier: order.courier,
      trackingId: order.trackingId,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      items: order.items.map((i) => ({
        product: i.product,
        variant: i.variant,
        quantity: i.quantity,
        price: i.price,
      })),
      shippingAddress: order.shippingAddress,
      city: order.city,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }))
  } catch (error) {
    console.error("Order tracking error:", error)
    return withCors(apiServerError())
  }
}
