import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/customers/[id]
 * Permission: customers:read
 *
 * Get detailed customer profile with orders and addresses.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "customers:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, city: true, address: true, createdAt: true,
        orders: {
          select: {
            id: true, orderNumber: true, total: true, status: true, paymentMethod: true, createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        addresses: {
          select: { id: true, name: true, address: true, city: true, phone: true, isDefault: true },
        },
        reviews: {
          select: {
            id: true, rating: true, comment: true, createdAt: true,
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    })

    if (!user) return withCors(apiNotFound("Customer"))

    return withCors(apiSuccess({
      ...user,
      orderCount: user.orders.length,
      totalSpent: user.orders.reduce((sum, o) => sum + o.total, 0),
    }))
  } catch (error) {
    console.error("Admin customer detail error:", error)
    return withCors(apiServerError())
  }
}
