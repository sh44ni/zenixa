"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { Loader2, Palette, Check, Type, Circle, ImageIcon } from "lucide-react"

interface SiteSettings {
    id: string
    heroMode: string
    heroImage: string | null
    heroSliderImages: string[]
    heroTitle: string
    heroSubtitle: string
    primaryColor: string | null
    secondaryColor: string | null
    accentColor: string | null
    colorSelectionMode?: string | null
}

interface ProductDisplaySettingsProps {
    settings: SiteSettings
}

// Sample colors for preview
const sampleColors = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Red", hex: "#EF4444" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Green", hex: "#22C55E" },
]

// Sample images for preview
const sampleImages = [
    "/placeholder.jpg",
    "/placeholder.jpg",
    "/placeholder.jpg",
    "/placeholder.jpg",
]

export function ProductDisplaySettings({ settings }: ProductDisplaySettingsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [colorSelectionMode, setColorSelectionMode] = useState(settings.colorSelectionMode || "text")
    const [previewSelected, setPreviewSelected] = useState("Black")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...settings,
                    colorSelectionMode,
                }),
            })

            if (!response.ok) throw new Error("Failed to save")

            toast({
                title: "Success",
                description: "Product display settings saved successfully",
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
            {/* Color Selection Mode */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Color Selection Style
                    </CardTitle>
                    <CardDescription>
                        Choose how customers select product colors on product pages
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <RadioGroup
                        value={colorSelectionMode}
                        onValueChange={setColorSelectionMode}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        {/* Text Option */}
                        <label
                            htmlFor="text"
                            className={`
                                relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all
                                ${colorSelectionMode === "text"
                                    ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                                    : "border-border hover:border-primary/50 hover:bg-secondary/30"
                                }
                            `}
                        >
                            <RadioGroupItem value="text" id="text" className="sr-only" />
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Type className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Text Buttons</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Color names in pill buttons
                                </p>
                            </div>
                            {colorSelectionMode === "text" && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </label>

                        {/* Swatch Option */}
                        <label
                            htmlFor="swatch"
                            className={`
                                relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all
                                ${colorSelectionMode === "swatch"
                                    ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                                    : "border-border hover:border-primary/50 hover:bg-secondary/30"
                                }
                            `}
                        >
                            <RadioGroupItem value="swatch" id="swatch" className="sr-only" />
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Circle className="h-6 w-6 text-primary fill-primary" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Color Swatches</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Colored circle buttons
                                </p>
                            </div>
                            {colorSelectionMode === "swatch" && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </label>

                        {/* Image Option */}
                        <label
                            htmlFor="image"
                            className={`
                                relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all
                                ${colorSelectionMode === "image"
                                    ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                                    : "border-border hover:border-primary/50 hover:bg-secondary/30"
                                }
                            `}
                        >
                            <RadioGroupItem value="image" id="image" className="sr-only" />
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">Image Thumbnails</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Variant image previews
                                </p>
                            </div>
                            {colorSelectionMode === "image" && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </label>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Live Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>See how the color selector will look on product pages</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-6 bg-secondary/20 rounded-xl border">
                        <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                            Select Color
                        </p>

                        {/* Text Mode Preview */}
                        {colorSelectionMode === "text" && (
                            <div className="flex flex-wrap gap-3">
                                {sampleColors.map((color) => {
                                    const isSelected = previewSelected === color.name
                                    return (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => setPreviewSelected(color.name)}
                                            className={`
                                                relative px-6 py-3 rounded-full border text-sm font-medium transition-all duration-300
                                                ${isSelected
                                                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                                                    : "border-border bg-background hover:border-foreground/30 hover:bg-secondary/50"
                                                }
                                            `}
                                        >
                                            {color.name}
                                            {isSelected && (
                                                <Check className="absolute top-0 right-0 -mr-1 -mt-1 h-3 w-3 bg-white text-primary rounded-full p-0.5 border" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Swatch Mode Preview */}
                        {colorSelectionMode === "swatch" && (
                            <div className="flex flex-wrap gap-3">
                                {sampleColors.map((color) => {
                                    const isSelected = previewSelected === color.name
                                    const isLight = color.name === "White" || color.name === "Yellow"
                                    return (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => setPreviewSelected(color.name)}
                                            className={`
                                                w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center
                                                ${isSelected
                                                    ? "border-primary ring-2 ring-primary ring-offset-2"
                                                    : "border-border hover:border-gray-400"
                                                }
                                            `}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                        >
                                            {isSelected && (
                                                <Check className={`h-5 w-5 ${isLight ? "text-black" : "text-white"}`} />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Image Mode Preview */}
                        {colorSelectionMode === "image" && (
                            <div className="flex flex-wrap gap-3">
                                {sampleColors.map((color, idx) => {
                                    const isSelected = previewSelected === color.name
                                    return (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => setPreviewSelected(color.name)}
                                            className={`
                                                relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                                                ${isSelected
                                                    ? "border-primary ring-2 ring-primary ring-offset-2"
                                                    : "border-border hover:border-gray-300"
                                                }
                                            `}
                                            title={color.name}
                                        >
                                            <div
                                                className="absolute inset-0"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                    <Check className="h-6 w-6 text-white drop-shadow-md" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground mt-4">
                            Click on colors to see how selection works
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Settings"
                    )}
                </Button>
            </div>
        </form>
    )
}
