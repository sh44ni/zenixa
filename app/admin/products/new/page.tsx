import { prisma } from "@/lib/prisma"
import { ProductForm } from "@/components/admin/product-form"

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  })
}

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product for your store</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}
