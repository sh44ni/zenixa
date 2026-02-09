import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiCreated, apiConflict, apiValidationError, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"
import { dispatchWebhook } from "@/lib/webhooks"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/categories
 * Permission: categories:read
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "categories:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    })

    const transformed = categories.map((c) => ({
      ...c,
      productCount: c._count.products,
      _count: undefined,
    }))

    return withCors(apiSuccess(transformed))
  } catch (error) {
    console.error("Admin categories list error:", error)
    return withCors(apiServerError())
  }
}

/**
 * POST /api/v1/admin/categories
 * Permission: categories:write
 *
 * Body: { "name": "...", "slug": "...", "description": "...", "image": "url" }
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "categories:write")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const data = await request.json()
    if (!data.name || !data.slug) {
      return withCors(apiValidationError("name and slug are required"))
    }

    const existing = await prisma.category.findUnique({ where: { slug: data.slug } })
    if (existing) return withCors(apiConflict("Category with this slug already exists"))

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
      },
    })

    dispatchWebhook("category.created", { id: category.id, name: category.name }).catch(() => {})

    return withCors(apiCreated(category))
  } catch (error) {
    console.error("Admin category create error:", error)
    return withCors(apiServerError())
  }
}
