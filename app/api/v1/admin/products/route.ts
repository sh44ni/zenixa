import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { apiSuccess, apiCreated, apiPaginated, apiValidationError, apiConflict, apiServerError, parsePagination, buildMeta } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"
import { generateSlug } from "@/lib/utils"
import { dispatchWebhook } from "@/lib/webhooks"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * GET /api/v1/admin/products
 *
 * List all products with full details. Paginated.
 * Permission: products:read
 *
 * Query params:
 *   - page, per_page, search, category (category ID), featured (true/false)
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "products:read")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const searchParams = request.nextUrl.searchParams
    const { page, perPage, skip } = parsePagination(searchParams)
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("category") || ""
    const featured = searchParams.get("featured")

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (featured === "true") where.featured = true

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
      }),
      prisma.product.count({ where }),
    ])

    return withCors(apiPaginated(products, buildMeta(page, perPage, total)))
  } catch (error) {
    console.error("Admin products list error:", error)
    return withCors(apiServerError())
  }
}

/**
 * POST /api/v1/admin/products
 *
 * Create a new product with variants.
 * Permission: products:write
 *
 * Body:
 * {
 *   "name": "Product Name",
 *   "slug": "product-name",         // optional, auto-generated from name
 *   "description": "...",
 *   "price": 1500,
 *   "comparePrice": 2000,           // optional
 *   "images": ["url1", "url2"],
 *   "categoryId": "category_id",
 *   "featured": false,
 *   "variants": [{
 *     "name": null, "size": "M", "color": "Red",
 *     "sku": "SKU-001", "stock": 50, "minStock": 5,
 *     "price": null, "priceModifier": 0, "images": []
 *   }]
 * }
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "products:write")
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const data = await request.json()
    const { name, description, price, comparePrice, images, categoryId, featured, variants } = data

    if (!name || price === undefined || !categoryId || !variants?.length) {
      return withCors(apiValidationError("name, price, categoryId, and at least one variant are required"))
    }

    const slug = generateSlug(data.slug || name)

    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) return withCors(apiConflict("Product with this slug already exists"))

    const product = await prisma.product.create({
      data: {
        name, slug, description, price,
        comparePrice: comparePrice || null,
        images: images || [],
        categoryId, featured: featured || false,
        variants: {
          create: variants.map((v: any) => ({
            name: v.name || null, size: v.size || null, color: v.color || null,
            sku: v.sku || null, stock: v.stock || 0, minStock: v.minStock ?? 5,
            price: v.price || null, comparePrice: v.comparePrice || null,
            priceModifier: v.priceModifier || 0, images: v.images || [],
          })),
        },
      },
      include: { category: true, variants: true },
    })

    dispatchWebhook("product.created", { id: product.id, name: product.name, slug: product.slug }).catch(() => {})

    return withCors(apiCreated(product))
  } catch (error) {
    console.error("Admin product create error:", error)
    return withCors(apiServerError())
  }
}
