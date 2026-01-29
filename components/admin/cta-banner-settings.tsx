"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Upload, ImageIcon, Info, Sparkles, Trash2 } from "lucide-react"

interface SiteSettings {
    id: string
    ctaBannerImage?: string | null
    ctaBannerTitle?: string
    ctaBannerSubtitle?: string
    ctaBannerButtonText?: string
    ctaBannerLink?: string | null
    [key: string]: any
}

interface CTABannerSettingsProps {
    settings: SiteSettings
}

// Recommended banner dimensions
const BANNER_WIDTH = 1200
const BANNER_HEIGHT = 400
const ASPECT_RATIO = BANNER_WIDTH / BANNER_HEIGHT // 3:1 ratio

export function CTABannerSettings({ settings }: CTABannerSettingsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [bannerImage, setBannerImage] = useState(settings.ctaBannerImage || "")
    const [title, setTitle] = useState(settings.ctaBannerTitle || "Don't Miss the Drop")
    const [subtitle, setSubtitle] = useState(settings.ctaBannerSubtitle || "Join zenixa.club for exclusive early access to new collections and special offers.")
    const [buttonText, setButtonText] = useState(settings.ctaBannerButtonText || "Subscribe")
    const [link, setLink] = useState(settings.ctaBannerLink || "")

    const validateImageDimensions = (file: File): Promise<{ valid: boolean; width: number; height: number }> => {
        return new Promise((resolve) => {
            const img = new window.Image()
            img.onload = () => {
                const ratio = img.width / img.height
                // Allow ~10% tolerance on aspect ratio
                const isValidRatio = Math.abs(ratio - ASPECT_RATIO) < 0.3
                resolve({ valid: isValidRatio, width: img.width, height: img.height })
            }
            img.onerror = () => resolve({ valid: false, width: 0, height: 0 })
            img.src = URL.createObjectURL(file)
        })
    }

    const handleImageUpload = async (file: File) => {
        setUploading(true)

        try {
            // Validate dimensions first
            const validation = await validateImageDimensions(file)
            if (!validation.valid) {
                toast({
                    title: "Invalid image dimensions",
                    description: `Please upload an image with approximately 3:1 aspect ratio. Recommended: ${BANNER_WIDTH}×${BANNER_HEIGHT}px. Your image: ${validation.width}×${validation.height}px`,
                    variant: "destructive",
                })
                setUploading(false)
                return
            }

            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/admin/media", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Upload failed")
            }

            const media = await response.json()
            setBannerImage(media.url)

            toast({
                title: "Banner uploaded",
                description: "Your banner image has been uploaded successfully",
            })
        } catch (error: any) {
            toast({
                title: "Upload failed",
                description: error.message || "Failed to upload banner",
                variant: "destructive",
            })
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...settings,
                    ctaBannerImage: bannerImage || null,
                    ctaBannerTitle: title,
                    ctaBannerSubtitle: subtitle,
                    ctaBannerButtonText: buttonText,
                    ctaBannerLink: link || null,
                }),
            })

            if (!response.ok) throw new Error("Failed to save")

            toast({
                title: "Success",
                description: "CTA banner settings saved successfully",
            })
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/10">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">CTA Banner</h2>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-lg">
                        Customize the promotional banner section that appears on your homepage.
                        Use it for newsletter signup, promotions, or announcements.
                    </p>
                </div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            </div>

            {/* Dimension Instructions */}
            <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-transparent">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-700">
                        <Info className="h-4 w-4" />
                        Banner Image Guidelines
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-white rounded-lg border border-border/50">
                            <p className="font-medium text-foreground">Recommended Size</p>
                            <p className="text-muted-foreground">{BANNER_WIDTH} × {BANNER_HEIGHT} px</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-border/50">
                            <p className="font-medium text-foreground">Aspect Ratio</p>
                            <p className="text-muted-foreground">3:1 (Landscape)</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-border/50">
                            <p className="font-medium text-foreground">File Format</p>
                            <p className="text-muted-foreground">PNG, JPG, WebP</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Images with incorrect aspect ratio will be rejected. Keep text readable with good contrast.
                    </p>
                </CardContent>
            </Card>

            {/* Banner Image Upload */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Banner Image</CardTitle>
                    <CardDescription>Upload a custom background image for your CTA banner</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Preview */}
                    <div
                        className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 border border-border"
                        style={{ aspectRatio: `${BANNER_WIDTH}/${BANNER_HEIGHT}` }}
                    >
                        {bannerImage ? (
                            <>
                                <Image
                                    src={bannerImage}
                                    alt="Banner preview"
                                    fill
                                    className="object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-3 right-3"
                                    onClick={() => setBannerImage("")}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                                </Button>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                                <ImageIcon className="h-12 w-12 mb-2" />
                                <p className="text-sm">No banner image</p>
                                <p className="text-xs">Default gradient will be used</p>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file)
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full h-12"
                    >
                        {uploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        {uploading ? "Uploading..." : "Upload Banner Image"}
                    </Button>
                </CardContent>
            </Card>

            {/* Text Content */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Banner Content</CardTitle>
                    <CardDescription>Customize the text displayed on the banner</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Don't Miss the Drop"
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Textarea
                            id="subtitle"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="Join for exclusive early access..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="buttonText">Button Text</Label>
                            <Input
                                id="buttonText"
                                value={buttonText}
                                onChange={(e) => setButtonText(e.target.value)}
                                placeholder="Subscribe"
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link">Button Link (optional)</Label>
                            <Input
                                id="link"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="/products or https://..."
                                className="h-11"
                            />
                            <p className="text-xs text-muted-foreground">Leave empty for email subscribe form</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Live Preview */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-secondary/50 to-secondary/30 border-b">
                    <CardTitle className="text-base">Live Preview</CardTitle>
                    <CardDescription className="text-xs">How the banner will appear on your homepage</CardDescription>
                </CardHeader>
                <CardContent className="p-6 bg-secondary/30">
                    <div
                        className="relative w-full rounded-2xl overflow-hidden text-white"
                        style={{ aspectRatio: `${BANNER_WIDTH}/${BANNER_HEIGHT}` }}
                    >
                        {/* Background */}
                        {bannerImage ? (
                            <Image src={bannerImage} alt="Banner" fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gray-900" />
                        )}

                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 -m-8 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 -m-8 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">{title || "Your Title"}</h2>
                            <p className="text-white/70 text-sm max-w-md mb-4">{subtitle || "Your subtitle here..."}</p>
                            <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-full px-6">
                                {buttonText || "Button"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading} size="lg" className="px-8">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
