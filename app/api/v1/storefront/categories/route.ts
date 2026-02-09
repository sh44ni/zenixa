import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/storefront/categories
 *
 * List all categories with product counts.
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    })

    const transformed = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      productCount: c._count.products,
    }))

    return withCors(apiSuccess(transformed))
  } catch (error) {
    console.error("Storefront categories error:", error)
    return withCors(apiServerError())
  }
}
