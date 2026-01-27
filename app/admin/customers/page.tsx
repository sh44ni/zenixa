"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Loader2,
    Search,
    Users,
    Download,
    ChevronRight,
    Mail,
    Phone,
    ShoppingBag,
    ArrowUpDown
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminListSkeleton, AdminTableSkeleton } from "@/components/admin/admin-skeletons"
import { toast } from "@/hooks/use-toast"

interface Customer {
    id: string
    name: string
    email: string
    phone: string
    city: string
    orderCount: number
    totalSpent: number
    lastOrder: string | null
    createdAt: string
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    const fetchCustomers = async () => {
        try {
            const params = new URLSearchParams({
                search: searchQuery,
                sortBy,
                sortOrder,
            })
            const response = await fetch(`/api/admin/customers?${params}`)
            const data = await response.json()
            setCustomers(data.customers || [])
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch customers",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [searchQuery, sortBy, sortOrder])

    const handleExport = () => {
        window.open("/api/admin/customers/export", "_blank")
        toast({
            title: "Exporting",
            description: "Customer data is being downloaded",
        })
    }

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(field)
            setSortOrder("desc")
        }
    }

    const formatDate = (date: string | null) => {
        if (!date) return "Never"
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    if (loading) {
        return (
            <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between gap-3">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-48 hidden md:block" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="lg:hidden">
                    <AdminListSkeleton />
                </div>
                <div className="hidden lg:block">
                    <AdminTableSkeleton />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-fade-in overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="admin-page-title">Customers</h1>
                    <p className="admin-page-subtitle hidden md:block">
                        {customers.length} registered customer(s)
                    </p>
                </div>
                <button onClick={handleExport} className="admin-action-btn secondary">
                    <Download className="h-4 w-4" />
                    <span className="hidden md:inline">Export CSV</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,9%,46%)]" />
                <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-[hsl(220,13%,91%)] bg-white"
                />
            </div>

            {/* Customers */}
            {customers.length === 0 ? (
                <div className="admin-list-card">
                    <div className="admin-empty-state">
                        <Users className="icon" />
                        <p className="title">{searchQuery ? "No matching customers" : "No customers yet"}</p>
                        <p className="description">
                            {searchQuery ? "Try a different search" : "Customers will appear after checkout"}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Mobile: Card list */}
                    <div className="space-y-3 lg:hidden">
                        {customers.map((customer) => (
                            <div
                                key={customer.id}
                                className="admin-order-card"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar/Initials */}
                                    <div className="h-12 w-12 rounded-lg bg-[hsl(220,14%,96%)] flex items-center justify-center flex-shrink-0 text-[hsl(220,9%,46%)]">
                                        <span className="font-semibold text-lg">{customer.name.charAt(0).toUpperCase()}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                            <p className="font-medium text-[hsl(222,47%,11%)] truncate">{customer.name}</p>
                                            <span className="text-xs text-[hsl(220,9%,46%)] truncate max-w-[80px]">{customer.city}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 mb-2 text-xs text-[hsl(220,9%,46%)]">
                                            <Mail className="h-3 w-3" />
                                            <p className="truncate">{customer.email}</p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <ShoppingBag className="h-3.5 w-3.5 text-[hsl(221,83%,53%)]" />
                                                <span className="text-sm font-medium text-[hsl(222,47%,11%)]">{customer.orderCount}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-bold text-[hsl(142,76%,36%)]">{formatPrice(customer.totalSpent)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <Link href={`/admin/customers/${customer.id}`}>
                                        <button className="p-2 rounded-xl hover:bg-[hsl(220,14%,96%)] transition-colors text-[hsl(220,9%,46%)]">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Table */}
                    <div className="admin-list-card hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[hsl(220,13%,91%)]">
                                    <th className="text-left p-4 font-medium text-[hsl(220,9%,46%)]">
                                        <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-[hsl(222,47%,11%)]">
                                            Name
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="text-left p-4 font-medium text-[hsl(220,9%,46%)]">Email</th>
                                    <th className="text-left p-4 font-medium text-[hsl(220,9%,46%)]">Phone</th>
                                    <th className="text-left p-4 font-medium text-[hsl(220,9%,46%)]">
                                        <button onClick={() => toggleSort("orderCount")} className="flex items-center gap-1 hover:text-[hsl(222,47%,11%)]">
                                            Orders
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="text-left p-4 font-medium text-[hsl(220,9%,46%)]">
                                        <button onClick={() => toggleSort("totalSpent")} className="flex items-center gap-1 hover:text-[hsl(222,47%,11%)]">
                                            Total Spent
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="text-left p-4 font-medium text-[hsl(220,9%,46%)]">
                                        <button onClick={() => toggleSort("lastOrder")} className="flex items-center gap-1 hover:text-[hsl(222,47%,11%)]">
                                            Last Order
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-[hsl(220,13%,94%)] hover:bg-[hsl(220,14%,98%)]">
                                        <td className="p-4">
                                            <p className="font-medium text-[hsl(222,47%,11%)]">{customer.name}</p>
                                            <p className="text-xs text-[hsl(220,9%,46%)]">{customer.city}</p>
                                        </td>
                                        <td className="p-4 text-[hsl(220,9%,46%)]">{customer.email}</td>
                                        <td className="p-4 text-[hsl(220,9%,46%)]">{customer.phone}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(221,83%,53%,0.1)] text-[hsl(221,83%,53%)] text-sm font-medium">
                                                {customer.orderCount}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-[hsl(142,76%,36%)]">
                                            {formatPrice(customer.totalSpent)}
                                        </td>
                                        <td className="p-4 text-[hsl(220,9%,46%)]">
                                            {formatDate(customer.lastOrder)}
                                        </td>
                                        <td className="p-4">
                                            <Link href={`/admin/customers/${customer.id}`}>
                                                <Button variant="ghost" size="icon" className="rounded-xl">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
