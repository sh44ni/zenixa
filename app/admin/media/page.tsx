"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
    Loader2,
    Upload,
    Trash2,
    Copy,
    ImageIcon,
    X,
    Check,
    CheckSquare,
    Grid3X3,
    List,
    Search
} from "lucide-react"
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
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import Image from "next/image"

interface MediaItem {
    id: string
    filename: string
    originalUrl: string | null
    url: string
    mimeType: string
    size: number
    width: number | null
    height: number | null
    createdAt: string
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export default function MediaLibraryPage() {
    const [media, setMedia] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // View mode
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    // Bulk selection
    const [selectMode, setSelectMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
    const [bulkDeleting, setBulkDeleting] = useState(false)

    const fetchMedia = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/media")
            const data = await response.json()
            setMedia(data.media || [])
        } catch (error) {
            console.error("Failed to fetch media:", error)
            toast({
                title: "Error",
                description: "Failed to load media library",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMedia()
    }, [fetchMedia])

    // Filter media based on search
    const filteredMedia = searchQuery.trim()
        ? media.filter(item => item.filename.toLowerCase().includes(searchQuery.toLowerCase()))
        : media

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData()
                formData.append("file", file)

                const response = await fetch("/api/admin/media", {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || "Upload failed")
                }
            }

            toast({
                title: "Success",
                description: `${files.length} file(s) uploaded`,
            })
            fetchMedia()
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Upload failed",
                variant: "destructive",
            })
        } finally {
            setUploading(false)
            e.target.value = ""
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/media/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Delete failed")
            }

            toast({
                title: "Deleted",
                description: "Media file removed",
            })
            setMedia(media.filter(m => m.id !== id))
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete media",
                variant: "destructive",
            })
        } finally {
            setDeleteId(null)
        }
    }

    const copyToClipboard = async (url: string, id: string) => {
        const fullUrl = `${window.location.origin}${url}`
        await navigator.clipboard.writeText(fullUrl)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
        toast({
            title: "Copied!",
            description: "Link copied to clipboard",
        })
    }

    // Bulk actions
    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const handleBulkDelete = async () => {
        setBulkDeleting(true)
        try {
            const response = await fetch("/api/admin/media/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            })

            if (!response.ok) throw new Error("Delete failed")

            const result = await response.json()
            toast({
                title: "Deleted",
                description: `${result.deleted} files deleted`,
            })

            exitSelectMode()
            fetchMedia()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete media",
                variant: "destructive",
            })
        } finally {
            setBulkDeleting(false)
            setShowBulkDeleteConfirm(false)
        }
    }

    const exitSelectMode = () => {
        setSelectMode(false)
        setSelectedIds(new Set())
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(221,83%,53%)]" />
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-fade-in overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="admin-page-title">Media</h1>
                    <p className="admin-page-subtitle hidden md:block">
                        {media.length} file(s) uploaded
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Select mode toggle */}
                    {media.length > 0 && (
                        <Button
                            variant={selectMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
                            className="rounded-xl"
                        >
                            {selectMode ? (
                                <>
                                    <X className="h-4 w-4 mr-1" />
                                    <span className="hidden sm:inline">Cancel</span>
                                </>
                            ) : (
                                <>
                                    <CheckSquare className="h-4 w-4 mr-1" />
                                    <span className="hidden sm:inline">Select</span>
                                </>
                            )}
                        </Button>
                    )}

                    {/* Upload */}
                    <label>
                        <button className="admin-action-btn primary" disabled={uploading}>
                            {uploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    <span className="hidden md:inline">Upload</span>
                                </>
                            )}
                        </button>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {/* Search & View Toggle */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,9%,46%)]" />
                    <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-[hsl(220,13%,91%)] bg-white"
                    />
                </div>
                <div className="flex border border-[hsl(220,13%,91%)] rounded-xl overflow-hidden">
                    <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        className="rounded-none h-12 px-4"
                        onClick={() => setViewMode("grid")}
                    >
                        <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        className="rounded-none h-12 px-4"
                        onClick={() => setViewMode("list")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Empty State */}
            {filteredMedia.length === 0 ? (
                <div className="admin-list-card">
                    <div className="admin-empty-state">
                        <ImageIcon className="icon" />
                        <p className="title">{searchQuery ? "No matching files" : "No media files"}</p>
                        <p className="description">
                            {searchQuery ? "Try a different search term" : "Upload images to get started"}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Grid View */}
                    {viewMode === "grid" && (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
                            {filteredMedia.map((item) => {
                                const selected = selectedIds.has(item.id)
                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "group relative aspect-square rounded-xl overflow-hidden bg-[hsl(220,14%,96%)] border border-[hsl(220,13%,91%)]",
                                            selected && "ring-2 ring-[hsl(221,83%,53%)]"
                                        )}
                                    >
                                        {/* Selection checkbox */}
                                        {selectMode && (
                                            <div
                                                className="absolute top-2 left-2 z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleSelect(item.id)
                                                }}
                                            >
                                                <div className="bg-white/90 backdrop-blur rounded-lg p-1 shadow-sm">
                                                    <Checkbox checked={selected} className="h-4 w-4" />
                                                </div>
                                            </div>
                                        )}

                                        {item.mimeType.includes("svg") ? (
                                            <img
                                                src={item.url}
                                                alt={item.filename}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Image
                                                src={item.url}
                                                alt={item.filename}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                            />
                                        )}

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-10 w-10 rounded-xl"
                                                onClick={() => copyToClipboard(item.url, item.id)}
                                            >
                                                {copiedId === item.id ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-10 w-10 rounded-xl"
                                                onClick={() => setDeleteId(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* File info on mobile - tap to see */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 md:hidden">
                                            <p className="text-white text-[10px] truncate">{item.filename}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === "list" && (
                        <div className="admin-list-card divide-y divide-[hsl(220,13%,91%)] overflow-x-hidden">
                            {filteredMedia.map((item) => {
                                const selected = selectedIds.has(item.id)
                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "flex items-center gap-2 p-2 w-full max-w-full",
                                            selected && "bg-[hsl(221,83%,53%,0.05)]"
                                        )}
                                    >
                                        {/* Checkbox in select mode */}
                                        {selectMode && (
                                            <div
                                                onClick={() => toggleSelect(item.id)}
                                                className="flex-shrink-0 p-1"
                                            >
                                                <Checkbox checked={selected} className="h-4 w-4" />
                                            </div>
                                        )}

                                        {/* Thumbnail */}
                                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-[hsl(220,14%,96%)] flex-shrink-0">
                                            {item.mimeType.includes("svg") ? (
                                                <img
                                                    src={item.url}
                                                    alt={item.filename}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Image
                                                    src={item.url}
                                                    alt={item.filename}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="text-sm font-medium text-[hsl(222,47%,11%)] truncate">{item.filename}</p>
                                            <p className="text-xs text-[hsl(220,9%,46%)]">
                                                {formatBytes(item.size)}
                                            </p>
                                        </div>

                                        {/* Actions - compact */}
                                        <button
                                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[hsl(220,14%,96%)] flex-shrink-0"
                                            onClick={() => copyToClipboard(item.url, item.id)}
                                        >
                                            {copiedId === item.id ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4 text-[hsl(220,9%,46%)]" />
                                            )}
                                        </button>
                                        <button
                                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 flex-shrink-0"
                                            onClick={() => setDeleteId(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-[hsl(0,84%,60%)]" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedIds.size}
                onDelete={() => setShowBulkDeleteConfirm(true)}
                onClear={exitSelectMode}
            />

            {/* Delete Single Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Media?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this file. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleDelete(deleteId)}
                            className="bg-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,55%)] rounded-xl"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation */}
            <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.size} files?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All selected files will be permanently deleted.
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
