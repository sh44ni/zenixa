"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Product, ProductVariant } from "@/types"
import { formatPrice } from "@/lib/utils"
import { useCartStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ProductReviews } from "@/components/store/product-reviews"
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
  ChevronDown,
  Star,
  Check,
  AlertCircle,
  Package,
  Clock,
  Headphones,
  Zap,
  Award,
  LucideIcon
} from "lucide-react"

// Icon mapping for dynamic badges
const BADGE_ICONS: Record<string, LucideIcon> = {
  truck: Truck,
  "rotate-ccw": RotateCcw,
  shield: Shield,
  package: Package,
  clock: Clock,
  headphones: Headphones,
  heart: Heart,
  star: Star,
  zap: Zap,
  award: Award,
}

interface BadgeConfig {
  icon: string
  title: string
  subtitle: string
  enabled: boolean
}

interface ProductDetailProps {
  product: Product
  colorSelectionMode?: string
  badge1?: BadgeConfig
  badge2?: BadgeConfig
}

export function ProductDetail({
  product,
  colorSelectionMode = "text",
  badge1 = { icon: "truck", title: "Free Delivery", subtitle: "Orders over PKR 5,000", enabled: true },
  badge2 = { icon: "rotate-ccw", title: "Easy Returns", subtitle: "30 Day Guarantee", enabled: true }
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants[0]
  )
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<"description" | "features">("description")
  const [isAdded, setIsAdded] = useState(false)

  const { data: session } = useSession()
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Get unique sizes and colors from variants
  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))]
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))]

  const handleSizeSelect = (size: string) => {
    const variant = product.variants.find(
      (v) => v.size === size && (selectedVariant?.color ? v.color === selectedVariant.color : true)
    )
    if (variant) setSelectedVariant(variant)
  }

  const handleColorSelect = (color: string) => {
    // Try to find a variant with the same size and new color
    let variant = product.variants.find(
      (v) => v.color === color && (selectedVariant?.size ? v.size === selectedVariant.size : true)
    )

    // If not found (e.g. this color doesn't have the current size), just find first variant with this color
    if (!variant) {
      variant = product.variants.find((v) => v.color === color)
    }

    if (variant) setSelectedVariant(variant)
  }

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)

    toast({
      description: `${product.name} added to cart!`,
      className: "bg-primary text-primary-foreground border-none"
    })
  }

  const handleWishlist = async () => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to add to wishlist.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      })

      if (!res.ok) throw new Error("Failed")
      const data = await res.json()

      toast({
        title: data.action === "added" ? "Saved" : "Removed",
        description: data.action === "added" ? "Added to your wishlist" : "Removed from wishlist",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      })
    }
  }

  // Scroll Sync
  const scrollToIndex = (index: number) => {
    setSelectedImage(index)
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      })
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth
      const scrollLeft = scrollContainerRef.current.scrollLeft
      const index = Math.round(scrollLeft / width)
      setSelectedImage(index)
    }
  }

  // Determine Price to Show
  const currentPrice = selectedVariant?.price
    ? selectedVariant.price
    : product.price + (selectedVariant?.priceModifier || 0)

  const comparePrice = selectedVariant?.comparePrice
    ? selectedVariant.comparePrice
    : product.comparePrice

  const displayImages = (selectedVariant?.images && selectedVariant.images.length > 0)
    ? selectedVariant.images
    : product.images

  // Reset selected image index when variant changes if needed
  useEffect(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      setSelectedImage(0)
    }
  }, [selectedVariant])

  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.variants.some((v) => v.stock > 0)

  return (
    <div className="pb-24 md:pb-12">
      {/* Breadcrumb */}
      <nav className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start">

        {/* Left Column: Images (Col Span 7) */}
        <div className="lg:col-span-7 w-full">
          {/* Mobile Carousel */}
          <div className="md:hidden -mx-4 relative group bg-secondary/10">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide aspect-[4/5]"
              onScroll={handleScroll}
            >
              {displayImages.length > 0 ? (
                displayImages.map((image, index) => (
                  <div key={index} className="flex-shrink-0 w-full h-full snap-center relative">
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 w-full h-full snap-center relative">
                  <Image src="/placeholder.jpg" alt={product.name} fill className="object-cover" />
                </div>
              )}
            </div>

            {/* Mobile Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {displayImages.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${selectedImage === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
              ))}
            </div>

            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {!inStock && <Badge variant="destructive">Sold Out</Badge>}
              {comparePrice && comparePrice > currentPrice && (
                <Badge className="bg-red-500 hover:bg-red-600 border-0">
                  -{Math.round(((comparePrice - currentPrice) / comparePrice) * 100)}%
                </Badge>
              )}
            </div>
          </div>

          {/* Desktop Gallery */}
          <div className="hidden md:flex flex-col gap-4 sticky top-24">
            <div className="aspect-[4/3] relative rounded-[2rem] overflow-hidden bg-secondary/10 border border-black/5 shadow-sm group">
              <Image
                src={displayImages[selectedImage] || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 cursor-zoom-in"
                priority
                sizes="(max-width: 1200px) 50vw, 40vw"
              />
              {/* Hover Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="rounded-full h-10 w-10" onClick={handleWishlist}>
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === i ? "border-primary scale-95" : "border-transparent hover:border-black/10"}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details (Col Span 5) */}
        <div className="lg:col-span-5 w-full">
          <div className="sticky top-28 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                {product.category.name}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold font-display leading-[1.1] text-foreground">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  {formatPrice(currentPrice)}
                </span>
                {comparePrice && comparePrice > currentPrice && (
                  <span className="text-lg text-muted-foreground line-through decoration-destructive/30">
                    {formatPrice(comparePrice)}
                  </span>
                )}
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Variants */}
            <div className="space-y-6">
              {colors.length > 0 && (
                <div className="space-y-4">
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Color</span>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color, idx) => {
                      const isSelected = selectedVariant?.color === color
                      const colorValue = (() => {
                        const map: Record<string, string> = {
                          // Standard Colors
                          "black": "#000000", "white": "#FFFFFF", "red": "#EF4444", "blue": "#3B82F6",
                          "green": "#22C55E", "yellow": "#EAB308", "purple": "#A855F7", "pink": "#EC4899",
                          "orange": "#F97316", "gray": "#6B7280", "grey": "#6B7280", "navy": "#1E3A8A",
                          "beige": "#F5F5DC", "brown": "#78350F", "maroon": "#800000", "teal": "#14B8A6",
                          "olive": "#808000", "tan": "#D2B48C", "mustard": "#CA8A04",

                          // Expanded Colors for Seed Data & Variations
                          "navy blue": "#1E3A8A", "dark blue": "#172554", "light blue": "#93C5FD",
                          "sky blue": "#38BDF8", "midnight blue": "#1E3A8A",
                          "space gray": "#374151", "space grey": "#374151", "silver": "#C0C0C0",
                          "gold": "#FFD700", "rose gold": "#B76E79", "bronze": "#CD7F32",
                          "cream": "#FFFDD0", "ivory": "#FFFFF0",
                          "khaki": "#F0E68C", "charcoal": "#36454F",
                          "lavender": "#E6E6FA", "indigo": "#4B0082", "violet": "#EE82EE",
                          "cyan": "#00FFFF", "magenta": "#FF00FF", "lime": "#00FF00",
                          "emerald": "#50C878", "coral": "#FF7F50", "salmon": "#FA8072",
                          "crimson": "#DC143C", "ruby": "#E0115F",
                          "chocolate": "#D2691E", "coffee": "#6F4E37",
                        }

                        const normalize = (c: string) => c.toLowerCase().trim()

                        const getHex = (c: string) => {
                          const n = normalize(c)
                          if (map[n]) return map[n]
                          // Check for partial matches like "Beige Pattern" -> "Beige"
                          const partial = Object.keys(map).find(k => n.includes(k))
                          if (partial) return map[partial]
                          // If no match, return a neutral gray as fallback
                          return "#9CA3AF"
                        }

                        // Handle dual colors like "Black/White" with a clean hard split
                        if (color?.includes('/')) {
                          const [c1, c2] = color.split('/')
                          return `linear-gradient(90deg, ${getHex(c1)} 50%, ${getHex(c2)} 50%)`
                        }

                        return getHex(color!)
                      })()

                      if (colorSelectionMode === "swatch") {
                        // Determine if color is light for proper icon visibility
                        const isLightColor = ["White", "white", "Cream", "cream", "Ivory", "ivory", "Beige", "beige", "Yellow", "yellow"].some(
                          c => color?.toLowerCase().includes(c.toLowerCase())
                        )
                        return (
                          <button
                            key={color}
                            onClick={() => handleColorSelect(color!)}
                            className={`
                               w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center shadow-sm
                               ${isSelected ? "border-primary ring-2 ring-primary ring-offset-2 scale-110" : "border-gray-200 hover:border-gray-400 hover:scale-105"}
                               ${isLightColor ? "ring-1 ring-gray-200" : ""}
                             `}
                            style={{ background: colorValue || "#eee" }}
                            title={color!}
                          >
                            {isSelected && (
                              <Check className={`h-5 w-5 drop-shadow-sm ${isLightColor ? "text-gray-800" : "text-white"}`} />
                            )}
                          </button>
                        )
                      }

                      if (colorSelectionMode === "image") {
                        // Find a variant with this color and get its first image, or fallback to product image
                        const variantWithColor = product.variants.find(v => v.color === color)
                        const variantImage = variantWithColor?.images?.[0] || product.images[0] || "/placeholder.jpg"

                        return (
                          <button
                            key={color}
                            onClick={() => handleColorSelect(color!)}
                            className={`
                               relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shadow-sm
                               ${isSelected ? "border-primary ring-2 ring-primary ring-offset-2 scale-105" : "border-gray-200 hover:border-gray-400 hover:scale-105"}
                             `}
                            title={color!}
                          >
                            <Image src={variantImage} alt={color!} fill className="object-cover" sizes="64px" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Check className="h-6 w-6 text-white drop-shadow-md" />
                              </div>
                            )}
                          </button>
                        )
                      }

                      // Default to text
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color!)}
                          className={`
                                       group relative px-6 py-3 rounded-full border text-sm font-medium transition-all duration-300
                                       ${isSelected
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                              : "border-border bg-background hover:border-foreground/30 hover:bg-secondary/50"
                            }
                                    `}
                        >
                          {color}
                          {isSelected && <Check className="absolute top-0 right-0 -mr-1 -mt-1 h-3 w-3 bg-white text-primary rounded-full p-0.5 border" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Size</span>
                    <button className="text-xs text-primary underline">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const isSelected = selectedVariant?.size === size
                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(size!)}
                          className={`
                                       w-12 h-12 flex items-center justify-center rounded-xl border text-sm font-bold transition-all
                                       ${isSelected
                              ? "border-primary bg-primary text-white shadow-md relative"
                              : "border-border bg-transparent hover:border-foreground"
                            }
                                    `}
                        >
                          {size}
                          {isSelected && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-primary rounded-full" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-2xl border border-border/50">
                <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm border p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 hover:bg-transparent"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 hover:bg-transparent"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 text-sm text-muted-foreground font-medium pl-2">
                  Total: <span className="text-foreground font-bold">{formatPrice(currentPrice * quantity)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className={`
                         w-full h-14 text-lg font-bold rounded-2xl shadow-xl transition-all duration-300
                         ${isAdded ? "bg-green-600 hover:bg-green-700" : "bg-foreground text-background hover:bg-primary hover:text-white"}
                      `}
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                {isAdded ? (
                  <span className="flex items-center gap-2"><Check className="h-5 w-5" /> Added to Cart</span>
                ) : inStock ? (
                  <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Add to Cart</span>
                ) : (
                  "Out of Stock"
                )}
              </Button>
            </div>

            {/* Guarantees */}
            {(badge1.enabled || badge2.enabled) && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                {badge1.enabled && (() => {
                  const Badge1Icon = BADGE_ICONS[badge1.icon] || Truck
                  return (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/20">
                      <div className="bg-white p-2 rounded-full shadow-sm"><Badge1Icon className="h-5 w-5 text-primary" /></div>
                      <div>
                        <h4 className="font-bold text-sm">{badge1.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{badge1.subtitle}</p>
                      </div>
                    </div>
                  )
                })()}
                {badge2.enabled && (() => {
                  const Badge2Icon = BADGE_ICONS[badge2.icon] || RotateCcw
                  return (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/20">
                      <div className="bg-white p-2 rounded-full shadow-sm"><Badge2Icon className="h-5 w-5 text-primary" /></div>
                      <div>
                        <h4 className="font-bold text-sm">{badge2.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{badge2.subtitle}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Description Accordion */}
            <div className="pt-4">
              <h3 className="font-bold mb-2 text-lg">Description</h3>
              <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {product.description || "No specific description available."}
              </div>
            </div>

            {/* Reviews Section */}
            <Separator className="my-6" />
            <ProductReviews productId={product.id} productName={product.name} />

          </div>
        </div>

      </div>

      {/* Mobile Sticky Bar */}
      <div className="md:hidden fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-40">
        <div className="bg-foreground text-background p-1.5 rounded-full shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md bg-opacity-95">
          <div className="pl-4 flex flex-col justify-center">
            <span className="text-xs text-background/70 font-medium">Total</span>
            <span className="font-bold text-sm">{formatPrice(currentPrice * quantity)}</span>
          </div>
          <Button
            size="lg"
            className="rounded-full px-8 bg-white text-black hover:bg-primary hover:text-white font-bold h-12"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {inStock ? "Add to Cart" : "Sold Out"}
          </Button>
        </div>
      </div>
    </div>
  )
}
