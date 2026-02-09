import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiServerError, apiPaginated, parsePagination, buildMeta } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/customers
 * Permission: customers:read
 *
 * Query params:
 *   - page, per_page
 *   - search (name, email, phone)
 *   - sort (newest, name, orders, spent)
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "customers:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const searchParams = request.nextUrl.searchParams
    const { page, perPage, skip } = parsePagination(searchParams)
    const search = searchParams.get("search") || ""
    const sort = searchParams.get("sort") || "newest"

    const where: any = { role: "USER" }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, city: true, createdAt: true,
          orders: {
            select: { id: true, total: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
      }),
      prisma.user.count({ where }),
    ])

    let customers = users.map((u) => ({
      id: u.id,
      name: u.name || "N/A",
      email: u.email,
      phone: u.phone || "N/A",
      city: u.city || "N/A",
      orderCount: u.orders.length,
      totalSpent: u.orders.reduce((sum, o) => sum + o.total, 0),
      lastOrder: u.orders[0]?.createdAt || null,
      createdAt: u.createdAt,
    }))

    // Sort
    switch (sort) {
      case "name": customers.sort((a, b) => a.name.localeCompare(b.name)); break
      case "orders": customers.sort((a, b) => b.orderCount - a.orderCount); break
      case "spent": customers.sort((a, b) => b.totalSpent - a.totalSpent); break
    }

    return withCors(apiPaginated(customers, buildMeta(page, perPage, total)))
  } catch (error) {
    console.error("Admin customers list error:", error)
    return withCors(apiServerError())
  }
}
