"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
    User,
    ShoppingBag,
    MapPin,
    Heart,
    LogOut
} from "lucide-react"
import { signOut } from "next-auth/react"

const navItems = [
    { href: "/account", label: "Account Info", icon: User },
    { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
]

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation (Desktop) / Tabs (Mobile) */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="h-12 w-12 rounded-full bg-[hsl(221,83%,53%,0.1)] flex items-center justify-center text-[hsl(221,83%,53%)]">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">My Account</h2>
                                <p className="text-xs text-gray-500">Manage your profile</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                            isActive
                                                ? "bg-[hsl(221,83%,53%)] text-white shadow-md shadow-blue-200"
                                                : "text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                )
                            })}

                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium mt-4"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm min-h-[500px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
