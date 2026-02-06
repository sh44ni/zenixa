import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ModernProductCard } from "@/components/store/modern-product-card"
import { CategoryCarousel } from "@/components/store/category-carousel"
import { DynamicHero } from "@/components/store/dynamic-hero"
import { ArrowRight, Truck, Shield, Clock, Star, Zap, Wifi } from "lucide-react"

// Force dynamic rendering - no caching
export const revalidate = 0
export const dynamic = "force-dynamic"

interface FeatureBadge {
  icon: string
  text: string
}

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

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      where: { id: "default" }
    })
    console.log("Banner settings:", {
      enabled: settings?.promoBannerEnabled,
      image: settings?.promoBannerImage,
    })
    return settings
  } catch {
    return null
  }
}

// Default badges
const defaultBadges: FeatureBadge[] = [
  { icon: "truck", text: "Free Delivery over PKR 5,000" },
  { icon: "shield", text: "Secure Payment" },
  { icon: "clock", text: "Fast Delivery" },
  { icon: "star", text: "Premium Quality" },
]

// Icon component that supports both lucide names and custom URLs
function BadgeIcon({ icon }: { icon: string }) {
  // Check if it's a URL (custom image)
  if (icon.startsWith("http") || icon.startsWith("/")) {
    return (
      <div className="w-5 h-5 relative flex-shrink-0">
        <Image src={icon} alt="" fill className="object-contain" />
      </div>
    )
  }

  // Map lucide icon names
  const iconMap: Record<string, React.ReactNode> = {
    truck: <Truck className="h-4 w-4 text-primary" />,
    shield: <Shield className="h-4 w-4 text-primary" />,
    clock: <Clock className="h-4 w-4 text-primary" />,
    star: <Star className="h-4 w-4 text-primary" />,
    zap: <Zap className="h-4 w-4 text-primary" />,
    wifi: <Wifi className="h-4 w-4 text-primary" />,
  }

  return <>{iconMap[icon.toLowerCase()] || <Star className="h-4 w-4 text-primary" />}</>
}

export default async function HomePage() {
  const [featuredProducts, categories, latestProducts, settings] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getLatestProducts(),
    getSiteSettings(),
  ])

  // Get badges from settings or use defaults
  // If featureBadges is explicitly set (even if empty), respect that choice
  // Only use defaults if featureBadges was never configured
  const badges: FeatureBadge[] = (() => {
    try {
      // Check if settings exist and featureBadges property exists (even if empty array)
      if (settings && 'featureBadges' in settings && settings.featureBadges !== null) {
        // Return the array as-is (could be empty if user deleted all badges)
        return Array.isArray(settings.featureBadges) ? settings.featureBadges as unknown as FeatureBadge[] : []
      }
      // No settings or featureBadges not configured yet - use defaults
      return defaultBadges
    } catch {
      return defaultBadges
    }
  })()

  return (
    <div className="min-h-screen pb-20">
      {/* 1. Immersive Hero */}
      <DynamicHero />

      {/* 2. Feature Badges */}
      <section className="py-5 border-y border-border/50 bg-gradient-to-r from-secondary/30 via-secondary/10 to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between md:justify-center md:gap-10 lg:gap-16 overflow-x-auto scrollbar-hide gap-6">
            {badges.filter(b => b.text).map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 whitespace-nowrap py-1 px-3 rounded-full bg-white/50 backdrop-blur-sm border border-border/30 shadow-sm"
              >
                <BadgeIcon icon={badge.icon} />
                <span className="text-sm font-medium text-foreground">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Categories Carousel */}
      {categories.length > 0 && (
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-2">
                  Collections
                </h2>
                <p className="text-muted-foreground">
                  Curated for your lifestyle
                </p>
              </div>
            </div>

            <CategoryCarousel categories={categories as any[]} />
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
      )
      }

      {/* 5. Latest Arrivals */}
      {
        latestProducts.length > 0 && (
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
        )
      }

      {/* 6. Promotional Banner (replaces newsletter) */}
      {settings?.promoBannerEnabled && settings?.promoBannerImage && (
        <section className="py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-foreground/5" />
          <div className="container mx-auto px-4 relative">
            {settings.promoBannerLink ? (
              <Link href={settings.promoBannerLink} className="block max-w-5xl mx-auto">
                <div className="relative w-full overflow-hidden rounded-[2rem] shadow-2xl hover:shadow-3xl transition-all hover:scale-[1.01] cursor-pointer">
                  <Image
                    src={settings.promoBannerImage}
                    alt="Promotional Banner"
                    width={settings.promoBannerWidth || 1200}
                    height={settings.promoBannerHeight || 300}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </Link>
            ) : (
              <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-[2rem] shadow-2xl">
                <Image
                  src={settings.promoBannerImage}
                  alt="Promotional Banner"
                  width={settings.promoBannerWidth || 1200}
                  height={settings.promoBannerHeight || 300}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div >
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
