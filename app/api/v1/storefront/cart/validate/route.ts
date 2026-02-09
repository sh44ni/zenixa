import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiValidationError, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * POST /api/v1/storefront/cart/validate
 *
 * Validates cart items against current stock and prices.
 * Use this before checkout to ensure cart data is still valid.
 *
 * Body:
 * {
 *   "items": [
 *     { "productId": "xxx", "variantId": "yyy", "quantity": 2 }
 *   ]
 * }
 *
 * Returns validated items with current prices and stock availability.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
      return withCors(apiValidationError("items array is required and must not be empty"))
    }

    const validated = []
    const errors = []

    for (const item of items) {
      const { productId, variantId, quantity } = item

      if (!productId || !quantity || quantity < 1) {
        errors.push({ productId, error: "productId and quantity (>=1) are required" })
        continue
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true },
      })

      if (!product) {
        errors.push({ productId, error: "Product not found" })
        continue
      }

      const variant = variantId
        ? product.variants.find((v) => v.id === variantId)
        : product.variants[0]

      if (!variant) {
        errors.push({ productId, variantId, error: "Variant not found" })
        continue
      }

      const available = variant.stock >= quantity
      const effectivePrice = variant.price ?? (product.price + variant.priceModifier)

      validated.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images[0] || null,
        variantId: variant.id,
        variantLabel: [variant.size, variant.color].filter(Boolean).join(" / ") || "Default",
        requestedQuantity: quantity,
        availableStock: variant.stock,
        available,
        unitPrice: effectivePrice,
        lineTotal: effectivePrice * quantity,
      })
    }

    const subtotal = validated.reduce((sum, item) => sum + item.lineTotal, 0)

    return withCors(apiSuccess({
      items: validated,
      errors: errors.length > 0 ? errors : undefined,
      subtotal,
      itemCount: validated.reduce((sum, item) => sum + item.requestedQuantity, 0),
      allAvailable: validated.every((item) => item.available) && errors.length === 0,
    }))
  } catch (error) {
    console.error("Cart validation error:", error)
    return withCors(apiServerError())
  }
}
