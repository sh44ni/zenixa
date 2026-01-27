"use client"

import Link from "next/link"
import Image from "next/image"
import { Category } from "@/types"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/products?category=${category.slug}`} className="block h-full">
      <Card className="group relative h-full overflow-hidden rounded-card border-0 glass-card transition-all duration-300 hover:shadow-glass-lg hover:-translate-y-1">
        <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden">
          <Image
            src={category.image || "/placeholder.jpg"}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
            <h3 className="font-bold text-white text-base md:text-lg leading-tight mb-1">
              {category.name}
            </h3>

            {category.description && (
              <p className="text-white/80 text-xs line-clamp-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 hidden md:block">
                {category.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-white/90 text-xs font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
              <span className="md:hidden">Shop</span>
              <span className="hidden md:inline">Shop Collection</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

