"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Product, ProductVariant } from "@/types"
import { formatPrice } from "@/lib/utils"
import { useCartStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  ChevronLeft,
} from "lucide-react"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants[0]
  )
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

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
    const variant = product.variants.find(
      (v) => v.color === color && (selectedVariant?.size ? v.size === selectedVariant.size : true)
    )
    if (variant) setSelectedVariant(variant)
  }

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const currentPrice = product.price + (selectedVariant?.priceModifier || 0)
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.variants.some((v) => v.stock > 0)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-primary"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.images[selectedImage] || "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.featured && (
              <Badge className="absolute top-4 left-4">Featured</Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square relative overflow-hidden rounded-lg bg-gray-100 ${
                    selectedImage === index ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              {product.category.name}
            </p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(currentPrice)}
            </span>
            {selectedVariant?.priceModifier !== 0 && selectedVariant?.priceModifier && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {inStock ? (
              <Badge variant="success">In Stock</Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
              <span className="ml-2 text-sm text-orange-600">
                Only {selectedVariant.stock} left!
              </span>
            )}
          </div>

          <Separator />

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Size</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size!)}
                    className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                      selectedVariant?.size === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color!)}
                    className={`px-4 py-2 border rounded-md text-sm transition-colors ${
                      selectedVariant?.color === color
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:border-primary"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={selectedVariant && quantity >= selectedVariant.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="mr-2 h-5 w-5" />
              Wishlist
            </Button>
            <Button size="lg" variant="outline" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <Separator />

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <Truck className="h-6 w-6 mx-auto text-primary" />
              <p className="text-xs">Free Delivery</p>
            </div>
            <div className="space-y-2">
              <Shield className="h-6 w-6 mx-auto text-primary" />
              <p className="text-xs">Secure Payment</p>
            </div>
            <div className="space-y-2">
              <RotateCcw className="h-6 w-6 mx-auto text-primary" />
              <p className="text-xs">Easy Returns</p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-3">
            <h2 className="font-semibold">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description || "No description available for this product."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
