import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiNotFound, apiServerError, apiPaginated, parsePagination, buildMeta } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/storefront/categories/[slug]
 *
 * Get a single category with its products (paginated).
 *
 * Query params:
 *   - page (default: 1)
 *   - per_page (default: 20, max: 100)
 *   - sort (newest, oldest, price_asc, price_desc)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    const { page, perPage, skip } = parsePagination(searchParams)
    const sort = searchParams.get("sort") || "newest"

    const category = await prisma.category.findUnique({
      where: { slug },
    })

    if (!category) {
      return withCors(apiNotFound("Category"))
    }

    let orderBy: any = { createdAt: "desc" }
    switch (sort) {
      case "oldest": orderBy = { createdAt: "asc" }; break
      case "price_asc": orderBy = { price: "asc" }; break
      case "price_desc": orderBy = { price: "desc" }; break
    }

    const where = { categoryId: category.id }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: {
            select: {
              id: true, name: true, size: true, color: true,
              stock: true, price: true, priceModifier: true, images: true,
            },
          },
          reviews: { select: { rating: true } },
        },
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.product.count({ where }),
    ])

    const transformedProducts = products.map((p) => {
      const avgRating = p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : null
      return {
        id: p.id, name: p.name, slug: p.slug, price: p.price,
        comparePrice: p.comparePrice, images: p.images, featured: p.featured,
        variants: p.variants, reviewCount: p.reviews.length,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      }
    })

    return withCors(apiSuccess({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
      },
      products: transformedProducts,
      meta: buildMeta(page, perPage, total),
    }))
  } catch (error) {
    console.error("Storefront category detail error:", error)
    return withCors(apiServerError())
  }
}
