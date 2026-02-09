import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiPaginated, apiServerError, parsePagination, buildMeta } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/storefront/products
 *
 * List products for storefront display.
 * Supports pagination, search, category filter, and featured filter.
 *
 * Query params:
 *   - page (default: 1)
 *   - per_page (default: 20, max: 100)
 *   - search (search by name)
 *   - category (filter by category slug)
 *   - featured (true/false)
 *   - sort (newest, oldest, price_asc, price_desc)
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const searchParams = request.nextUrl.searchParams
    const { page, perPage, skip } = parsePagination(searchParams)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const featured = searchParams.get("featured")
    const sort = searchParams.get("sort") || "newest"

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.category = { slug: category }
    }

    if (featured === "true") {
      where.featured = true
    }

    // Determine sort order
    let orderBy: any = { createdAt: "desc" }
    switch (sort) {
      case "oldest": orderBy = { createdAt: "asc" }; break
      case "price_asc": orderBy = { price: "asc" }; break
      case "price_desc": orderBy = { price: "desc" }; break
      case "name_asc": orderBy = { name: "asc" }; break
      case "name_desc": orderBy = { name: "desc" }; break
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
            select: {
              id: true, name: true, size: true, color: true,
              sku: true, stock: true, price: true, comparePrice: true,
              priceModifier: true, images: true,
            },
          },
          reviews: {
            select: { rating: true },
          },
        },
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.product.count({ where }),
    ])

    // Transform: add average rating and review count
    const transformed = products.map((p) => {
      const avgRating = p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : null
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        images: p.images,
        featured: p.featured,
        category: p.category,
        variants: p.variants,
        reviewCount: p.reviews.length,
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }
    })

    return withCors(apiPaginated(transformed, buildMeta(page, perPage, total)))
  } catch (error) {
    console.error("Storefront products error:", error)
    return withCors(apiServerError())
  }
}
