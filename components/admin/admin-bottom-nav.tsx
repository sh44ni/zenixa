"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
    LayoutDashboard,
    ShoppingCart,
    Plus,
    Package,
    MoreHorizontal,
    ImageIcon,
    FolderTree,
    CreditCard,
    Settings,
    LogOut,
    X,
    Users,
    Boxes,
    BarChart3,
    TicketPercent,
} from "lucide-react"
import { signOut } from "next-auth/react"

const mainNavItems = [
    { href: "/admin", label: "Home", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/products/new", label: "Add", icon: Plus, isCenter: true },
    { href: "/admin/products", label: "Products", icon: Package },
]

const moreMenuItems = [
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/inventory", label: "Inventory", icon: Boxes },
    { href: "/admin/media", label: "Media", icon: ImageIcon },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminBottomNav() {
    const pathname = usePathname()
    const [showMore, setShowMore] = useState(false)

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin"
        if (href === "/admin/products/new") return pathname === "/admin/products/new"
        if (href === "/admin/products") return pathname.startsWith("/admin/products") && pathname !== "/admin/products/new"
        return pathname.startsWith(href)
    }

    // Check if any "more" item is active
    const isMoreActive = moreMenuItems.some(item => pathname.startsWith(item.href))

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav className="admin-bottom-nav lg:hidden">
                <div className="admin-bottom-nav-inner">
                    {mainNavItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)

                        if (item.isCenter) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="admin-fab"
                                    aria-label="Add new product"
                                >
                                    <Icon className="h-6 w-6" />
                                </Link>
                            )
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "admin-nav-item",
                                    active && "active"
                                )}
                            >
                                <Icon className="icon" />
                                <span className="label">{item.label}</span>
                            </Link>
                        )
                    })}

                    {/* More Button */}
                    <button
                        onClick={() => setShowMore(true)}
                        className={cn(
                            "admin-nav-item",
                            isMoreActive && "active"
                        )}
                    >
                        <MoreHorizontal className="icon" />
                        <span className="label">More</span>
                    </button>
                </div>
            </nav>

            {/* More Menu Overlay */}
            {showMore && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowMore(false)}
                    />

                    {/* Sheet */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-slide-up">
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 rounded-full bg-[hsl(220,9%,80%)]" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-4 border-b border-[hsl(220,13%,91%)]">
                            <h2 className="text-lg font-semibold text-[hsl(222,47%,11%)]">More Options</h2>
                            <button
                                onClick={() => setShowMore(false)}
                                className="p-2 rounded-xl hover:bg-[hsl(220,14%,96%)] transition-colors"
                            >
                                <X className="h-5 w-5 text-[hsl(220,9%,46%)]" />
                            </button>
                        </div>

                        {/* Menu Grid */}
                        <div className="grid grid-cols-4 gap-2 p-5">
                            {moreMenuItems.map((item) => {
                                const Icon = item.icon
                                const active = pathname.startsWith(item.href)

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setShowMore(false)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all",
                                            active
                                                ? "bg-[hsl(221,83%,53%,0.1)]"
                                                : "hover:bg-[hsl(220,14%,96%)]"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                                            active ? "bg-[hsl(221,83%,53%)] text-white" : "bg-[hsl(220,14%,96%)] text-[hsl(220,9%,46%)]"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-medium",
                                            active ? "text-[hsl(221,83%,53%)]" : "text-[hsl(222,47%,11%)]"
                                        )}>
                                            {item.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Logout Button */}
                        <div className="px-5 pb-5">
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[hsl(0,84%,60%,0.1)] text-[hsl(0,84%,60%)] font-medium transition-colors hover:bg-[hsl(0,84%,60%,0.15)]"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </button>
                        </div>

                        {/* Safe area padding */}
                        <div className="h-safe-bottom" />
                    </div>
                </div>
            )}
        </>
    )
}
