"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Plus, X, Image as ImageIcon, SlidersHorizontal, Info, Upload, Link as LinkIcon, Type, MousePointer } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface HeroSettingsFormProps {
    settings: Record<string, unknown> | null
}

export function HeroSettingsForm({ settings }: HeroSettingsFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const sliderFileInputRef = useRef<HTMLInputElement>(null)
    const [currentSliderIndex, setCurrentSliderIndex] = useState<number | null>(null)

    // Form state
    const [heroMode, setHeroMode] = useState((settings?.heroMode as string) || "image")
    const [heroImage, setHeroImage] = useState((settings?.heroImage as string) || "")
    const [sliderImages, setSliderImages] = useState<string[]>((settings?.heroSliderImages as string[]) || [])
    const [heroTitle, setHeroTitle] = useState((settings?.heroTitle as string) || "Discover Quality Products at Amazing Prices")
    const [heroSubtitle, setHeroSubtitle] = useState((settings?.heroSubtitle as string) || "Shop the latest trends in electronics, fashion, home essentials, and more.")

    // New fields
    const [showText, setShowText] = useState((settings?.heroShowText as boolean) ?? true)

    // Badge
    const [showBadge, setShowBadge] = useState((settings?.heroShowBadge as boolean) ?? true)
    const [badgeText, setBadgeText] = useState((settings?.heroBadgeText as string) || "New Collection 2026")

    // Button 1 (Primary)
    const [showButton1, setShowButton1] = useState((settings?.heroShowButton1 as boolean) ?? true)
    const [button1Text, setButton1Text] = useState((settings?.heroButton1Text as string) || "Shop Now")
    const [button1Link, setButton1Link] = useState((settings?.heroButton1Link as string) || "/products")

    // Button 2 (Secondary)
    const [showButton2, setShowButton2] = useState((settings?.heroShowButton2 as boolean) ?? true)
    const [button2Text, setButton2Text] = useState((settings?.heroButton2Text as string) || "Explore Categories")
    const [button2Link, setButton2Link] = useState((settings?.heroButton2Link as string) || "/categories")

    const [imageWidth, setImageWidth] = useState((settings?.heroImageWidth as number) || 1920)
    const [imageHeight, setImageHeight] = useState((settings?.heroImageHeight as number) || 800)

    // Image upload handler
    const handleImageUpload = async (file: File, isSlider: boolean = false, sliderIndex?: number) => {
        setUploading(true)

        // Validate dimensions
        const img = document.createElement('img')
        const url = URL.createObjectURL(file)

        try {
            await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                    if (img.width !== imageWidth || img.height !== imageHeight) {
                        reject(new Error(`Image must be exactly ${imageWidth}×${imageHeight}px. Uploaded: ${img.width}×${img.height}px`))
                    } else {
                        resolve()
                    }
                }
                img.onerror = () => reject(new Error("Failed to load image"))
                img.src = url
            })

            // Upload the image
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/admin/media", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) throw new Error("Upload failed")

            const data = await response.json()
            const imageUrl = data.url

            if (isSlider && sliderIndex !== undefined) {
                const updated = [...sliderImages]
                updated[sliderIndex] = imageUrl
                setSliderImages(updated)
            } else {
                setHeroImage(imageUrl)
            }

            toast({
                title: "Uploaded!",
                description: "Image uploaded successfully",
            })
        } catch (error: unknown) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to upload image",
                variant: "destructive",
            })
        } finally {
            URL.revokeObjectURL(url)
            setUploading(false)
        }
    }

    const addSliderImage = () => {
        if (sliderImages.length >= 5) {
            toast({
                title: "Maximum reached",
                description: "You can only add up to 5 slider images",
                variant: "destructive",
            })
            return
        }
        setSliderImages([...sliderImages, ""])
    }

    const removeSliderImage = (index: number) => {
        setSliderImages(sliderImages.filter((_, i) => i !== index))
    }

    const updateSliderImage = (index: number, value: string) => {
        const updated = [...sliderImages]
        updated[index] = value
        setSliderImages(updated)
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
                    heroMode,
                    heroImage: heroMode === "image" ? heroImage : settings?.heroImage,
                    heroSliderImages: heroMode === "slider" ? sliderImages.filter(img => img.trim()) : settings?.heroSliderImages,
                    heroTitle,
                    heroSubtitle,
                    heroShowText: showText,
                    heroShowBadge: showBadge,
                    heroBadgeText: badgeText,

                    heroShowButton1: showButton1,
                    heroButton1Text: button1Text,
                    heroButton1Link: button1Link,

                    heroShowButton2: showButton2,
                    heroButton2Text: button2Text,
                    heroButton2Link: button2Link,

                    heroImageWidth: imageWidth,
                    heroImageHeight: imageHeight,
                }),
            })

            if (!response.ok) throw new Error("Failed to save")

            toast({
                title: "Success",
                description: "Hero settings saved successfully",
            })
            router.refresh()
        } catch {
            toast({
                title: "Error",
                description: "Failed to save hero settings",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        Hero Display Mode
                    </CardTitle>
                    <CardDescription>
                        Choose how your hero section displays on the homepage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={heroMode} onValueChange={setHeroMode} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label
                            className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${heroMode === "image" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-primary/50"
                                }`}
                        >
                            <RadioGroupItem value="image" className="mt-1" />
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    <span className="font-medium">Single Image</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Display a single static hero image with your branding
                                </p>
                            </div>
                        </label>

                        <label
                            className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${heroMode === "slider" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-primary/50"
                                }`}
                        >
                            <RadioGroupItem value="slider" className="mt-1" />
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    <span className="font-medium">Image Slider</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Auto-rotating carousel with up to 5 images
                                </p>
                            </div>
                        </label>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Image Dimensions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Image Dimensions
                    </CardTitle>
                    <CardDescription>
                        Set the required dimensions for hero images (both single and slider)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Width (px)</Label>
                            <Input
                                type="number"
                                value={imageWidth}
                                onChange={(e) => setImageWidth(parseInt(e.target.value) || 1920)}
                                min={800}
                                max={3840}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Height (px)</Label>
                            <Input
                                type="number"
                                value={imageHeight}
                                onChange={(e) => setImageHeight(parseInt(e.target.value) || 800)}
                                min={300}
                                max={1200}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Recommended: 1920×800 for best display. Uploaded images must match these exact dimensions.
                    </p>
                </CardContent>
            </Card>

            {/* Single Image Settings */}
            {heroMode === "image" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Image</CardTitle>
                        <CardDescription>
                            Upload an image or enter a URL ({imageWidth}×{imageHeight}px)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Input
                                value={heroImage}
                                onChange={(e) => setHeroImage(e.target.value)}
                                placeholder="https://example.com/hero-image.jpg"
                                className="flex-1"
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
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
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload
                                    </>
                                )}
                            </Button>
                        </div>
                        {heroImage && (
                            <div className="relative aspect-[2.4/1] w-full max-w-lg rounded-lg overflow-hidden border">
                                <Image
                                    src={heroImage}
                                    alt="Hero preview"
                                    fill
                                    className="object-cover"
                                    onError={() => { }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Slider Settings */}
            {heroMode === "slider" && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Slider Images</CardTitle>
                                <CardDescription>
                                    Add up to 5 images for the carousel ({sliderImages.length}/5) - {imageWidth}×{imageHeight}px
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addSliderImage}
                                disabled={sliderImages.length >= 5}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Image
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <input
                            type="file"
                            ref={sliderFileInputRef}
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file && currentSliderIndex !== null) {
                                    handleImageUpload(file, true, currentSliderIndex)
                                }
                            }}
                        />
                        {sliderImages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No slider images added yet</p>
                                <p className="text-sm">Click "Add Image" to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sliderImages.map((image, index) => (
                                    <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                                        <div className="flex-1 space-y-2">
                                            <Label>Image {index + 1}</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={image}
                                                    onChange={(e) => updateSliderImage(index, e.target.value)}
                                                    placeholder="URL or upload"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => {
                                                        setCurrentSliderIndex(index)
                                                        sliderFileInputRef.current?.click()
                                                    }}
                                                    disabled={uploading}
                                                >
                                                    {uploading && currentSliderIndex === index ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        {image && (
                                            <div className="relative w-24 h-16 rounded overflow-hidden border flex-shrink-0">
                                                <Image
                                                    src={image}
                                                    alt={`Slide ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    onError={() => { }}
                                                />
                                            </div>
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSliderImage(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Text Overlay Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        Text Overlay
                    </CardTitle>
                    <CardDescription>
                        Configure the text shown over the hero image
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Show Text Toggle */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/30">
                        <div className="space-y-0.5">
                            <Label className="text-base">Show Text Overlay</Label>
                            <p className="text-sm text-muted-foreground">
                                When enabled, displays title and subtitle with a dark gradient background
                            </p>
                        </div>
                        <Switch checked={showText} onCheckedChange={setShowText} />
                    </div>

                    {showText && (
                        <>
                            {/* Badge Settings */}
                            <div className="p-4 border rounded-lg space-y-4 bg-background">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">Top Badge</Label>
                                    <Switch checked={showBadge} onCheckedChange={setShowBadge} />
                                </div>
                                {showBadge && (
                                    <div className="space-y-2">
                                        <Label>Badge Text</Label>
                                        <Input
                                            value={badgeText}
                                            onChange={(e) => setBadgeText(e.target.value)}
                                            placeholder="New Collection 2026"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="heroTitle">Title</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>The main headline shown on your hero section</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="heroTitle"
                                    value={heroTitle}
                                    onChange={(e) => setHeroTitle(e.target.value)}
                                    placeholder="Discover Quality Products"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="heroSubtitle">Subtitle</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Secondary text that appears below the title</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Textarea
                                    id="heroSubtitle"
                                    value={heroSubtitle}
                                    onChange={(e) => setHeroSubtitle(e.target.value)}
                                    placeholder="Shop the latest trends..."
                                    rows={3}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Buttons Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MousePointer className="h-5 w-5" />
                        Call to Action Buttons
                    </CardTitle>
                    <CardDescription>
                        Configure the primary and secondary buttons
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Primary Button */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Primary Button</Label>
                                <p className="text-sm text-muted-foreground">Main call to action (Solid)</p>
                            </div>
                            <Switch checked={showButton1} onCheckedChange={setShowButton1} />
                        </div>

                        {showButton1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Button Text</Label>
                                    <Input
                                        value={button1Text}
                                        onChange={(e) => setButton1Text(e.target.value)}
                                        placeholder="Shop Now"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4" />
                                        Button Link
                                    </Label>
                                    <Input
                                        value={button1Link}
                                        onChange={(e) => setButton1Link(e.target.value)}
                                        placeholder="/products"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Secondary Button */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Secondary Button</Label>
                                <p className="text-sm text-muted-foreground">Alternative action (Outline)</p>
                            </div>
                            <Switch checked={showButton2} onCheckedChange={setShowButton2} />
                        </div>

                        {showButton2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Button Text</Label>
                                    <Input
                                        value={button2Text}
                                        onChange={(e) => setButton2Text(e.target.value)}
                                        placeholder="Explore Categories"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4" />
                                        Button Link
                                    </Label>
                                    <Input
                                        value={button2Link}
                                        onChange={(e) => setButton2Link(e.target.value)}
                                        placeholder="/categories"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Hero Settings"
                    )}
                </Button>
            </div>
        </form>
    )
}
