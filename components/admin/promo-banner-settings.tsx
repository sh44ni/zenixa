"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, Trash2, AlertCircle, CheckCircle2, ImageIcon } from "lucide-react"

interface PromoBannerSettingsProps {
    settings: {
        promoBannerEnabled?: boolean
        promoBannerImage?: string | null
        promoBannerLink?: string | null
        promoBannerWidth?: number
        promoBannerHeight?: number
    } | null
}

export function PromoBannerSettings({ settings }: PromoBannerSettingsProps) {
    const [enabled, setEnabled] = useState(settings?.promoBannerEnabled ?? false)
    const [image, setImage] = useState(settings?.promoBannerImage || "")
    const [link, setLink] = useState(settings?.promoBannerLink || "")
    const [width, setWidth] = useState(settings?.promoBannerWidth || 1200)
    const [height, setHeight] = useState(settings?.promoBannerHeight || 300)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
            setError("Only PNG and JPEG images are allowed")
            return
        }

        // Validate image dimensions
        const img = document.createElement("img")
        const objectUrl = URL.createObjectURL(file)

        img.onload = async () => {
            URL.revokeObjectURL(objectUrl)

            if (img.width !== width || img.height !== height) {
                setError(`Image must be exactly ${width}x${height} pixels. Your image is ${img.width}x${img.height} pixels.`)
                return
            }

            setError(null)
            setUploading(true)

            try {
                const formData = new FormData()
                formData.append("file", file)

                const response = await fetch("/api/admin/media", {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error("Upload failed")
                }

                const data = await response.json()
                setImage(data.url)
            } catch (err) {
                setError("Failed to upload image")
            } finally {
                setUploading(false)
            }
        }

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            setError("Failed to load image for validation")
        }

        img.src = objectUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)

        try {
            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...settings,
                    promoBannerEnabled: enabled,
                    promoBannerImage: image || null,
                    promoBannerLink: link || null,
                    promoBannerWidth: width,
                    promoBannerHeight: height,
                }),
            })

            if (!response.ok) throw new Error("Failed to save settings")

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Current Status Preview */}
            <Card className={enabled && image ? "border-green-200 bg-green-50/50" : "border-orange-200 bg-orange-50/50"}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        {enabled && image ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="text-green-700">Banner is Active</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                <span className="text-orange-700">Banner is Not Active</span>
                            </>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    {enabled && image ? (
                        <div className="space-y-3">
                            <p className="text-sm text-green-700">The promotional banner is visible on your homepage.</p>
                            <div className="rounded-xl overflow-hidden border-2 border-green-200 shadow-sm">
                                <Image
                                    src={image}
                                    alt="Current Banner Preview"
                                    width={width}
                                    height={height}
                                    className="w-full h-auto"
                                />
                            </div>
                            {link && (
                                <p className="text-xs text-green-600">Links to: {link}</p>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-orange-700">
                            {!enabled && !image && "Enable the banner and upload an image to display it on your homepage."}
                            {enabled && !image && "Banner is enabled but no image is uploaded. Please upload an image."}
                            {!enabled && image && "An image is uploaded but the banner is disabled. Enable it to show on homepage."}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Settings Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Banner Settings
                    </CardTitle>
                    <CardDescription>
                        Configure your promotional banner. Images must match the exact dimensions specified.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Enable Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border">
                            <div>
                                <Label className="text-base font-medium">Enable Banner</Label>
                                <p className="text-sm text-muted-foreground">Show the promotional banner on the homepage</p>
                            </div>
                            <Switch checked={enabled} onCheckedChange={setEnabled} />
                        </div>

                        {/* Dimensions */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Required Width (px)</Label>
                                <Input
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(Number(e.target.value))}
                                    min={100}
                                    max={2000}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Required Height (px)</Label>
                                <Input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(Number(e.target.value))}
                                    min={50}
                                    max={800}
                                />
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>Uploaded images must be exactly <strong>{width}x{height} pixels</strong>. Images with different dimensions will be rejected.</span>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-3">
                            <Label>Banner Image</Label>

                            {image ? (
                                <div className="relative rounded-xl overflow-hidden border bg-secondary/30">
                                    <div className="aspect-[4/1] relative">
                                        <Image
                                            src={image}
                                            alt="Promo Banner"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => setImage("")}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer bg-secondary/30">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                    {uploading ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                            <span className="text-sm text-muted-foreground">Click to upload PNG or JPEG</span>
                                            <span className="text-xs text-muted-foreground mt-1">Must be {width}x{height} pixels</span>
                                        </>
                                    )}
                                </label>
                            )}
                        </div>

                        {/* Link */}
                        <div className="space-y-2">
                            <Label>Banner Link (optional)</Label>
                            <Input
                                type="url"
                                placeholder="https://example.com/sale"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Where should clicking the banner take users?</p>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                Settings saved successfully!
                            </div>
                        )}

                        {/* Submit */}
                        <Button type="submit" disabled={saving} className="w-full">
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save Banner Settings
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
