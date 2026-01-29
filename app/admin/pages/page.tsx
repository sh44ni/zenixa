"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import {
    FileText, HelpCircle, Plus, Trash2, ChevronUp, ChevronDown,
    Loader2, Save, Eye, EyeOff, Sparkles, Edit2, Home, ShoppingBag
} from "lucide-react"
import { HeroSettingsForm } from "@/components/admin/hero-settings-form"
import { FeatureBadgesSettings } from "@/components/admin/feature-badges-settings"
import { PromoBannerSettings } from "@/components/admin/promo-banner-settings"
import { ProductDisplaySettings } from "@/components/admin/product-display-settings"
import { ProductBadgesSettings } from "@/components/admin/product-badges-settings"
import { DeliverySettings } from "@/components/admin/delivery-settings"

interface PolicyPage {
    id: string
    slug: string
    title: string
    content: string
    isActive: boolean
}

interface FaqItem {
    id: string
    question: string
    answer: string
    order: number
    category: string | null
    isActive: boolean
}

// Default policies
const defaultPolicies = [
    { slug: "shipping-policy", title: "Shipping Policy" },
    { slug: "return-policy", title: "Return Policy" },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PagesManagement() {
    const router = useRouter()
    const [policies, setPolicies] = useState<PolicyPage[]>([])
    const [faqs, setFaqs] = useState<FaqItem[]>([])
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingPolicy, setEditingPolicy] = useState<PolicyPage | null>(null)
    const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null)
    const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "" })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [policiesRes, faqsRes, settingsRes] = await Promise.all([
                fetch("/api/admin/policies"),
                fetch("/api/admin/faq"),
                fetch("/api/admin/settings")
            ])

            const policiesData = await policiesRes.json()
            const faqsData = await faqsRes.json()
            const settingsData = await settingsRes.json()

            // Merge with defaults if not exists
            const mergedPolicies = defaultPolicies.map(dp => {
                const existing = policiesData.find((p: PolicyPage) => p.slug === dp.slug)
                return existing || { id: "", slug: dp.slug, title: dp.title, content: "", isActive: true }
            })

            setPolicies(mergedPolicies)
            setFaqs(Array.isArray(faqsData) ? faqsData : [])
            setSettings(settingsData)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Policy handlers
    const savePolicy = async (policy: PolicyPage) => {
        setSaving(true)
        try {
            const isNew = !policy.id
            const url = isNew ? "/api/admin/policies" : `/api/admin/policies/${policy.slug}`
            const method = isNew ? "POST" : "PUT"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(policy),
            })

            if (!response.ok) throw new Error("Failed to save")

            toast({ title: "Saved!", description: `${policy.title} has been saved.` })
            setEditingPolicy(null)
            fetchData()
        } catch (error) {
            toast({ title: "Error", description: "Failed to save policy", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    // FAQ handlers
    const addFaq = async () => {
        if (!newFaq.question || !newFaq.answer) {
            toast({ title: "Error", description: "Question and answer are required", variant: "destructive" })
            return
        }

        setSaving(true)
        try {
            const response = await fetch("/api/admin/faq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newFaq),
            })

            if (!response.ok) throw new Error("Failed to add")

            toast({ title: "Added!", description: "FAQ item has been added." })
            setNewFaq({ question: "", answer: "", category: "" })
            fetchData()
        } catch (error) {
            toast({ title: "Error", description: "Failed to add FAQ", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const updateFaq = async (faq: FaqItem) => {
        setSaving(true)
        try {
            const response = await fetch("/api/admin/faq", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(faq),
            })

            if (!response.ok) throw new Error("Failed to update")

            toast({ title: "Updated!", description: "FAQ item has been updated." })
            setEditingFaq(null)
            fetchData()
        } catch (error) {
            toast({ title: "Error", description: "Failed to update FAQ", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const deleteFaq = async (id: string) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return

        try {
            const response = await fetch(`/api/admin/faq?id=${id}`, { method: "DELETE" })
            if (!response.ok) throw new Error("Failed to delete")

            toast({ title: "Deleted!", description: "FAQ item has been deleted." })
            fetchData()
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete FAQ", variant: "destructive" })
        }
    }

    const moveFaq = async (index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= faqs.length) return

        const updated = [...faqs]
        const [removed] = updated.splice(index, 1)
        updated.splice(newIndex, 0, removed)

        // Update order values
        const reordered = updated.map((faq, i) => ({ id: faq.id, order: i }))

        try {
            await fetch("/api/admin/faq", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reorder: true, items: reordered }),
            })
            setFaqs(updated.map((faq, i) => ({ ...faq, order: i })))
        } catch (error) {
            toast({ title: "Error", description: "Failed to reorder", variant: "destructive" })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="admin-page-title flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    Pages & Content
                </h1>
                <p className="admin-page-subtitle hidden md:block">
                    Manage policy pages and FAQ content
                </p>
            </div>

            <Tabs defaultValue="homepage" className="space-y-4">
                <TabsList className="w-full grid grid-cols-4 h-12 rounded-xl bg-[hsl(220,14%,96%)] p-1">
                    <TabsTrigger
                        value="homepage"
                        className="rounded-lg h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Homepage
                    </TabsTrigger>
                    <TabsTrigger
                        value="products"
                        className="rounded-lg h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Products
                    </TabsTrigger>
                    <TabsTrigger
                        value="policies"
                        className="rounded-lg h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Policies
                    </TabsTrigger>
                    <TabsTrigger
                        value="faq"
                        className="rounded-lg h-10 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        FAQ
                    </TabsTrigger>
                </TabsList>

                {/* Homepage Tab */}
                <TabsContent value="homepage" className="space-y-4">
                    {settings && (
                        <>
                            <HeroSettingsForm settings={settings} />
                            <FeatureBadgesSettings settings={settings} />
                            <PromoBannerSettings settings={settings} />
                        </>
                    )}
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="space-y-4">
                    {settings && (
                        <>
                            <ProductDisplaySettings settings={settings} />
                            <ProductBadgesSettings settings={settings} />
                            <DeliverySettings settings={settings} />
                        </>
                    )}
                </TabsContent>

                {/* Policies Tab */}
                <TabsContent value="policies" className="space-y-4">
                    {policies.map((policy) => (
                        <Card key={policy.slug}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{policy.title}</CardTitle>
                                        <CardDescription className="text-xs mt-1">
                                            /{policy.slug}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {policy.isActive ? (
                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                <Eye className="h-3 w-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <EyeOff className="h-3 w-3" /> Hidden
                                            </span>
                                        )}
                                        <Button
                                            size="sm"
                                            variant={editingPolicy?.slug === policy.slug ? "secondary" : "outline"}
                                            onClick={() => setEditingPolicy(
                                                editingPolicy?.slug === policy.slug ? null : policy
                                            )}
                                        >
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            {editingPolicy?.slug === policy.slug ? "Cancel" : "Edit"}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            {editingPolicy?.slug === policy.slug && (
                                <CardContent className="border-t pt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Page Title</Label>
                                        <Input
                                            value={editingPolicy.title}
                                            onChange={(e) => setEditingPolicy({
                                                ...editingPolicy,
                                                title: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content (Markdown supported)</Label>
                                        <Textarea
                                            value={editingPolicy.content}
                                            onChange={(e) => setEditingPolicy({
                                                ...editingPolicy,
                                                content: e.target.value
                                            })}
                                            rows={12}
                                            placeholder="Enter policy content here. You can use markdown formatting."
                                            className="font-mono text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={editingPolicy.isActive}
                                                onCheckedChange={(checked) => setEditingPolicy({
                                                    ...editingPolicy,
                                                    isActive: checked
                                                })}
                                            />
                                            <Label>Page is active</Label>
                                        </div>
                                        <Button
                                            onClick={() => savePolicy(editingPolicy)}
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            Save Changes
                                        </Button>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </TabsContent>

                {/* FAQ Tab */}
                <TabsContent value="faq" className="space-y-4">
                    {/* Add new FAQ */}
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add New FAQ Item
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Question</Label>
                                    <Input
                                        value={newFaq.question}
                                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                        placeholder="How do I track my order?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category (optional)</Label>
                                    <Input
                                        value={newFaq.category}
                                        onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                                        placeholder="Orders, Shipping, Returns..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Answer</Label>
                                <Textarea
                                    value={newFaq.answer}
                                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                    rows={3}
                                    placeholder="You can track your order by..."
                                />
                            </div>
                            <Button onClick={addFaq} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                                Add FAQ
                            </Button>
                        </CardContent>
                    </Card>

                    {/* FAQ List */}
                    <Card>
                        <CardHeader className="border-b bg-secondary/30">
                            <CardTitle className="text-base">FAQ Items ({faqs.length})</CardTitle>
                            <CardDescription className="text-xs">
                                Drag to reorder or use arrow buttons
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {faqs.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                    <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">No FAQ items yet</p>
                                    <p className="text-sm mt-1">Add your first question above</p>
                                </div>
                            ) : (
                                faqs.map((faq, index) => (
                                    <div
                                        key={faq.id}
                                        className="flex gap-3 p-4 border rounded-xl bg-gradient-to-r from-secondary/30 to-transparent hover:from-secondary/50 transition-all"
                                    >
                                        {/* Order controls */}
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-50 hover:opacity-100 disabled:opacity-20"
                                                onClick={() => moveFaq(index, "up")}
                                                disabled={index === 0}
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </Button>
                                            <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-50 hover:opacity-100 disabled:opacity-20"
                                                onClick={() => moveFaq(index, "down")}
                                                disabled={index === faqs.length - 1}
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-2">
                                            {editingFaq?.id === faq.id ? (
                                                <>
                                                    <Input
                                                        value={editingFaq.question}
                                                        onChange={(e) => setEditingFaq({
                                                            ...editingFaq,
                                                            question: e.target.value
                                                        })}
                                                        placeholder="Question"
                                                        className="font-medium"
                                                    />
                                                    <Textarea
                                                        value={editingFaq.answer}
                                                        onChange={(e) => setEditingFaq({
                                                            ...editingFaq,
                                                            answer: e.target.value
                                                        })}
                                                        rows={3}
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={editingFaq.category || ""}
                                                            onChange={(e) => setEditingFaq({
                                                                ...editingFaq,
                                                                category: e.target.value
                                                            })}
                                                            placeholder="Category (optional)"
                                                            className="max-w-[200px]"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={editingFaq.isActive}
                                                                onCheckedChange={(checked) => setEditingFaq({
                                                                    ...editingFaq,
                                                                    isActive: checked
                                                                })}
                                                            />
                                                            <Label className="text-xs">Active</Label>
                                                        </div>
                                                        <div className="flex-1" />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setEditingFaq(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => updateFaq(editingFaq)}
                                                            disabled={saving}
                                                        >
                                                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="font-medium text-sm">{faq.question}</p>
                                                            {faq.category && (
                                                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded mt-1 inline-block">
                                                                    {faq.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {!faq.isActive && (
                                                                <span className="text-xs text-muted-foreground mr-2">Hidden</span>
                                                            )}
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8"
                                                                onClick={() => setEditingFaq(faq)}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                                onClick={() => deleteFaq(faq.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
