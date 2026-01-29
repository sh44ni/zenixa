"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2, Truck, RotateCcw, Shield, Package, Clock, Headphones, Heart, Star, Zap, Award } from "lucide-react"

// Available icons for badges
const AVAILABLE_ICONS = [
    { value: "truck", label: "Truck (Delivery)", icon: Truck },
    { value: "rotate-ccw", label: "Rotate (Returns)", icon: RotateCcw },
    { value: "shield", label: "Shield (Security)", icon: Shield },
    { value: "package", label: "Package", icon: Package },
    { value: "clock", label: "Clock (Fast)", icon: Clock },
    { value: "headphones", label: "Headphones (Support)", icon: Headphones },
    { value: "heart", label: "Heart", icon: Heart },
    { value: "star", label: "Star", icon: Star },
    { value: "zap", label: "Zap (Quick)", icon: Zap },
    { value: "award", label: "Award (Quality)", icon: Award },
]

interface ProductBadgesSettingsProps {
    settings: any
}

export function ProductBadgesSettings({ settings }: ProductBadgesSettingsProps) {
    const [saving, setSaving] = useState(false)
    const [badge1, setBadge1] = useState({
        icon: settings?.productBadge1Icon || "truck",
        title: settings?.productBadge1Title || "Free Delivery",
        subtitle: settings?.productBadge1Subtitle || "Orders over PKR 5,000",
        enabled: settings?.productBadge1Enabled ?? true,
    })
    const [badge2, setBadge2] = useState({
        icon: settings?.productBadge2Icon || "rotate-ccw",
        title: settings?.productBadge2Title || "Easy Returns",
        subtitle: settings?.productBadge2Subtitle || "30 Day Guarantee",
        enabled: settings?.productBadge2Enabled ?? true,
    })

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productBadge1Icon: badge1.icon,
                    productBadge1Title: badge1.title,
                    productBadge1Subtitle: badge1.subtitle,
                    productBadge1Enabled: badge1.enabled,
                    productBadge2Icon: badge2.icon,
                    productBadge2Title: badge2.title,
                    productBadge2Subtitle: badge2.subtitle,
                    productBadge2Enabled: badge2.enabled,
                }),
            })

            if (!res.ok) throw new Error("Failed to save")

            toast({ title: "Saved!", description: "Product badge settings updated" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const getIconComponent = (iconValue: string) => {
        const iconData = AVAILABLE_ICONS.find(i => i.value === iconValue)
        return iconData?.icon || Truck
    }

    const Badge1Icon = getIconComponent(badge1.icon)
    const Badge2Icon = getIconComponent(badge2.icon)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Page Guarantee Badges</CardTitle>
                <CardDescription>
                    Configure the guarantee badges shown on product pages (e.g., Free Delivery, Easy Returns)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Badge 1 */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Badge1Icon className="h-5 w-5 text-primary" />
                            </div>
                            <h4 className="font-semibold">Badge 1</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="badge1-enabled">Enabled</Label>
                            <Switch
                                id="badge1-enabled"
                                checked={badge1.enabled}
                                onCheckedChange={(checked) => setBadge1({ ...badge1, enabled: checked })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Icon</Label>
                            <Select value={badge1.icon} onValueChange={(v) => setBadge1({ ...badge1, icon: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_ICONS.map((icon) => (
                                        <SelectItem key={icon.value} value={icon.value}>
                                            <div className="flex items-center gap-2">
                                                <icon.icon className="h-4 w-4" />
                                                {icon.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={badge1.title}
                                onChange={(e) => setBadge1({ ...badge1, title: e.target.value })}
                                placeholder="Free Delivery"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Subtitle</Label>
                            <Input
                                value={badge1.subtitle}
                                onChange={(e) => setBadge1({ ...badge1, subtitle: e.target.value })}
                                placeholder="Orders over PKR 5,000"
                            />
                        </div>
                    </div>
                </div>

                {/* Badge 2 */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Badge2Icon className="h-5 w-5 text-primary" />
                            </div>
                            <h4 className="font-semibold">Badge 2</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="badge2-enabled">Enabled</Label>
                            <Switch
                                id="badge2-enabled"
                                checked={badge2.enabled}
                                onCheckedChange={(checked) => setBadge2({ ...badge2, enabled: checked })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Icon</Label>
                            <Select value={badge2.icon} onValueChange={(v) => setBadge2({ ...badge2, icon: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_ICONS.map((icon) => (
                                        <SelectItem key={icon.value} value={icon.value}>
                                            <div className="flex items-center gap-2">
                                                <icon.icon className="h-4 w-4" />
                                                {icon.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={badge2.title}
                                onChange={(e) => setBadge2({ ...badge2, title: e.target.value })}
                                placeholder="Easy Returns"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Subtitle</Label>
                            <Input
                                value={badge2.subtitle}
                                onChange={(e) => setBadge2({ ...badge2, subtitle: e.target.value })}
                                placeholder="30 Day Guarantee"
                            />
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="border rounded-lg p-4 bg-secondary/10">
                    <p className="text-sm font-medium mb-3">Preview</p>
                    <div className="grid grid-cols-2 gap-4">
                        {badge1.enabled && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <Badge1Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{badge1.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{badge1.subtitle}</p>
                                </div>
                            </div>
                        )}
                        {badge2.enabled && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <Badge2Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{badge2.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{badge2.subtitle}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Badge Settings"
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
