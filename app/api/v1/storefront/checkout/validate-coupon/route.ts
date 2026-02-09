import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiValidationError, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/storefront/checkout/validate-coupon?code=SAVE10&subtotal=5000
 *
 * Validates a coupon code and returns discount details.
 *
 * Query params:
 *   - code (required) - The coupon code
 *   - subtotal (required) - Current cart subtotal for discount calculation
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const subtotal = parseFloat(searchParams.get("subtotal") || "0")

    if (!code) {
      return withCors(apiValidationError("code query parameter is required"))
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return withCors(apiSuccess({ valid: false, reason: "Coupon not found" }))
    }

    if (!coupon.isActive) {
      return withCors(apiSuccess({ valid: false, reason: "Coupon is inactive" }))
    }

    const now = new Date()
    if (coupon.startDate && coupon.startDate > now) {
      return withCors(apiSuccess({ valid: false, reason: "Coupon is not yet active" }))
    }
    if (coupon.endDate && coupon.endDate < now) {
      return withCors(apiSuccess({ valid: false, reason: "Coupon has expired" }))
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return withCors(apiSuccess({ valid: false, reason: "Coupon usage limit reached" }))
    }

    const discount = coupon.type === "PERCENTAGE"
      ? subtotal * (coupon.value / 100)
      : coupon.value

    return withCors(apiSuccess({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.min(discount, subtotal),
      newSubtotal: Math.max(0, subtotal - discount),
    }))
  } catch (error) {
    console.error("Coupon validation error:", error)
    return withCors(apiServerError())
  }
}
