import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ModernProductCard } from "@/components/store/modern-product-card"
import { BentoGrid } from "@/components/store/bento-grid"
import { DynamicHero } from "@/components/store/dynamic-hero"
import { ArrowRight, Truck, Shield, Clock, Star, Zap, Wifi } from "lucide-react"

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true },
    include: {
      category: true,
      variants: true,
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    take: 5, // Optimized for Bento (5 items)
    orderBy: { name: "asc" },
  })
}

async function getLatestProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      variants: true,
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  })
}

export default async function HomePage() {
  const [featuredProducts, categories, latestProducts] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getLatestProducts(),
  ])

  return (
    <div className="min-h-screen pb-20">
      {/* 1. Immersive Hero */}
      <DynamicHero />

      {/* 2. Marquee / Features - Minimal Scrolling Bar */}
      <section className="py-6 border-y border-border/50 bg-secondary/20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between md:justify-center md:gap-12 overflow-x-auto scrollbar-hide gap-8">
            {[
              { icon: Truck, text: "Free Delivery over PKR 5,000" },
              { icon: Shield, text: "Secure Payment" },
              { icon: Clock, text: "Fast Delivery" },
              { icon: Star, text: "Premium Quality" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-muted-foreground">
                <feature.icon className="h-4 w-4 text-primary" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Bento Grid Categories */}
      {categories.length > 0 && (
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8 md:mb-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-2">
                  Collections
                </h2>
                <p className="text-muted-foreground">
                  Curated for your lifestyle
                </p>
              </div>
              <Link href="/categories" className="hidden md:block">
                <Button variant="ghost" className="rounded-full hover:bg-secondary">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <BentoGrid categories={categories as any[]} />

            <div className="mt-8 md:hidden text-center">
              <Link href="/categories">
                <Button variant="outline" className="rounded-full w-full">View All Collections</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Products - Horizontal Scroll Mobile, Grid Desktop */}
      {featuredProducts.length > 0 && (
        <section className="py-12 md:py-20 bg-secondary/30 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                  <SparklesIcon className="h-3 w-3" /> Trending
                </div>
                <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
                  Featured Drops
                </h2>
              </div>
              <Link href="/products?featured=true">
                <Button variant="link" className="text-primary hover:text-primary/80">
                  See All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ModernProductCard product={product as any} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Latest Arrivals */}
      {latestProducts.length > 0 && (
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-2">New Arrivals</h2>
                <p className="text-muted-foreground">Fresh from the factory to your doorstep</p>
              </div>
              <Link href="/products">
                <Button className="rounded-full px-8 bg-foreground text-background hover:bg-primary hover:text-white transition-colors">
                  Shop All New
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {latestProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ModernProductCard product={product as any} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Newsletter */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-foreground/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto bg-foreground text-background rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -m-8 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -m-8 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />

            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4 relative z-10">Don't Miss the Drop</h2>
            <p className="text-background/70 mb-8 max-w-lg mx-auto relative z-10 text-lg">
              Join zenixa.club for exclusive early access to new collections and special offers.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-14 px-6 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 flex-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button size="lg" className="h-14 px-8 rounded-full bg-white text-black hover:bg-primary hover:text-white transition-colors font-bold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}
