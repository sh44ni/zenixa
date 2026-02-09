import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiNotFound, apiConflict, apiValidationError, apiDeleted, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"
import { generateSlug } from "@/lib/utils"
import { dispatchWebhook } from "@/lib/webhooks"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/products/[id]
 * Permission: products:read
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "products:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    })
    if (!product) return withCors(apiNotFound("Product"))
    return withCors(apiSuccess(product))
  } catch (error) {
    console.error("Admin product get error:", error)
    return withCors(apiServerError())
  }
}

/**
 * PUT /api/v1/admin/products/[id]
 * Permission: products:write
 *
 * Updates a product and replaces all variants.
 * Same body as POST /api/v1/admin/products.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "products:write")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { id } = await params
    const data = await request.json()
    const { name, description, price, comparePrice, images, categoryId, featured, variants } = data

    if (!name || price === undefined) {
      return withCors(apiValidationError("name and price are required"))
    }

    const slug = generateSlug(data.slug || name)

    const existingSlug = await prisma.product.findFirst({
      where: { slug, id: { not: id } },
    })
    if (existingSlug) return withCors(apiConflict("Product with this slug already exists"))

    // Delete existing variants and recreate
    await prisma.productVariant.deleteMany({ where: { productId: id } })

    const product = await prisma.product.update({
      where: { id },
      data: {
        name, slug, description, price,
        comparePrice: comparePrice || null,
        images: images || [],
        categoryId, featured: featured ?? false,
        variants: variants ? {
          create: variants.map((v: any) => ({
            name: v.name || null, size: v.size || null, color: v.color || null,
            sku: v.sku || null, stock: v.stock || 0, minStock: v.minStock ?? 5,
            price: v.price || null, comparePrice: v.comparePrice || null,
            priceModifier: v.priceModifier || 0, images: v.images || [],
          })),
        } : undefined,
      },
      include: { category: true, variants: true },
    })

    dispatchWebhook("product.updated", { id: product.id, name: product.name, slug: product.slug }).catch(() => {})

    return withCors(apiSuccess(product))
  } catch (error) {
    console.error("Admin product update error:", error)
    return withCors(apiServerError())
  }
}

/**
 * DELETE /api/v1/admin/products/[id]
 * Permission: products:delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "products:delete")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { id } = await params
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return withCors(apiNotFound("Product"))

    await prisma.product.delete({ where: { id } })

    dispatchWebhook("product.deleted", { id, name: product.name, slug: product.slug }).catch(() => {})

    return withCors(apiDeleted())
  } catch (error) {
    console.error("Admin product delete error:", error)
    return withCors(apiServerError())
  }
}
