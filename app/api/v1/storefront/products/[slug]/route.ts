import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/storefront/products/[slug]
 *
 * Get a single product by slug with full details including reviews.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { slug } = await params

    const product = await prisma.product.findUnique({
      where: { slug },
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
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!product) {
      return withCors(apiNotFound("Product"))
    }

    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null

    const transformed = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      comparePrice: product.comparePrice,
      images: product.images,
      featured: product.featured,
      category: product.category,
      variants: product.variants,
      reviews: product.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        userName: r.user.name,
        createdAt: r.createdAt,
      })),
      reviewCount: product.reviews.length,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }

    return withCors(apiSuccess(transformed))
  } catch (error) {
    console.error("Storefront product detail error:", error)
    return withCors(apiServerError())
  }
}
