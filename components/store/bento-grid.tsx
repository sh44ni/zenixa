import Link from "next/link"
import Image from "next/image"
import { Category } from "@/types"
import { ArrowRight } from "lucide-react"

interface BentoGridProps {
    categories: Category[]
}

export function BentoGrid({ categories }: BentoGridProps) {
    if (!categories || categories.length === 0) return null

    // Limit to 5 items for perfect bento (1 Large + 2 Medium + 2 Small) or similar
    const displayCategories = categories.slice(0, 5)

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[220px] md:auto-rows-[280px]">
            {displayCategories.map((category, index) => {
                // Layout Logic
                // 0: Large Square (2x2)
                // 1 & 2: Wide Rectangles (2x1) 
                // 3 & 4: Small Squares (1x1) - if space allows

                let gridClass = ""
                if (index === 0) gridClass = "md:col-span-2 md:row-span-2"
                else if (index === 1 || index === 2) gridClass = "md:col-span-2 md:row-span-1"
                else gridClass = "md:col-span-1 md:row-span-1"

                return (
                    <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        className={`group relative rounded-[2rem] overflow-hidden bg-gray-100 border border-white/20 shadow-sm ${gridClass}`}
                    >
                        <Image
                            src={category.image || "/placeholder.jpg"}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className={`font-bold text-white leading-tight mb-2 ${index === 0 ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
                                    {category.name}
                                </h3>

                                <div className="flex items-center gap-2 text-white/90 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    <span>Explore Collection</span>
                                    <div className="bg-white/20 rounded-full p-1">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )
            })}

            {/* View All Card if needed */}
            {categories.length > 5 && (
                <Link href="/categories" className="md:col-span-1 md:row-span-1 group rounded-[2rem] bg-secondary border border-border flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <div className="text-center">
                        <span className="block font-bold text-lg mb-1">View All</span>
                        <span className="text-sm text-muted-foreground">{categories.length - 5} more categories</span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-sm border opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </Link>
            )}
        </div>
    )
}
