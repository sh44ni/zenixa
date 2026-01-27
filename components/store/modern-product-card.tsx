"use client"

import Link from "next/link"
import Image from "next/image"
import { Product } from "@/types"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Star, Plus, Check } from "lucide-react"
import { useCartStore } from "@/lib/store"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface ProductCardProps {
    product: Product
}

export function ModernProductCard({ product }: ProductCardProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const addItem = useCartStore((state) => state.addItem)
    const [isAdding, setIsAdding] = useState(false)

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setIsAdding(true)
        setTimeout(() => setIsAdding(false), 1000)

        addItem(product, undefined, 1)

        toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart.`,
        })
    }

    const inStock = product.variants.some((v) => v.stock > 0)
    const rating = 4.8 // Placeholder or fetch dynamic

    return (
        <Link href={`/products/${product.slug}`} className="group block h-full">
            <div className="relative h-full bg-white rounded-[2rem] border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-primary/20">

                {/* Image Container */}
                <div className="aspect-[4/5] relative bg-secondary overflow-hidden">
                    <Image
                        src={product.images[0] || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />

                    {/* Overlay Gradient on Hover */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.comparePrice && product.comparePrice > product.price && (
                            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm">
                                -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                            </Badge>
                        )}
                        {product.featured && (
                            <Badge className="bg-white/90 backdrop-blur text-black border-0 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm">
                                Featured
                            </Badge>
                        )}
                    </div>

                    {/* Add Button - Visible on Mobile, Slide up on Desktop */}
                    {inStock && (
                        <Button
                            size="icon"
                            className={`absolute bottom-3 right-3 h-10 w-10 md:h-11 md:w-11 rounded-full shadow-lg transition-all duration-300 z-10
                opacity-100 translate-y-0
                md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0
                ${isAdding ? "bg-green-500 hover:bg-green-600" : "bg-white text-black hover:bg-primary hover:text-white"}
              `}
                            onClick={handleAddToCart}
                        >
                            {isAdding ? (
                                <Check className="h-5 w-5" />
                            ) : (
                                <Plus className="h-5 w-5" />
                            )}
                        </Button>
                    )}

                    {!inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                            <span className="bg-black/75 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <h3 className="font-bold text-base md:text-lg leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
                                {product.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase opacity-70">
                                {product.category?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium ml-1.5 text-foreground/80">{rating}</span>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-lg md:text-xl font-bold text-foreground">
                            {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                                {formatPrice(product.comparePrice)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
