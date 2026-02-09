import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiValidationError, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"
import { dispatchWebhook } from "@/lib/webhooks"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/inventory
 * Permission: inventory:read
 *
 * Query params:
 *   - filter (all, low, out)
 *   - search (product name)
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "inventory:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const filter = request.nextUrl.searchParams.get("filter") || "all"
    const search = request.nextUrl.searchParams.get("search") || ""

    const where: any = {}
    if (search) where.name = { contains: search, mode: "insensitive" }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true, name: true, images: true,
        variants: { select: { id: true, size: true, color: true, sku: true, stock: true, minStock: true } },
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    })

    const inventory = products.flatMap((product) =>
      product.variants.map((variant) => {
        let status: "ok" | "low" | "out" = "ok"
        if (variant.stock === 0) status = "out"
        else if (variant.stock <= variant.minStock) status = "low"

        return {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variantLabel: [variant.size, variant.color].filter(Boolean).join(" / ") || "Default",
          sku: variant.sku,
          image: product.images[0] || null,
          category: product.category.name,
          stock: variant.stock,
          minStock: variant.minStock,
          status,
        }
      })
    )

    let filtered = inventory
    if (filter === "low") filtered = inventory.filter((i) => i.status === "low")
    else if (filter === "out") filtered = inventory.filter((i) => i.status === "out")

    const stats = {
      total: inventory.length,
      ok: inventory.filter((i) => i.status === "ok").length,
      low: inventory.filter((i) => i.status === "low").length,
      out: inventory.filter((i) => i.status === "out").length,
    }

    return withCors(apiSuccess({ inventory: filtered, stats }))
  } catch (error) {
    console.error("Admin inventory error:", error)
    return withCors(apiServerError())
  }
}

/**
 * PATCH /api/v1/admin/inventory
 * Permission: inventory:write
 *
 * Bulk update stock levels.
 *
 * Body:
 * {
 *   "updates": [
 *     { "variantId": "xxx", "stock": 100, "minStock": 10 }
 *   ]
 * }
 */
export async function PATCH(request: NextRequest) {
  const auth = await requirePermission(request, "inventory:write")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates) || updates.length === 0) {
      return withCors(apiValidationError("updates array is required"))
    }

    const results = await Promise.all(
      updates.map((u: any) =>
        prisma.productVariant.update({
          where: { id: u.variantId },
          data: {
            ...(u.stock !== undefined && { stock: u.stock }),
            ...(u.minStock !== undefined && { minStock: u.minStock }),
          },
        })
      )
    )

    dispatchWebhook("inventory.updated", {
      updatedCount: results.length,
      variants: updates.map((u: any) => u.variantId),
    }).catch(() => {})

    return withCors(apiSuccess({ updated: results.length }))
  } catch (error) {
    console.error("Admin inventory update error:", error)
    return withCors(apiServerError())
  }
}
