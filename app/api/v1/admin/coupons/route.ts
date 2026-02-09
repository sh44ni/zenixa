import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiCreated, apiValidationError, apiConflict, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"
import { dispatchWebhook } from "@/lib/webhooks"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/coupons
 * Permission: coupons:read
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "coupons:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
    return withCors(apiSuccess(coupons))
  } catch (error) {
    console.error("Admin coupons list error:", error)
    return withCors(apiServerError())
  }
}

/**
 * POST /api/v1/admin/coupons
 * Permission: coupons:write
 *
 * Body:
 * {
 *   "code": "SAVE10",
 *   "type": "PERCENTAGE" | "FIXED_AMOUNT",
 *   "value": 10,
 *   "startDate": "2026-01-01",    // optional
 *   "endDate": "2026-12-31",      // optional
 *   "usageLimit": 100             // optional
 * }
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "coupons:write")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const body = await request.json()
    const { code, value, type, startDate, endDate, usageLimit } = body

    if (!code || !value) {
      return withCors(apiValidationError("code and value are required"))
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        value: parseFloat(value),
        type: type || "PERCENTAGE",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      },
    })

    dispatchWebhook("coupon.created", { id: coupon.id, code: coupon.code }).catch(() => {})

    return withCors(apiCreated(coupon))
  } catch (error: any) {
    if (error.code === "P2002") return withCors(apiConflict("Coupon code already exists"))
    console.error("Admin coupon create error:", error)
    return withCors(apiServerError())
  }
}
