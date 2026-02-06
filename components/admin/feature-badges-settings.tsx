"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import {
    Loader2, Plus, Trash2, ChevronUp, ChevronDown,
    ImageIcon, Info, Truck, Shield, Clock, Star, Zap, Wifi,
    Sparkles, RotateCcw, Upload
} from "lucide-react"

interface FeatureBadge {
    icon: string
    text: string
}

interface SiteSettings {
    id: string
    featureBadges?: FeatureBadge[] | any
    [key: string]: any
}

interface FeatureBadgesSettingsProps {
    settings: SiteSettings
}

// Default badges with lucide icon names
const defaultBadges: FeatureBadge[] = [
    { icon: "truck", text: "Free Delivery over PKR 5,000" },
    { icon: "shield", text: "Secure Payment" },
    { icon: "clock", text: "Fast Delivery" },
    { icon: "star", text: "Premium Quality" },
]

// Available built-in icons
const builtInIcons = [
    { name: "truck", label: "Truck", icon: Truck },
    { name: "shield", label: "Shield", icon: Shield },
    { name: "clock", label: "Clock", icon: Clock },
    { name: "star", label: "Star", icon: Star },
    { name: "zap", label: "Zap", icon: Zap },
    { name: "wifi", label: "Wifi", icon: Wifi },
]

export function FeatureBadgesSettings({ settings }: FeatureBadgesSettingsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Parse badges from settings or use defaults
    // Only use defaults if featureBadges was never configured (null/undefined)
    // If it's an empty array, respect that (user deleted all badges)
    const initialBadges = (() => {
        try {
            // Check if featureBadges property exists (even if empty array)
            if ('featureBadges' in settings && settings.featureBadges !== null && settings.featureBadges !== undefined) {
                // Return the array as-is (could be empty if user deleted all badges)
                return Array.isArray(settings.featureBadges) ? settings.featureBadges as FeatureBadge[] : []
            }
            // featureBadges not configured yet - use defaults
            return defaultBadges
        } catch {
            return defaultBadges
        }
    })()

    const [badges, setBadges] = useState<FeatureBadge[]>(initialBadges)

    const handleBadgeChange = (index: number, field: keyof FeatureBadge, value: string) => {
        const updated = [...badges]
        updated[index] = { ...updated[index], [field]: value }
        setBadges(updated)
    }

    const handleIconUpload = async (index: number, file: File) => {
        setUploadingIndex(index)

        try {
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
            handleBadgeChange(index, "icon", media.url)

            toast({
                title: "Icon uploaded",
                description: "Your custom icon has been uploaded successfully",
            })
        } catch (error: any) {
            toast({
                title: "Upload failed",
                description: error.message || "Failed to upload icon",
                variant: "destructive",
            })
        } finally {
            setUploadingIndex(null)
        }
    }

    const addBadge = () => {
        if (badges.length >= 4) {
            toast({
                title: "Maximum reached",
                description: "You can only have up to 4 feature badges",
                variant: "destructive",
            })
            return
        }
        setBadges([...badges, { icon: "star", text: "" }])
    }

    const removeBadge = (index: number) => {
        setBadges(badges.filter((_, i) => i !== index))
    }

    const moveBadge = (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= badges.length) return

        const updated = [...badges]
        const [removed] = updated.splice(index, 1)
        updated.splice(newIndex, 0, removed)
        setBadges(updated)
    }

    const resetToDefaults = () => {
        setBadges(defaultBadges)
        toast({
            title: "Reset",
            description: "Badges reset to defaults (not saved yet)",
        })
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
                    featureBadges: badges,
                }),
            })

            if (!response.ok) throw new Error("Failed to save")

            toast({
                title: "Success",
                description: "Feature badges saved successfully",
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

    // Icon preview component
    const IconPreview = ({ icon, size = "md" }: { icon: string; size?: "sm" | "md" | "lg" }) => {
        const sizeClasses = {
            sm: "w-6 h-6",
            md: "w-12 h-12",
            lg: "w-16 h-16"
        }
        const iconSizeClasses = {
            sm: "h-4 w-4",
            md: "h-6 w-6",
            lg: "h-8 w-8"
        }

        // Check if it's a URL (custom image)
        if (icon && (icon.startsWith("http") || icon.startsWith("/"))) {
            return (
                <div className={`${sizeClasses[size]} relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20`}>
                    <Image src={icon} alt="Icon" fill className="object-contain p-1" />
                </div>
            )
        }

        // Map lucide icon names
        const iconMap: Record<string, React.ReactNode> = {
            truck: <Truck className={`${iconSizeClasses[size]} text-primary`} />,
            shield: <Shield className={`${iconSizeClasses[size]} text-primary`} />,
            clock: <Clock className={`${iconSizeClasses[size]} text-primary`} />,
            star: <Star className={`${iconSizeClasses[size]} text-primary`} />,
            zap: <Zap className={`${iconSizeClasses[size]} text-primary`} />,
            wifi: <Wifi className={`${iconSizeClasses[size]} text-primary`} />,
        }

        return (
            <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20`}>
                {iconMap[icon?.toLowerCase()] || <ImageIcon className={`${iconSizeClasses[size]} text-muted-foreground`} />}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header with gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/10">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Feature Badges</h2>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-lg">
                        Customize the feature badges that appear below your hero section.
                        Add up to 6 badges to highlight your store's key benefits.
                    </p>
                </div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            </div>

            {/* Instructions */}
            <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-transparent overflow-hidden">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-700">
                        <Info className="h-4 w-4" />
                        Icon Options
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Built-in Icons</p>
                            <div className="flex flex-wrap gap-2">
                                {builtInIcons.map(({ name, label, icon: Icon }) => (
                                    <div
                                        key={name}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border border-border/50 text-xs font-medium shadow-sm"
                                    >
                                        <Icon className="h-3.5 w-3.5 text-primary" />
                                        <code className="text-xs">{name}</code>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom Icons</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Upload your own PNG or SVG icon using the <strong>Upload</strong> button.
                                Recommended size: <strong>24×24px</strong> or <strong>32×32px</strong>.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Badges List */}
            <Card>
                <CardHeader className="border-b bg-secondary/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">Your Badges</CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                {badges.length}/4 badges • Use arrows to reorder
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={resetToDefaults}
                                className="h-8 text-xs"
                            >
                                <RotateCcw className="h-3 w-3 mr-1.5" />
                                Reset
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={addBadge}
                                disabled={badges.length >= 4}
                                className="h-8 text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1.5" />
                                Add Badge
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                    {badges.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-secondary/20">
                            <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No feature badges</p>
                            <p className="text-sm mt-1">Click "Add Badge" to create one</p>
                        </div>
                    ) : (
                        badges.map((badge, index) => (
                            <div
                                key={index}
                                className="group relative flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-gradient-to-r from-secondary/30 to-transparent hover:from-secondary/50 transition-all duration-200"
                            >
                                {/* Order controls */}
                                <div className="flex sm:flex-col items-center justify-center gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-50 hover:opacity-100 disabled:opacity-20"
                                        onClick={() => moveBadge(index, "up")}
                                        disabled={index === 0}
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-bold text-muted-foreground w-5 text-center">{index + 1}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-50 hover:opacity-100 disabled:opacity-20"
                                        onClick={() => moveBadge(index, "down")}
                                        disabled={index === badges.length - 1}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Icon Preview & Upload */}
                                <div className="flex flex-col items-center gap-2">
                                    <IconPreview icon={badge.icon} size="lg" />
                                    <input
                                        type="file"
                                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                        className="hidden"
                                        ref={el => { fileInputRefs.current[index] = el }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleIconUpload(index, file)
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs px-2"
                                        onClick={() => fileInputRefs.current[index]?.click()}
                                        disabled={uploadingIndex === index}
                                    >
                                        {uploadingIndex === index ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <>
                                                <Upload className="h-3 w-3 mr-1" />
                                                Upload
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Form Fields */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">Icon (name or URL)</Label>
                                        <Input
                                            value={badge.icon}
                                            onChange={(e) => handleBadgeChange(index, "icon", e.target.value)}
                                            placeholder="truck, star, or upload custom..."
                                            className="h-9 text-sm"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Type a name like <code className="bg-secondary px-1 rounded">truck</code> or upload a custom icon
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">Display Text</Label>
                                        <Input
                                            value={badge.text}
                                            onChange={(e) => handleBadgeChange(index, "text", e.target.value)}
                                            placeholder="Free Delivery over PKR 5,000"
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeBadge(index)}
                                    className="absolute top-2 right-2 sm:static h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Live Preview */}
            <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-secondary/50 to-secondary/30 border-b">
                    <CardTitle className="text-base">Live Preview</CardTitle>
                    <CardDescription className="text-xs">Exactly how badges will appear on your homepage</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="py-5 px-4 bg-gradient-to-r from-secondary/30 via-secondary/10 to-secondary/30">
                        <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
                            {badges.filter(b => b.text).map((badge, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-2.5 py-1.5 px-4 rounded-full bg-white/70 backdrop-blur-sm border border-border/30 shadow-sm"
                                >
                                    <IconPreview icon={badge.icon} size="sm" />
                                    <span className="text-sm font-medium text-foreground">{badge.text}</span>
                                </div>
                            ))}
                            {badges.filter(b => b.text).length === 0 && (
                                <p className="text-muted-foreground text-sm py-4">Add badges to see preview</p>
                            )}
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
