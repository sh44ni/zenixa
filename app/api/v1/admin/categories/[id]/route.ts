import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiNotFound, apiConflict, apiValidationError, apiDeleted, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"
import { dispatchWebhook } from "@/lib/webhooks"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * PUT /api/v1/admin/categories/[id]
 * Permission: categories:write
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "categories:write")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { id } = await params
    const data = await request.json()

    if (data.slug) {
      const existing = await prisma.category.findFirst({
        where: { slug: data.slug, id: { not: id } },
      })
      if (existing) return withCors(apiConflict("Category with this slug already exists"))
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
      },
    })

    dispatchWebhook("category.updated", { id: category.id, name: category.name }).catch(() => {})

    return withCors(apiSuccess(category))
  } catch (error: any) {
    if (error.code === "P2025") return withCors(apiNotFound("Category"))
    console.error("Admin category update error:", error)
    return withCors(apiServerError())
  }
}

/**
 * DELETE /api/v1/admin/categories/[id]
 * Permission: categories:delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "categories:delete")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { id } = await params
    const productsCount = await prisma.product.count({ where: { categoryId: id } })

    if (productsCount > 0) {
      return withCors(apiValidationError("Cannot delete category with products. Move or delete the products first."))
    }

    const category = await prisma.category.delete({ where: { id } })

    dispatchWebhook("category.deleted", { id, name: category.name }).catch(() => {})

    return withCors(apiDeleted())
  } catch (error: any) {
    if (error.code === "P2025") return withCors(apiNotFound("Category"))
    console.error("Admin category delete error:", error)
    return withCors(apiServerError())
  }
}
