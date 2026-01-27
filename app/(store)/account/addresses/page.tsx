"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Loader2,
    MapPin,
    Plus,
    Trash2,
    MoreVertical
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface Address {
    id: string
    name: string
    address: string
    city: string
    phone: string
    isDefault: boolean
}

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [newAddress, setNewAddress] = useState({
        name: "",
        address: "",
        city: "",
        phone: "",
        isDefault: false,
    })

    const fetchAddresses = async () => {
        try {
            const res = await fetch("/api/account/addresses")
            const data = await res.json()
            setAddresses(data)
        } catch (error) {
            console.error("Failed to fetch addresses")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [])

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch("/api/account/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAddress),
            })
            if (!res.ok) throw new Error("Failed to add")

            await fetchAddresses()
            setOpen(false)
            setNewAddress({ name: "", address: "", city: "", phone: "", isDefault: false })
            toast({ title: "Address added successfully" })
        } catch (error) {
            toast({ title: "Failed to add address", variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return

        try {
            const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete")

            setAddresses(addresses.filter(a => a.id !== id))
            toast({ title: "Address deleted" })
        } catch (error) {
            toast({ title: "Failed to delete", variant: "destructive" })
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(221,83%,53%)]" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Address Book</h1>
                    <p className="text-gray-500">Manage your shipping addresses</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[hsl(221,83%,53%)]">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Recipient Name</label>
                                <Input
                                    required
                                    value={newAddress.name}
                                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input
                                    required
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    placeholder="+1 234..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <Input
                                    required
                                    value={newAddress.address}
                                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                    placeholder="Street address, Apt, Suite"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">City</label>
                                <Input
                                    required
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                    placeholder="City"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="default"
                                    checked={newAddress.isDefault}
                                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="default" className="text-sm">Set as default address</label>
                            </div>
                            <Button type="submit" className="w-full bg-[hsl(221,83%,53%)]" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Address"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                    <div key={addr.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-100 transition-colors relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(addr.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${addr.isDefault ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">{addr.name}</span>
                                    {addr.isDefault && (
                                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm">{addr.address}</p>
                                <p className="text-gray-600 text-sm">{addr.city}</p>
                                <p className="text-gray-500 text-xs mt-2">{addr.phone}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {addresses.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                        <p>No addresses saved yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
