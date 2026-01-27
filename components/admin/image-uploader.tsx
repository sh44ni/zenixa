"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Upload, Link as LinkIcon, Loader2, X, ImageIcon, Plus } from "lucide-react"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface ImageUploaderProps {
    images: string[]
    onChange: (images: string[]) => void
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [importUrl, setImportUrl] = useState("")
    const [importing, setImporting] = useState(false)
    const [showUrlDialog, setShowUrlDialog] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const newUrls: string[] = []

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

                const media = await response.json()
                newUrls.push(media.url)
            }

            onChange([...images, ...newUrls])
            toast({
                title: "Uploaded!",
                description: `${files.length} image(s) added`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Upload failed",
                variant: "destructive",
            })
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const handleImportUrl = async () => {
        if (!importUrl.trim()) return

        setImporting(true)
        try {
            const response = await fetch("/api/admin/media/from-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: importUrl }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Import failed")
            }

            const media = await response.json()
            onChange([...images, media.url])

            toast({
                title: "Imported!",
                description: "Image downloaded and saved",
            })
            setImportUrl("")
            setShowUrlDialog(false)
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Import failed",
                variant: "destructive",
            })
        } finally {
            setImporting(false)
        }
    }

    const handleAddUrl = () => {
        if (!importUrl.trim()) return
        // Just add the URL directly without downloading
        onChange([...images, importUrl.trim()])
        setImportUrl("")
        setShowUrlDialog(false)
        toast({
            title: "Added",
            description: "Image URL added",
        })
    }

    const removeImage = (index: number) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        onChange(newImages)
    }

    const moveImage = (index: number, direction: "up" | "down") => {
        const newImages = [...images]
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= newImages.length) return
            ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
        onChange(newImages)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <label>
                    <Button type="button" variant="outline" asChild disabled={uploading}>
                        <span className="cursor-pointer">
                            {uploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Upload Images
                        </span>
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                </label>

                <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Add from URL
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Image from URL</DialogTitle>
                            <DialogDescription>
                                Paste any image URL (Unsplash, etc.). It will be saved to your Media Library.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="https://images.unsplash.com/..."
                                value={importUrl}
                                onChange={(e) => setImportUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleImportUrl()}
                            />
                            <Button
                                type="button"
                                onClick={handleImportUrl}
                                disabled={importing || !importUrl.trim()}
                                className="w-full"
                            >
                                {importing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving to Media Library...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Add Image
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                                Images are automatically downloaded and stored locally
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Image Grid */}
            {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((url, index) => (
                        <div
                            key={index}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 group ${index === 0 ? "ring-2 ring-primary ring-offset-2" : ""
                                }`}
                        >
                            <Image
                                src={url}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                                }}
                            />

                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <div className="flex gap-1">
                                    {index > 0 && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8"
                                            onClick={() => moveImage(index, "up")}
                                        >
                                            ↑
                                        </Button>
                                    )}
                                    {index < images.length - 1 && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8"
                                            onClick={() => moveImage(index, "down")}
                                        >
                                            ↓
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="h-8 w-8"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Main badge */}
                            {index === 0 && (
                                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                                    Main
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Add more placeholder */}
                    <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                        <Plus className="h-8 w-8 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Add More</span>
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
            ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-2">No images yet</p>
                    <p className="text-sm text-muted-foreground">
                        Upload images or add from URL to showcase your product
                    </p>
                </div>
            )}
        </div>
    )
}
