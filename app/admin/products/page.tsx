"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, Loader2, Package, CheckSquare, X, Search, Upload, Download } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import { ProductsExportImport } from "@/components/admin/products-export-import"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminListSkeleton, AdminTableSkeleton } from "@/components/admin/admin-skeletons"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  featured: boolean
  category: { name: string }
  variants: Array<{ stock: number }>
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Filtered products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products

    const query = searchQuery.toLowerCase()
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.slug.toLowerCase().includes(query) ||
      product.category.name.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)))
    }
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    try {
      const response = await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })

      if (!response.ok) throw new Error("Delete failed")

      const result = await response.json()
      toast({
        title: "Deleted",
        description: `${result.deleted} products deleted`,
      })

      exitSelectMode()
      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete products",
        variant: "destructive",
      })
    } finally {
      setBulkDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleDeleteSingle = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Delete failed")

      toast({
        title: "Deleted",
        description: "Product deleted",
      })

      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 hidden md:block" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
        <div className="lg:hidden">
          <AdminListSkeleton />
        </div>
        <div className="hidden lg:block">
          <AdminTableSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle hidden md:block">
            Manage your inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Select mode toggle */}
          {products.length > 0 && (
            <Button
              variant={selectMode ? "default" : "outline"}
              size="sm"
              onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
              className="lg:hidden rounded-xl"
            >
              {selectMode ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Select
                </>
              )}
            </Button>
          )}
          <Link href="/admin/products/new">
            <button className="admin-action-btn primary">
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Add Product</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Search & Actions Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,9%,46%)]" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl border-[hsl(220,13%,91%)] bg-white"
          />
        </div>

        {/* Import/Export - visible on all screens */}
        <div className="flex gap-2">
          <ProductsExportImport />
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="admin-list-card">
          <div className="admin-empty-state">
            <Package className="icon" />
            <p className="title">{searchQuery ? "No matching products" : "No products found"}</p>
            <p className="description">
              {searchQuery ? "Try a different search term" : "Start by adding your first product"}
            </p>
            {!searchQuery && (
              <Link href="/admin/products/new" className="mt-4 inline-block">
                <button className="admin-action-btn primary">
                  <Plus className="h-4 w-4" />
                  Add Product
                </button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: List cards */}
          <div className="space-y-3 lg:hidden">
            {filteredProducts.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
              const selected = selectedIds.has(product.id)

              return (
                <div
                  key={product.id}
                  className={cn(
                    "admin-order-card",
                    selected && "ring-2 ring-[hsl(221,83%,53%)]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Selection checkbox */}
                    {selectMode && (
                      <div
                        className="pt-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelect(product.id)
                        }}
                      >
                        <Checkbox checked={selected} />
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-[hsl(220,14%,96%)] flex-shrink-0">
                      <Image
                        src={product.images[0] || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className="font-medium text-[hsl(222,47%,11%)] truncate">{product.name}</p>
                        {product.featured && <Badge className="text-[10px] px-1.5 py-0 h-5">Featured</Badge>}
                      </div>

                      <p className="text-xs text-[hsl(220,9%,46%)] truncate mb-1">{product.category.name}</p>

                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[hsl(222,47%,11%)]">{formatPrice(product.price)}</p>
                        <Badge variant={totalStock === 0 ? "destructive" : totalStock <= 5 ? "warning" : "secondary"} className="text-[10px] px-1.5 py-0 h-5">
                          {totalStock} units
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    {!selectMode && (
                      <div className="flex flex-col gap-1">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <button className="p-2 rounded-xl hover:bg-[hsl(220,14%,96%)] transition-colors text-[hsl(220,9%,46%)]">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          className="p-2 rounded-xl hover:bg-[hsl(0,84%,60%,0.1)] transition-colors text-[hsl(0,84%,60%)]"
                          onClick={() => handleDeleteSingle(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop: Table */}
          <div className="admin-list-card hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[hsl(220,13%,91%)]">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
                  const selected = selectedIds.has(product.id)

                  return (
                    <TableRow
                      key={product.id}
                      className={cn(
                        "border-b border-[hsl(220,13%,94%)]",
                        selected && "bg-[hsl(221,83%,53%,0.05)]"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleSelect(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-[hsl(220,14%,96%)]">
                          <Image
                            src={product.images[0] || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-[hsl(222,47%,11%)]">{product.name}</p>
                          <p className="text-sm text-[hsl(220,9%,46%)]">{product.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-[hsl(220,9%,46%)]">{product.category.name}</TableCell>
                      <TableCell className="font-medium text-[hsl(222,47%,11%)]">{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant={totalStock === 0 ? "destructive" : totalStock <= 5 ? "warning" : "success"}>
                          {totalStock} units
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.featured ? (
                          <Badge>Featured</Badge>
                        ) : (
                          <Badge variant="secondary">Regular</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="outline" size="icon" className="rounded-xl">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl"
                            onClick={() => handleDeleteSingle(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-[hsl(0,84%,60%)]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onDelete={() => setShowDeleteConfirm(true)}
        onClear={exitSelectMode}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} products?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected products and their variants will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,55%)] rounded-xl"
              disabled={bulkDeleting}
            >
              {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
