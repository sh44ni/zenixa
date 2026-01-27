"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2, Heart, ShoppingCart, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface WishlistItem {
    id: string
    product: {
        id: string
        name: string
        slug: string
        price: string
        images: string[]
        category: { name: string }
    }
}

export default function WishlistPage() {
    const [items, setItems] = useState<WishlistItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchWishlist = async () => {
        try {
            const res = await fetch("/api/wishlist")
            const data = await res.json()
            setItems(data)
        } catch (error) {
            console.error("Failed to fetch wishlist")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWishlist()
    }, [])

    const removeFromWishlist = async (productId: string) => {
        try {
            await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
            })

            setItems(items.filter(item => item.product.id !== productId))
            toast({ title: "Removed from wishlist" })
        } catch (error) {
            toast({ title: "Failed to remove", variant: "destructive" })
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(221,83%,53%)]" />
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-10 w-10 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-6">Save items you love to revisit later.</p>
                <Link href="/products">
                    <Button className="bg-[hsl(221,83%,53%)]">Explore Products</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-500">{items.length} items saved</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="relative aspect-square bg-gray-100">
                            <Image
                                src={item.product.images[0] || "/placeholder.jpg"}
                                alt={item.product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <button
                                onClick={() => removeFromWishlist(item.product.id)}
                                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                            >
                                <Heart className="h-4 w-4 fill-current" />
                            </button>
                        </div>

                        <div className="p-4">
                            <p className="text-xs text-gray-500 mb-1">{item.product.category.name}</p>
                            <h3 className="font-medium text-gray-900 truncate mb-2">{item.product.name}</h3>
                            <div className="flex items-center justify-between mt-4">
                                <span className="font-bold text-lg">{formatPrice(Number(item.product.price))}</span>

                                <Link href={`/products/${item.product.slug}`}>
                                    <Button size="sm" className="rounded-xl h-9">
                                        <ShoppingCart className="h-4 w-4 mr-1.5" />
                                        Add
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
