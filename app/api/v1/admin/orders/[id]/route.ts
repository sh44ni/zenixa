import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiNotFound, apiValidationError, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"
import { dispatchWebhook } from "@/lib/webhooks"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/orders/[id]
 * Permission: orders:read
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "orders:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, images: true } },
            variant: { select: { id: true, size: true, color: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    if (!order) return withCors(apiNotFound("Order"))
    return withCors(apiSuccess(order))
  } catch (error) {
    console.error("Admin order get error:", error)
    return withCors(apiServerError())
  }
}

/**
 * PATCH /api/v1/admin/orders/[id]
 * Permission: orders:write
 *
 * Update order status and/or tracking info.
 *
 * Body:
 * {
 *   "status": "SHIPPED",
 *   "courier": "TCS",
 *   "trackingId": "TCS123456",
 *   "paymentStatus": "paid",
 *   "notes": "Shipped via TCS"
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "orders:write")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { id } = await params
    const data = await request.json()

    const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    if (data.status && !validStatuses.includes(data.status)) {
      return withCors(apiValidationError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`))
    }

    const updateData: any = {}
    if (data.status !== undefined) updateData.status = data.status
    if (data.courier !== undefined) updateData.courier = data.courier
    if (data.trackingId !== undefined) updateData.trackingId = data.trackingId
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus
    if (data.notes !== undefined) updateData.notes = data.notes

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, size: true, color: true } },
          },
        },
      },
    })

    if (data.status) {
      const event = data.status === "CANCELLED" ? "order.cancelled" as const : "order.status_changed" as const
      dispatchWebhook(event, {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
      }).catch(() => {})
    }

    return withCors(apiSuccess(order))
  } catch (error: any) {
    if (error.code === "P2025") return withCors(apiNotFound("Order"))
    console.error("Admin order update error:", error)
    return withCors(apiServerError())
  }
}
