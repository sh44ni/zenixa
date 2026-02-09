import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiNotFound, apiDeleted, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"
import { dispatchWebhook } from "@/lib/webhooks"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * PATCH /api/v1/admin/coupons/[id]
 * Permission: coupons:write
 *
 * Update coupon (toggle active status, update fields).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "coupons:write")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { id } = await params
    const data = await request.json()

    const updateData: any = {}
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.value !== undefined) updateData.value = parseFloat(data.value)
    if (data.type !== undefined) updateData.type = data.type
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null

    const coupon = await prisma.coupon.update({ where: { id }, data: updateData })

    dispatchWebhook("coupon.updated", { id: coupon.id, code: coupon.code }).catch(() => {})

    return withCors(apiSuccess(coupon))
  } catch (error: any) {
    if (error.code === "P2025") return withCors(apiNotFound("Coupon"))
    console.error("Admin coupon update error:", error)
    return withCors(apiServerError())
  }
}

/**
 * DELETE /api/v1/admin/coupons/[id]
 * Permission: coupons:delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "coupons:delete")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { id } = await params
    await prisma.coupon.delete({ where: { id } })

    dispatchWebhook("coupon.deleted", { id }).catch(() => {})

    return withCors(apiDeleted())
  } catch (error: any) {
    if (error.code === "P2025") return withCors(apiNotFound("Coupon"))
    console.error("Admin coupon delete error:", error)
    return withCors(apiServerError())
  }
}
