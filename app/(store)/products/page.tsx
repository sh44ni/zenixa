import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { ModernProductCard } from "@/components/store/modern-product-card"
import { ProductFilters } from "@/components/store/product-filters"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchParams {
  category?: string
  search?: string
  minPrice?: string
  maxPrice?: string
  featured?: string
  sort?: string
  page?: string
}

interface ProductsPageProps {
  searchParams: Promise<SearchParams>
}

async function getProducts(searchParams: SearchParams) {
  const { category, search, minPrice, maxPrice, featured, sort, page } = searchParams
  const currentPage = parseInt(page || "1")
  const pageSize = 12

  const where: any = {}

  if (category) {
    where.category = { slug: category }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }

  if (featured === "true") {
    where.featured = true
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "price-asc") orderBy = { price: "asc" }
  if (sort === "price-desc") orderBy = { price: "desc" }
  if (sort === "name") orderBy = { name: "asc" }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
      },
      orderBy,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage,
  }
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  })
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams
  const [{ products, total, totalPages, currentPage }, categories] = await Promise.all([
    getProducts(resolvedSearchParams),
    getCategories(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <ProductFilters categories={categories as any} searchParams={resolvedSearchParams} />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {resolvedSearchParams.search
                  ? `Search results for "${resolvedSearchParams.search}"`
                  : resolvedSearchParams.category
                    ? categories.find((c) => c.slug === resolvedSearchParams.category)?.name || "Products"
                    : resolvedSearchParams.featured === "true"
                      ? "Featured Products"
                      : "All Products"}
              </h1>
              <p className="text-muted-foreground">
                Showing {products.length} of {total} products
              </p>
            </div>
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ModernProductCard key={product.id} product={product as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                  <a
                    key={i}
                    href={`/products?${new URLSearchParams({
                      ...resolvedSearchParams,
                      page: String(i + 1),
                    } as Record<string, string>)}`}
                    className={`px-4 py-2 rounded-md ${currentPage === i + 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                      }`}
                  >
                    {i + 1}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
