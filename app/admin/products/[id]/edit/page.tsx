import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductForm } from "@/components/admin/product-form"

interface EditProductPageProps {
  params: {
    id: string
  }
}

async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
    },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  })
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories] = await Promise.all([
    getProduct(params.id),
    getCategories(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product details</p>
      </div>

      <ProductForm product={product as any} categories={categories} />
    </div>
  )
}
