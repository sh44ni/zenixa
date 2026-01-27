"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { toast } from "@/hooks/use-toast"
import { generateSlug } from "@/lib/utils"
import { Plus, Pencil, Trash2, Loader2, FolderTree, Search } from "lucide-react"
import { Category } from "@/types"

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  image: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  })

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Filter categories
  const filteredCategories = searchQuery.trim()
    ? categories.filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : categories

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setValue("name", newName)
    if (!editingCategory) {
      setValue("slug", generateSlug(newName))
    }
  }

  const openCreateDialog = () => {
    setEditingCategory(null)
    reset({ name: "", slug: "", description: "", image: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: CategoryFormData) => {
    setSaving(true)
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories"
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save category")
      }

      toast({
        title: "Success",
        description: editingCategory
          ? "Category updated successfully"
          : "Category created successfully",
      })

      setDialogOpen(false)
      fetchCategories()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete category")
      }

      toast({
        title: "Success",
        description: "Category deleted successfully",
      })

      setDeleteDialogOpen(false)
      setDeletingCategory(null)
      fetchCategories()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. It may have products.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(221,83%,53%)]" />
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-subtitle hidden md:block">
            Manage product categories
          </p>
        </div>
        <button onClick={openCreateDialog} className="admin-action-btn primary">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Add Category</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,9%,46%)]" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl border-[hsl(220,13%,91%)] bg-white"
        />
      </div>

      {/* Categories */}
      {filteredCategories.length === 0 ? (
        <div className="admin-list-card">
          <div className="admin-empty-state">
            <FolderTree className="icon" />
            <p className="title">{searchQuery ? "No matching categories" : "No categories"}</p>
            <p className="description">
              {searchQuery ? "Try a different search" : "Add your first category"}
            </p>
            {!searchQuery && (
              <button onClick={openCreateDialog} className="admin-action-btn primary mt-4">
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-list-card divide-y divide-[hsl(220,13%,91%)]">
          {filteredCategories.map((category) => (
            <div key={category.id} className="flex items-center gap-3 p-3">
              {/* Image */}
              <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-[hsl(220,14%,96%)] flex-shrink-0">
                <Image
                  src={category.image || "/placeholder.jpg"}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[hsl(222,47%,11%)] truncate">{category.name}</p>
                <p className="text-xs text-[hsl(220,9%,46%)] truncate">{category.slug}</p>
                {category.description && (
                  <p className="text-xs text-[hsl(220,9%,46%)] line-clamp-1 mt-0.5 hidden md:block">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  onClick={() => openEditDialog(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl text-[hsl(0,84%,60%)]"
                  onClick={() => {
                    setDeletingCategory(category)
                    setDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl mx-4 max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update category details"
                : "Create a new product category"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  onChange={handleNameChange}
                  placeholder="Category name"
                  className="h-12 rounded-xl"
                />
                {errors.name && (
                  <p className="text-sm text-[hsl(0,84%,60%)]">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="category-slug"
                  className="h-12 rounded-xl"
                />
                {errors.slug && (
                  <p className="text-sm text-[hsl(0,84%,60%)]">{errors.slug.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Category description"
                  rows={3}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  {...register("image")}
                  placeholder="https://example.com/image.jpg"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="rounded-xl h-11">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingCategory ? "Update" : "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingCategory?.name}&quot;?
              This action cannot be undone. Categories with products cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving} className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,55%)] rounded-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
