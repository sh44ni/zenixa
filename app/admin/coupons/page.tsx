"use client"

import { useState, useEffect } from "react"
import { formatPrice, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Loader2, Plus, TicketPercent, Trash2, Calendar, Ban, CheckCircle2 } from "lucide-react"
import { Coupon } from "@/types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        value: "",
        type: "PERCENTAGE",
        startDate: "",
        endDate: "",
        usageLimit: "",
    })

    // Fetch Coupons
    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/admin/coupons")
            if (!res.ok) throw new Error("Failed")
            const data = await res.json()
            setCoupons(data)
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch coupons", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    // Create Coupon
    const handleCreate = async () => {
        if (!formData.code || !formData.value) {
            toast({ title: "Error", description: "Code and discount value are required", variant: "destructive" })
            return
        }

        setCreating(true)
        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create")
            }

            toast({ title: "Success", description: "Coupon created successfully" })
            setDialogOpen(false)
            fetchCoupons()
            setFormData({
                code: "",
                value: "",
                type: "PERCENTAGE",
                startDate: "",
                endDate: "",
                usageLimit: "",
            })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setCreating(false)
        }
    }

    // Toggle Status
    const toggleStatus = async (coupon: Coupon) => {
        // Optimistic update
        setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))

        try {
            await fetch(`/api/admin/coupons/${coupon.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !coupon.isActive }),
            })
        } catch (error) {
            fetchCoupons() // Revert on error
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        }
    }

    // Delete Coupon
    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed")

            setCoupons(coupons.filter(c => c.id !== id))
            toast({ title: "Deleted", description: "Coupon deleted successfully" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete coupon", variant: "destructive" })
        } finally {
            setDeletingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(221,83%,53%)]" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(221,83%,53%)] to-[hsl(262,83%,58%)]">
                        Coupons
                    </h1>
                    <p className="text-[hsl(220,9%,46%)]">Manage discount codes and promotions</p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Create New
                </Button>
            </div>

            {coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-[hsl(220,13%,91%)]">
                    <TicketPercent className="h-12 w-12 text-[hsl(220,9%,80%)] mb-4" />
                    <h3 className="text-lg font-medium text-[hsl(222,47%,11%)]">No coupons yet</h3>
                    <p className="text-[hsl(220,9%,46%)] mb-6">Create your first discount code to get started</p>
                    <Button variant="outline" onClick={() => setDialogOpen(true)}>Create Coupon</Button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-[hsl(220,13%,91%)] overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[hsl(220,14%,98%)] hover:bg-[hsl(220,14%,98%)] text-[hsl(220,9%,46%)]">
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Validity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell>
                                        <div className="font-mono font-bold text-lg text-[hsl(222,47%,11%)] bg-[hsl(220,14%,96%)] inline-block px-2 py-1 rounded">
                                            {coupon.code}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-green-600">
                                            {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `-${formatPrice(coupon.value)}`}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <span className="font-medium">{coupon.usedCount}</span>
                                            <span className="text-[hsl(220,9%,60%)]"> / {coupon.usageLimit || "∞"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-[hsl(220,9%,46%)] space-y-1">
                                            {coupon.startDate ? (
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <span className="w-10">Start:</span>
                                                    <span className="font-medium">{new Date(coupon.startDate).toLocaleDateString()}</span>
                                                </div>
                                            ) : <span className="text-xs block text-[hsl(220,9%,80%)]">No start date</span>}

                                            {coupon.endDate ? (
                                                <div className="flex items-center gap-1.5 text-xs text-orange-600/80">
                                                    <span className="w-10">End:</span>
                                                    <span className="font-medium">{new Date(coupon.endDate).toLocaleDateString()}</span>
                                                </div>
                                            ) : <span className="text-xs block text-[hsl(220,9%,80%)]">No expiry</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={coupon.isActive}
                                                onCheckedChange={() => toggleStatus(coupon)}
                                                className="scale-75"
                                            />
                                            <Badge variant={coupon.isActive ? "default" : "secondary"} className="h-5 text-[10px]">
                                                {coupon.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(coupon.id)}
                                            disabled={deletingId === coupon.id}
                                            className="text-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,60%,0.1)] hover:text-[hsl(0,84%,60%)]"
                                        >
                                            {deletingId === coupon.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Coupon</DialogTitle>
                        <DialogDescription>Define your new discount code rules.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Coupon Code</Label>
                            <Input
                                id="code"
                                placeholder="e.g. SUMMER25"
                                className="uppercase tracking-wider font-bold"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                        <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="value">Discount Value</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    placeholder={formData.type === "PERCENTAGE" ? "10" : "500"}
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start">Start Date (Optional)</Label>
                                <Input
                                    id="start"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="block"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end">End Date (Optional)</Label>
                                <Input
                                    id="end"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="block"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="usage">Usage Limit (Optional)</Label>
                            <Input
                                id="usage"
                                type="number"
                                placeholder="e.g. 100 uses (Leave empty for unlimited)"
                                value={formData.usageLimit}
                                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={creating}>
                            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Coupon"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
