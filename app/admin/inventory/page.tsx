"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Loader2,
    Search,
    Package,
    AlertTriangle,
    Check,
    X,
    Save
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface InventoryItem {
    productId: string
    variantId: string
    productName: string
    variantLabel: string
    image: string | null
    category: string
    stock: number
    minStock: number
    status: "ok" | "low" | "out"
}

interface Stats {
    total: number
    ok: number
    low: number
    out: number
}

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [stats, setStats] = useState<Stats>({ total: 0, ok: 0, low: 0, out: 0 })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState<"all" | "low" | "out">("all")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editStock, setEditStock] = useState<number>(0)
    const [editMinStock, setEditMinStock] = useState<number>(0)
    const [saving, setSaving] = useState(false)

    const fetchInventory = async () => {
        try {
            const response = await fetch(`/api/admin/inventory?filter=${filter}`)
            const data = await response.json()
            setInventory(data.inventory || [])
            setStats(data.stats || { total: 0, ok: 0, low: 0, out: 0 })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch inventory",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInventory()
    }, [filter])

    // Filter by search
    const filteredInventory = searchQuery.trim()
        ? inventory.filter(item =>
            item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.variantLabel.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : inventory

    const startEditing = (item: InventoryItem) => {
        setEditingId(item.variantId)
        setEditStock(item.stock)
        setEditMinStock(item.minStock)
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditStock(0)
        setEditMinStock(0)
    }

    const saveEdit = async (variantId: string) => {
        setSaving(true)
        try {
            const response = await fetch("/api/admin/inventory", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    updates: [{ variantId, stock: editStock, minStock: editMinStock }]
                })
            })

            if (!response.ok) throw new Error("Failed to update")

            toast({
                title: "Updated",
                description: "Stock levels saved",
            })

            setEditingId(null)
            fetchInventory()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update stock",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ok":
                return <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            case "low":
                return <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            case "out":
                return <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ok":
                return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">In Stock</span>
            case "low":
                return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Low Stock</span>
            case "out":
                return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Out of Stock</span>
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
        <div className="space-y-4 animate-fade-in overflow-x-hidden">
            {/* Header */}
            <div>
                <h1 className="admin-page-title">Inventory</h1>
                <p className="admin-page-subtitle hidden md:block">
                    Manage stock levels across all products
                </p>
            </div>

            {/* Low Stock Alert */}
            {(stats.low > 0 || stats.out > 0) && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium text-yellow-800">Stock Alerts</p>
                        <p className="text-sm text-yellow-700">
                            {stats.out > 0 && <>{stats.out} out of stock • </>}
                            {stats.low > 0 && <>{stats.low} low stock</>}
                        </p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
                <button
                    onClick={() => setFilter("all")}
                    className={cn(
                        "p-3 rounded-xl text-center transition-colors",
                        filter === "all"
                            ? "bg-[hsl(221,83%,53%)] text-white"
                            : "bg-white border border-[hsl(220,13%,91%)]"
                    )}
                >
                    <p className="text-lg font-bold">{stats.total}</p>
                    <p className="text-xs opacity-80">All</p>
                </button>
                <button
                    onClick={() => setFilter("all")}
                    className="p-3 rounded-xl text-center bg-white border border-[hsl(220,13%,91%)]"
                >
                    <p className="text-lg font-bold text-green-600">{stats.ok}</p>
                    <p className="text-xs text-[hsl(220,9%,46%)]">OK</p>
                </button>
                <button
                    onClick={() => setFilter("low")}
                    className={cn(
                        "p-3 rounded-xl text-center transition-colors",
                        filter === "low"
                            ? "bg-yellow-500 text-white"
                            : "bg-white border border-[hsl(220,13%,91%)]"
                    )}
                >
                    <p className={cn("text-lg font-bold", filter !== "low" && "text-yellow-600")}>{stats.low}</p>
                    <p className={cn("text-xs", filter === "low" ? "opacity-80" : "text-[hsl(220,9%,46%)]")}>Low</p>
                </button>
                <button
                    onClick={() => setFilter("out")}
                    className={cn(
                        "p-3 rounded-xl text-center transition-colors",
                        filter === "out"
                            ? "bg-red-500 text-white"
                            : "bg-white border border-[hsl(220,13%,91%)]"
                    )}
                >
                    <p className={cn("text-lg font-bold", filter !== "out" && "text-red-600")}>{stats.out}</p>
                    <p className={cn("text-xs", filter === "out" ? "opacity-80" : "text-[hsl(220,9%,46%)]")}>Out</p>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,9%,46%)]" />
                <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-[hsl(220,13%,91%)] bg-white"
                />
            </div>

            {/* Inventory List */}
            {filteredInventory.length === 0 ? (
                <div className="admin-list-card">
                    <div className="admin-empty-state">
                        <Package className="icon" />
                        <p className="title">No items found</p>
                        <p className="description">
                            {searchQuery ? "Try a different search" : "Add products with variants to manage inventory"}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="admin-list-card divide-y divide-[hsl(220,13%,91%)]">
                    {filteredInventory.map((item) => (
                        <div key={item.variantId} className="p-3">
                            <div className="flex items-center gap-3">
                                {/* Image */}
                                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-[hsl(220,14%,96%)] flex-shrink-0">
                                    <Image
                                        src={item.image || "/placeholder.jpg"}
                                        alt={item.productName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(item.status)}
                                        <p className="font-medium text-[hsl(222,47%,11%)] truncate text-sm">
                                            {item.productName}
                                        </p>
                                    </div>
                                    <p className="text-xs text-[hsl(220,9%,46%)]">
                                        {item.variantLabel} • {item.category}
                                    </p>
                                </div>

                                {/* Stock display or edit */}
                                {editingId === item.variantId ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                type="number"
                                                value={editStock}
                                                onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                                                className="w-16 h-8 text-center rounded-lg"
                                                min={0}
                                            />
                                            <span className="text-[10px] text-[hsl(220,9%,46%)] text-center">Stock</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                type="number"
                                                value={editMinStock}
                                                onChange={(e) => setEditMinStock(parseInt(e.target.value) || 0)}
                                                className="w-16 h-8 text-center rounded-lg"
                                                min={0}
                                            />
                                            <span className="text-[10px] text-[hsl(220,9%,46%)] text-center">Min</span>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 rounded-lg text-green-600"
                                            onClick={() => saveEdit(item.variantId)}
                                            disabled={saving}
                                        >
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 rounded-lg text-red-600"
                                            onClick={cancelEditing}
                                            disabled={saving}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => startEditing(item)}
                                        className="text-right hover:bg-[hsl(220,14%,96%)] rounded-lg px-3 py-2 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="font-bold text-[hsl(222,47%,11%)]">{item.stock}</p>
                                                <p className="text-[10px] text-[hsl(220,9%,46%)]">min: {item.minStock}</p>
                                            </div>
                                            {getStatusBadge(item.status)}
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
