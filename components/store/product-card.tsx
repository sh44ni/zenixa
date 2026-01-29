"use client"

import Link from "next/link"
import Image from "next/image"
import { Product } from "@/types"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Plus } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { toast } from "@/hooks/use-toast"
import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const [isAdding, setIsAdding] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Trigger animation
    setIsAdding(true)
    setTimeout(() => setIsAdding(false), 600)

    // Add product without variant for simple add to cart
    addItem(product, undefined, 1)

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist.",
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
        title: data.action === "added" ? "Added to Wishlist" : "Removed from Wishlist",
        description: data.action === "added"
          ? "This item has been saved to your wishlist."
          : "This item has been removed from your wishlist.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      })
    }
  }

  const inStock = product.variants.some((v) => v.stock > 0)

  return (
    <Link href={`/products/${product.slug}`}>
      <Card
        ref={cardRef}
        className="group overflow-hidden rounded-card glass-card border-0 transition-all duration-300 hover:shadow-glass-lg hover:-translate-y-1"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
          <Image
            src={product.images[0] || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges Container */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {/* Sale Badge */}
            {product.comparePrice && product.comparePrice > product.price && (
              <Badge className="bg-red-500 hover:bg-red-500 text-white text-[10px] px-2 py-0.5">
                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
              </Badge>
            )}

            {/* Featured Badge */}
            {product.featured && (
              <Badge className="bg-primary/90 backdrop-blur-sm text-[10px] px-2 py-0.5">
                Featured
              </Badge>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
            </div>
          )}

          {/* Wishlist Button - Top Right */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
            onClick={handleWishlist}
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </Button>

          {/* Quick Add FAB - Bottom Right */}
          {inStock && (
            <Button
              size="icon"
              className={`absolute bottom-2 right-2 h-10 w-10 rounded-full shadow-elevation-2 transition-all duration-300 ${isAdding
                ? "animate-cart-bounce bg-green-500"
                : "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                }`}
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              {isAdding ? (
                <ShoppingCart className="h-4 w-4" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3 md:p-4">
          <div className="space-y-1.5">
            {/* Category */}
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              {product.category?.name}
            </p>

            {/* Product Name */}
            <h3 className="font-semibold text-sm md:text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <p className="text-base md:text-lg font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
                {product.comparePrice && product.comparePrice > product.price && (
                  <p className="text-xs md:text-sm text-muted-foreground line-through">
                    {formatPrice(product.comparePrice)}
                  </p>
                )}
              </div>

              {/* Desktop Add to Cart (hidden on mobile - use FAB instead) */}
              {inStock && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 text-xs"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

