import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { ArrowRight } from "lucide-react"

async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="mb-10 md:mb-14 text-center max-w-2xl mx-auto">
        <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">Collections</span>
        <h1 className="text-4xl md:text-6xl font-bold font-display mb-4 text-foreground">All Categories</h1>
        <p className="text-muted-foreground text-lg">
          Browse our complete collection of {categories.length} categories
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 border border-white/20 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={category.image || "/placeholder.jpg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-bold text-white text-2xl leading-tight mb-2">
                    {category.name}
                  </h3>

                  <p className="text-white/70 text-sm mb-3">
                    {category._count.products} {category._count.products === 1 ? 'product' : 'products'}
                  </p>

                  <div className="flex items-center gap-2 text-white/90 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span>Browse Collection</span>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Number Badge */}
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-white/80 text-xs font-medium border border-white/20">
                {String(index + 1).padStart(2, "0")}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/20 rounded-3xl">
          <p className="text-muted-foreground text-lg">No categories found</p>
        </div>
      )}
    </div>
  )
}
