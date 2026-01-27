import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductForm } from "@/components/admin/product-form"

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
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
  const { id } = await params

  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <ProductForm product={product as any} categories={categories} />
    </div>
  )
}
