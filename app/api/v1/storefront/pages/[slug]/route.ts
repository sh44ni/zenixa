import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiNotFound, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/storefront/pages/[slug]
 *
 * Get a policy page by slug (e.g., "shipping-policy", "return-policy").
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const { slug } = await params

    const page = await prisma.policyPage.findUnique({
      where: { slug },
    })

    if (!page || !page.isActive) {
      return withCors(apiNotFound("Page"))
    }

    return withCors(apiSuccess({
      slug: page.slug,
      title: page.title,
      content: page.content,
      updatedAt: page.updatedAt,
    }))
  } catch (error) {
    console.error("Storefront page error:", error)
    return withCors(apiServerError())
  }
}
