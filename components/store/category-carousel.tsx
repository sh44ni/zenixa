"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Category } from "@/types"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CategoryCarouselProps {
    categories: Category[]
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    useEffect(() => {
        checkScrollButtons()
        const el = scrollRef.current
        if (el) {
            el.addEventListener("scroll", checkScrollButtons)
            window.addEventListener("resize", checkScrollButtons)
            return () => {
                el.removeEventListener("scroll", checkScrollButtons)
                window.removeEventListener("resize", checkScrollButtons)
            }
        }
    }, [])

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 340 // Card width + gap
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            })
        }
    }

    if (!categories || categories.length === 0) return null

    return (
        <div className="relative group/carousel">
            {/* Scroll Buttons */}
            {canScrollLeft && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full shadow-lg border bg-white/90 backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                    onClick={() => scroll("left")}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
            )}
            {canScrollRight && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full shadow-lg border bg-white/90 backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                    onClick={() => scroll("right")}
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            )}

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mb-4 px-1"
                style={{ scrollSnapType: "x mandatory" }}
            >
                {categories.map((category, index) => (
                    <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        className="group relative flex-shrink-0 w-[280px] sm:w-[320px] h-[360px] sm:h-[400px] rounded-3xl overflow-hidden bg-gray-100 border border-white/20 shadow-md hover:shadow-xl transition-shadow duration-300"
                        style={{ scrollSnapAlign: "start" }}
                    >
                        <Image
                            src={category.image || "/placeholder.jpg"}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            sizes="320px"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="font-bold text-white text-2xl sm:text-3xl leading-tight mb-3">
                                    {category.name}
                                </h3>

                                <div className="flex items-center gap-2 text-white/90 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    <span>Explore Collection</span>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Number Badge */}
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-white/80 text-xs font-medium border border-white/20">
                            {String(index + 1).padStart(2, "0")}
                        </div>
                    </Link>
                ))}

                {/* View All Card */}
                <Link
                    href="/categories"
                    className="group relative flex-shrink-0 w-[200px] sm:w-[240px] h-[360px] sm:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 flex items-center justify-center hover:border-primary/50 hover:from-primary/15 hover:to-primary/10 transition-all duration-300"
                    style={{ scrollSnapAlign: "start" }}
                >
                    <div className="text-center px-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <ArrowRight className="h-8 w-8 text-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                        <span className="block font-bold text-xl mb-2">View All</span>
                        <span className="text-sm text-muted-foreground">
                            Browse all categories
                        </span>
                    </div>
                </Link>
            </div>

            {/* Scroll Indicators */}
            <div className="flex justify-center gap-1.5 mt-6">
                {categories.map((_, i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/20"
                    />
                ))}
            </div>
        </div>
    )
}
