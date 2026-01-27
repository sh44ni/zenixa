import { prisma } from "@/lib/prisma"
import { BentoGrid } from "@/components/store/bento-grid"

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
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">Collections</span>
        <h1 className="text-4xl md:text-6xl font-bold font-display mb-4 text-foreground">Explore Categories</h1>
        <p className="text-muted-foreground text-lg">
          Find everything you need from our wide selection of premium collections.
        </p>
      </div>

      {categories.length > 0 ? (
        <BentoGrid categories={categories as any[]} />
      ) : (
        <div className="text-center py-20 bg-secondary/20 rounded-[2.5rem]">
          <p className="text-muted-foreground text-lg">No categories found</p>
        </div>
      )}
    </div>
  )
}
