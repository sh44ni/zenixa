"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/lib/store"
import { SearchModal } from "./search-modal"
import {
    Home,
    Grid3X3,
    Search,
    ShoppingCart,
    User,
} from "lucide-react"

const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/categories", label: "Categories", icon: Grid3X3 },
    { href: "#search", label: "Search", icon: Search, isSearch: true },
    { href: "/cart", label: "Cart", icon: ShoppingCart, showBadge: true },
    { href: "/account", label: "Account", icon: User },
]

export function BottomNavigation() {
    const pathname = usePathname()
    const [searchOpen, setSearchOpen] = useState(false)
    const itemCount = useCartStore((state) => state.getItemCount())
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useState(() => {
        setMounted(true)
    })

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t shadow-bottom-nav"
                style={{ paddingBottom: "var(--safe-area-inset-bottom)" }}
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = item.href === "/"
                            ? pathname === "/"
                            : !item.isSearch && pathname.startsWith(item.href)

                        // Search button opens modal
                        if (item.isSearch) {
                            return (
                                <button
                                    key={item.href}
                                    onClick={() => setSearchOpen(true)}
                                    className="relative flex flex-col items-center justify-center w-16 h-full group touch-target"
                                    aria-label="Open search"
                                >
                                    {/* Floating Action Button style for search */}
                                    <div className="flex items-center justify-center w-12 h-12 -mt-4 rounded-full bg-primary text-primary-foreground shadow-elevation-2 transition-all group-active:scale-95">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </button>
                            )
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-col items-center justify-center w-16 h-full transition-colors touch-target",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                                aria-label={item.label}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="relative">
                                    <Icon className="h-5 w-5" />

                                    {/* Cart badge */}
                                    {item.showBadge && mounted && itemCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground animate-scale-in">
                                            {itemCount > 99 ? "99+" : itemCount}
                                        </span>
                                    )}
                                </div>

                                <span className="text-[10px] font-medium mt-1">{item.label}</span>

                                {/* Active indicator */}
                                {isActive && (
                                    <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-primary animate-scale-in" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Search Modal */}
            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    )
}
