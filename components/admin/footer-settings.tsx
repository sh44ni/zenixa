"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2, AlertCircle, CheckCircle2, Globe, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube, Linkedin, MessageCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SocialLink {
    platform: string
    url: string
    label: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FooterSettingsProps {
    settings: Record<string, unknown> | null
}

const PLATFORMS = [
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "facebook", label: "Facebook", icon: Facebook },
    { value: "twitter", label: "Twitter/X", icon: Twitter },
    { value: "youtube", label: "YouTube", icon: Youtube },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin },
    { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { value: "tiktok", label: "TikTok", icon: Globe },
    { value: "other", label: "Other", icon: Globe },
]

const MAX_SOCIAL_LINKS = 6
const MAX_BRAND_TEXT = 200

export function FooterSettings({ settings }: FooterSettingsProps) {
    const [brandText, setBrandText] = useState((settings?.footerBrandText as string) || "Your one-stop shop for quality products at amazing prices. We deliver across Pakistan with care and speed.")
    const [email, setEmail] = useState((settings?.footerEmail as string) || "support@zenixa.club")
    const [phone, setPhone] = useState((settings?.footerPhone as string) || "+92 300 1234567")
    const [address, setAddress] = useState((settings?.footerAddress as string) || "Lahore, Pakistan")
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
        (settings?.footerSocialLinks as SocialLink[]) || []
    )
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleAddSocialLink = () => {
        if (socialLinks.length >= MAX_SOCIAL_LINKS) {
            setError(`Maximum ${MAX_SOCIAL_LINKS} social links allowed`)
            return
        }
        setSocialLinks([...socialLinks, { platform: "instagram", url: "", label: "" }])
    }

    const handleRemoveSocialLink = (index: number) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index))
    }

    const handleUpdateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
        const updated = [...socialLinks]
        updated[index] = { ...updated[index], [field]: value }
        setSocialLinks(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(false)

        // Validate brand text length
        if (brandText.length > MAX_BRAND_TEXT) {
            setError(`Brand text must be ${MAX_BRAND_TEXT} characters or less`)
            setSaving(false)
            return
        }

        // Validate social links
        const validLinks = socialLinks.filter(link => link.url.trim())
        for (const link of validLinks) {
            if (!link.url.startsWith("http://") && !link.url.startsWith("https://")) {
                setError("Social links must start with http:// or https://")
                setSaving(false)
                return
            }
        }

        try {
            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...settings,
                    footerBrandText: brandText.slice(0, MAX_BRAND_TEXT),
                    footerEmail: email,
                    footerPhone: phone,
                    footerAddress: address,
                    footerSocialLinks: validLinks,
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

    const getPlatformIcon = (platform: string) => {
        const found = PLATFORMS.find(p => p.value === platform)
        const Icon = found?.icon || Globe
        return <Icon className="h-4 w-4" />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Footer Settings
                </CardTitle>
                <CardDescription>
                    Customize the footer content including brand description, contact details, and social links.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Brand Description */}
                    <div className="space-y-2">
                        <Label>Brand Description</Label>
                        <Textarea
                            value={brandText}
                            onChange={(e) => setBrandText(e.target.value.slice(0, MAX_BRAND_TEXT))}
                            placeholder="Describe your store..."
                            rows={3}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {brandText.length}/{MAX_BRAND_TEXT} characters
                        </p>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Contact Details</Label>

                        <div className="grid gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="support@example.com"
                                    className="flex-1"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+92 300 1234567"
                                    className="flex-1"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="City, Country"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base font-medium">Social Links</Label>
                                <p className="text-xs text-muted-foreground">Add up to {MAX_SOCIAL_LINKS} social media links</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddSocialLink}
                                disabled={socialLinks.length >= MAX_SOCIAL_LINKS}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Link
                            </Button>
                        </div>

                        {socialLinks.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground">
                                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No social links added yet</p>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={handleAddSocialLink}
                                >
                                    Add your first link
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {socialLinks.map((link, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border">
                                        <Select
                                            value={link.platform}
                                            onValueChange={(value) => handleUpdateSocialLink(index, "platform", value)}
                                        >
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue>
                                                    <div className="flex items-center gap-2">
                                                        {getPlatformIcon(link.platform)}
                                                        <span className="hidden sm:inline">
                                                            {PLATFORMS.find(p => p.value === link.platform)?.label}
                                                        </span>
                                                    </div>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PLATFORMS.map((platform) => (
                                                    <SelectItem key={platform.value} value={platform.value}>
                                                        <div className="flex items-center gap-2">
                                                            <platform.icon className="h-4 w-4" />
                                                            {platform.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            value={link.url}
                                            onChange={(e) => handleUpdateSocialLink(index, "url", e.target.value)}
                                            placeholder="https://..."
                                            className="flex-1"
                                        />

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemoveSocialLink(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                        Save Footer Settings
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
