import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiPaginated, apiServerError, parsePagination, buildMeta } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/orders
 * Permission: orders:read
 *
 * Query params:
 *   - page, per_page
 *   - status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
 *   - search (order number or customer name)
 *   - sort (newest, oldest, total_asc, total_desc)
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "orders:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const searchParams = request.nextUrl.searchParams
    const { page, perPage, skip } = parsePagination(searchParams)
    const status = searchParams.get("status")
    const search = searchParams.get("search") || ""
    const sort = searchParams.get("sort") || "newest"

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
      ]
    }

    let orderBy: any = { createdAt: "desc" }
    switch (sort) {
      case "oldest": orderBy = { createdAt: "asc" }; break
      case "total_asc": orderBy = { total: "asc" }; break
      case "total_desc": orderBy = { total: "desc" }; break
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true, images: true } },
              variant: { select: { id: true, size: true, color: true } },
            },
          },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.order.count({ where }),
    ])

    return withCors(apiPaginated(orders, buildMeta(page, perPage, total)))
  } catch (error) {
    console.error("Admin orders list error:", error)
    return withCors(apiServerError())
  }
}
