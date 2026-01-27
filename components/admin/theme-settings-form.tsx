"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, Palette, RotateCcw, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    colorSelectionMode: string
}

interface ThemeSettingsFormProps {
    settings: SiteSettings
}

// Convert HSL string to hex for the color picker
function hslToHex(hsl: string): string {
    const parts = hsl.split(" ")
    if (parts.length !== 3) return "#3b82f6"

    const h = parseFloat(parts[0]) / 360
    const s = parseFloat(parts[1]) / 100
    const l = parseFloat(parts[2]) / 100

    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }

    let r, g, b
    if (s === 0) {
        r = g = b = l
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16)
        return hex.length === 1 ? "0" + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Convert hex to HSL string
function hexToHsl(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return "221.2 83.2% 53.3%"

    let r = parseInt(result[1], 16) / 255
    let g = parseInt(result[2], 16) / 255
    let b = parseInt(result[3], 16) / 255

    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
            case g: h = ((b - r) / d + 2) / 6; break
            case b: h = ((r - g) / d + 4) / 6; break
        }
    }

    return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`
}

const defaultColors = {
    primaryColor: "221.2 83.2% 53.3%",
    secondaryColor: "210 40% 96.1%",
    accentColor: "210 40% 96.1%",
}

export function ThemeSettingsForm({ settings }: ThemeSettingsFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [primaryColor, setPrimaryColor] = useState(settings.primaryColor)
    const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor)
    const [accentColor, setAccentColor] = useState(settings.accentColor)
    const [colorSelectionMode, setColorSelectionMode] = useState(settings.colorSelectionMode || "text")

    // Preview colors in real-time
    useEffect(() => {
        document.documentElement.style.setProperty("--primary", primaryColor)
        document.documentElement.style.setProperty("--secondary", secondaryColor)
        document.documentElement.style.setProperty("--accent", accentColor)

        return () => {
            // Reset on unmount
            document.documentElement.style.removeProperty("--primary")
            document.documentElement.style.removeProperty("--secondary")
            document.documentElement.style.removeProperty("--accent")
        }
    }, [primaryColor, secondaryColor, accentColor])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...settings,
                    primaryColor,
                    secondaryColor,
                    accentColor,
                    colorSelectionMode,
                }),
            })

            if (!response.ok) throw new Error("Failed to save")

            toast({
                title: "Success",
                description: "Theme colors saved successfully",
            })
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save theme colors",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const resetToDefaults = () => {
        setPrimaryColor(defaultColors.primaryColor)
        setSecondaryColor(defaultColors.secondaryColor)
        setAccentColor(defaultColors.accentColor)
        setColorSelectionMode("text")
        toast({
            title: "Reset",
            description: "Colors reset to defaults (not saved yet)",
        })
    }

    const ColorInput = ({
        label,
        value,
        onChange,
        tooltip
    }: {
        label: string
        value: string
        onChange: (value: string) => void
        tooltip: string
    }) => (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Label>{label}</Label>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <div className="flex gap-3">
                <div className="relative">
                    <input
                        type="color"
                        value={hslToHex(value)}
                        onChange={(e) => onChange(hexToHsl(e.target.value))}
                        className="w-12 h-12 rounded-lg border cursor-pointer"
                    />
                </div>
                <div className="flex-1 space-y-2">
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="221.2 83.2% 53.3%"
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                        HSL format: hue saturation% lightness%
                    </p>
                </div>
                <div
                    className="w-24 h-12 rounded-lg border"
                    style={{ backgroundColor: `hsl(${value})` }}
                />
            </div>
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Theme Colors
                            </CardTitle>
                            <CardDescription>
                                Customize your store's color scheme. Changes preview in real-time.
                            </CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={resetToDefaults}>
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ColorInput
                        label="Primary Color"
                        value={primaryColor}
                        onChange={setPrimaryColor}
                        tooltip="Used for buttons, links, and primary actions throughout your store"
                    />

                    <ColorInput
                        label="Secondary Color"
                        value={secondaryColor}
                        onChange={setSecondaryColor}
                        tooltip="Used for secondary buttons and background accents"
                    />

                    <ColorInput
                        label="Accent Color"
                        value={accentColor}
                        onChange={setAccentColor}
                        tooltip="Used for highlights and special emphasis"
                    />

                    <div className="space-y-3">
                        <Label>Product Color Selection Mode</Label>
                        <Select value={colorSelectionMode} onValueChange={setColorSelectionMode}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text (Buttons)</SelectItem>
                                <SelectItem value="swatch">Swatches (Circles)</SelectItem>
                                <SelectItem value="image">Image (Thumbnails)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Choose how customers select product colors.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Live Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>See how your colors look together</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-6 rounded-lg border space-y-4" style={{ backgroundColor: `hsl(${secondaryColor})` }}>
                        <h3 className="text-xl font-bold" style={{ color: `hsl(${primaryColor})` }}>
                            Sample Heading
                        </h3>
                        <p className="text-muted-foreground">
                            This is how your text will look on the secondary background.
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg text-white font-medium"
                                style={{ backgroundColor: `hsl(${primaryColor})` }}
                            >
                                Primary Button
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg border font-medium"
                                style={{
                                    borderColor: `hsl(${primaryColor})`,
                                    color: `hsl(${primaryColor})`,
                                }}
                            >
                                Outline Button
                            </button>
                        </div>
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
                        "Save Theme Colors"
                    )}
                </Button>
            </div>
        </form>
    )
}
