"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Plus, X, Image as ImageIcon, SlidersHorizontal, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

interface SiteSettings {
    id: string
    heroMode: string
    heroImage: string | null
    heroSliderImages: string[]
    heroTitle: string
    heroSubtitle: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
}

interface HeroSettingsFormProps {
    settings: SiteSettings
}

export function HeroSettingsForm({ settings }: HeroSettingsFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [heroMode, setHeroMode] = useState(settings.heroMode)
    const [heroImage, setHeroImage] = useState(settings.heroImage || "")
    const [sliderImages, setSliderImages] = useState<string[]>(settings.heroSliderImages || [])
    const [heroTitle, setHeroTitle] = useState(settings.heroTitle)
    const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle)

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
                    heroImage: heroMode === "image" ? heroImage : settings.heroImage,
                    heroSliderImages: heroMode === "slider" ? sliderImages.filter(img => img.trim()) : settings.heroSliderImages,
                    heroTitle,
                    heroSubtitle,
                }),
            })

            if (!response.ok) throw new Error("Failed to save")

            toast({
                title: "Success",
                description: "Hero settings saved successfully",
            })
            router.refresh()
        } catch (error) {
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

            {/* Single Image Settings */}
            {heroMode === "image" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Image</CardTitle>
                        <CardDescription>
                            Enter the URL of your hero image
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="heroImage">Image URL</Label>
                            <Input
                                id="heroImage"
                                value={heroImage}
                                onChange={(e) => setHeroImage(e.target.value)}
                                placeholder="https://example.com/hero-image.jpg"
                            />
                        </div>
                        {heroImage && (
                            <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
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
                                    Add up to 5 images for the carousel ({sliderImages.length}/5)
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
                                            <Label>Image {index + 1} URL</Label>
                                            <Input
                                                value={image}
                                                onChange={(e) => updateSliderImage(index, e.target.value)}
                                                placeholder="https://example.com/slide.jpg"
                                            />
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

            {/* Hero Text */}
            <Card>
                <CardHeader>
                    <CardTitle>Hero Text</CardTitle>
                    <CardDescription>
                        Customize the title and subtitle shown on your hero section
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
