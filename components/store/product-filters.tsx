"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { X, SlidersHorizontal, ArrowUpDown } from "lucide-react"

interface ProductFiltersProps {
  categories: Category[]
  searchParams: {
    category?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    featured?: string
    sort?: string
  }
}

export function ProductFilters({ categories, searchParams }: ProductFiltersProps) {
  const router = useRouter()
  const [minPrice, setMinPrice] = useState(searchParams.minPrice || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice || "")
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Update effect to close mobile dialog on navigation
  useEffect(() => {
    setIsMobileOpen(false)
  }, [searchParams])

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push("/products")
    setIsMobileOpen(false)
  }

  const handlePriceFilter = () => {
    const params = new URLSearchParams(window.location.search)
    if (minPrice) params.set("minPrice", minPrice)
    else params.delete("minPrice")

    if (maxPrice) params.set("maxPrice", maxPrice)
    else params.delete("maxPrice")

    params.delete("page")
    router.push(`/products?${params.toString()}`)
    setIsMobileOpen(false)
  }

  const hasFilters = searchParams.category || searchParams.minPrice || searchParams.maxPrice || searchParams.featured

  // Reusable Filter Content
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort - Only shown inside sidebar on desktop if we remove it from top bar, but typically Sort is top. 
           We'll keep sort separate or include here. Let's include here for mobile simplicity. */}

      <div className="space-y-3">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={searchParams.category === category.slug}
                onCheckedChange={(checked) =>
                  updateFilter("category", checked ? category.slug : undefined)
                }
              />
              <label
                htmlFor={`cat-${category.id}`}
                className="text-sm cursor-pointer hover:text-primary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Price Range</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">PKR</span>
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">PKR</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        <Button onClick={handlePriceFilter} variant="outline" size="sm" className="w-full h-8 text-xs">
          Apply
        </Button>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured-filter"
            checked={searchParams.featured === "true"}
            onCheckedChange={(checked) =>
              updateFilter("featured", checked ? "true" : undefined)
            }
          />
          <label htmlFor="featured-filter" className="text-sm cursor-pointer hover:text-primary font-medium">
            Featured Products Only
          </label>
        </div>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full text-destructive hover:text-destructive/80">
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden flex items-center justify-between gap-2 mb-4">
        <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters {hasFilters ? "(Active)" : ""}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] rounded-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <FilterContent />
            </div>
          </DialogContent>
        </Dialog>

        {/* Mobile Sort */}
        <Select
          value={searchParams.sort || "newest"}
          onValueChange={(value) => updateFilter("sort", value === "newest" ? undefined : value)}
        >
          <SelectTrigger className="w-[140px] h-9">
            <span className="flex items-center text-xs"><ArrowUpDown className="mr-2 h-3 w-3" /> Sort</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low - High</SelectItem>
            <SelectItem value="price-desc">Price: High - Low</SelectItem>
            <SelectItem value="name">Name: A - Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display">Filters</h2>
        </div>
        <FilterContent />
      </div>
    </>
  )
}
