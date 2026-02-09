import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiNotFound, apiValidationError, apiServerError, apiPaginated, parsePagination, buildMeta } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/storefront/reviews/[productId]
 *
 * Get reviews for a product. Paginated.
 *
 * Query params:
 *   - page (default: 1)
 *   - per_page (default: 10, max: 50)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { productId } = await params
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("per_page") || "10")))
    const skip = (page - 1) * perPage

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return withCors(apiNotFound("Product"))

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
      }),
      prisma.review.count({ where: { productId } }),
    ])

    // Calculate rating distribution
    const allRatings = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    })
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
    allRatings.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1 })
    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : null

    const transformed = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      userName: r.user.name,
      createdAt: r.createdAt,
    }))

    return withCors(apiSuccess({
      reviews: transformed,
      meta: buildMeta(page, perPage, total),
      summary: {
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        totalReviews: total,
        distribution,
      },
    }))
  } catch (error) {
    console.error("Storefront reviews error:", error)
    return withCors(apiServerError())
  }
}

/**
 * POST /api/v1/storefront/reviews/[productId]
 *
 * Submit a review for a product.
 *
 * Body:
 * {
 *   "userId": "user_id",
 *   "rating": 5,
 *   "title": "Great product",
 *   "comment": "Really love it!"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { productId } = await params
    const body = await request.json()
    const { userId, rating, title, comment } = body

    if (!userId || !rating || !comment) {
      return withCors(apiValidationError("userId, rating, and comment are required"))
    }
    if (rating < 1 || rating > 5) {
      return withCors(apiValidationError("rating must be between 1 and 5"))
    }

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return withCors(apiNotFound("Product"))

    // Check if user already reviewed
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    })
    if (existing) {
      return withCors(apiValidationError("You have already reviewed this product"))
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        title: title || null,
        comment,
      },
    })

    return withCors(apiSuccess({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt,
    }, 201))
  } catch (error) {
    console.error("Review creation error:", error)
    return withCors(apiServerError())
  }
}
