import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductDetail } from "@/components/store/product-detail"
import { ModernProductCard } from "@/components/store/modern-product-card"
import type { Metadata } from "next"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: true,
    },
  })
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
  return prisma.product.findMany({
    where: {
      categoryId,
      id: { not: currentProductId },
    },
    include: {
      category: true,
      variants: true,
    },
    take: 4,
  })
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name} - Zenixa`,
    description: product.description || `Shop ${product.name} at Zenixa`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id)

  const siteSettings = await prisma.siteSettings.findFirst({ where: { id: "default" } })

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail
        product={product as any}
        colorSelectionMode={siteSettings?.colorSelectionMode || "text"}
        badge1={{
          icon: siteSettings?.productBadge1Icon || "truck",
          title: siteSettings?.productBadge1Title || "Free Delivery",
          subtitle: siteSettings?.productBadge1Subtitle || "Orders over PKR 5,000",
          enabled: siteSettings?.productBadge1Enabled ?? true,
        }}
        badge2={{
          icon: siteSettings?.productBadge2Icon || "rotate-ccw",
          title: siteSettings?.productBadge2Title || "Easy Returns",
          subtitle: siteSettings?.productBadge2Subtitle || "30 Day Guarantee",
          enabled: siteSettings?.productBadge2Enabled ?? true,
        }}
      />

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((product) => (
              <ModernProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
