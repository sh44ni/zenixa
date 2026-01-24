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
import { useState } from "react"
import { X } from "lucide-react"

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

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page") // Reset to page 1 on filter change
    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push("/products")
  }

  const hasFilters =
    searchParams.category ||
    searchParams.search ||
    searchParams.minPrice ||
    searchParams.maxPrice ||
    searchParams.featured

  const handlePriceFilter = () => {
    const params = new URLSearchParams(window.location.search)
    if (minPrice) {
      params.set("minPrice", minPrice)
    } else {
      params.delete("minPrice")
    }
    if (maxPrice) {
      params.set("maxPrice", maxPrice)
    } else {
      params.delete("maxPrice")
    }
    params.delete("page")
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasFilters && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Active Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchParams.category && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateFilter("category", undefined)}
              >
                {categories.find((c) => c.slug === searchParams.category)?.name}
                <X className="ml-1 h-3 w-3" />
              </Button>
            )}
            {searchParams.featured === "true" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateFilter("featured", undefined)}
              >
                Featured
                <X className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
          <Separator />
        </div>
      )}

      {/* Sort */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={searchParams.sort || "newest"}
          onValueChange={(value) => updateFilter("sort", value === "newest" ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={searchParams.category === category.slug}
                onCheckedChange={(checked) =>
                  updateFilter("category", checked ? category.slug : undefined)
                }
              />
              <label
                htmlFor={category.id}
                className="text-sm cursor-pointer hover:text-primary"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range (PKR)</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full"
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handlePriceFilter} variant="outline" size="sm" className="w-full">
          Apply Price Filter
        </Button>
      </div>

      <Separator />

      {/* Featured */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={searchParams.featured === "true"}
          onCheckedChange={(checked) =>
            updateFilter("featured", checked ? "true" : undefined)
          }
        />
        <label htmlFor="featured" className="text-sm cursor-pointer hover:text-primary">
          Featured Products Only
        </label>
      </div>
    </div>
  )
}
