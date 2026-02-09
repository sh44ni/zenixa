import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/storefront/faq
 *
 * Returns all active FAQ items, grouped by category.
 *
 * Query params:
 *   - category (optional) - Filter by category name
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const category = request.nextUrl.searchParams.get("category")

    const where: any = { isActive: true }
    if (category) where.category = category

    const faqs = await prisma.faqItem.findMany({
      where,
      orderBy: { order: "asc" },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        order: true,
      },
    })

    // Group by category
    const grouped: Record<string, typeof faqs> = {}
    for (const faq of faqs) {
      const cat = faq.category || "General"
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(faq)
    }

    return withCors(apiSuccess({
      items: faqs,
      grouped,
      totalCount: faqs.length,
    }))
  } catch (error) {
    console.error("Storefront FAQ error:", error)
    return withCors(apiServerError())
  }
}
