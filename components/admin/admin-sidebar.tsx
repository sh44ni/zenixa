"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  CreditCard,
  Settings,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Users,
  Boxes,
  BarChart3,
  TicketPercent,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn(
        "p-4 border-b border-[hsl(220,13%,91%)] flex items-center bg-white",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <Link href="/admin" className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="Zenixa"
            className={cn(isCollapsed ? "h-6" : "h-7", "w-auto")}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-[hsl(221,83%,53%)] text-white shadow-sm"
                  : "text-[hsl(220,9%,46%)] hover:bg-[hsl(220,14%,96%)] hover:text-[hsl(222,47%,11%)]",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[hsl(220,13%,91%)] space-y-1 bg-white">
        <Link href="/" target="_blank">
          <Button
            variant="outline"
            className={cn(
              "w-full rounded-xl border-[hsl(220,13%,91%)]",
              isCollapsed ? "px-2" : "justify-start"
            )}
            title={isCollapsed ? "View Store" : undefined}
          >
            <Store className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "View Store"}
          </Button>
        </Link>
        <Button
          variant="ghost"
          className={cn(
            "w-full text-[hsl(0,84%,60%)] hover:text-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,60%,0.1)] rounded-xl",
            isCollapsed ? "px-2" : "justify-start"
          )}
          onClick={() => signOut({ callbackUrl: "/" })}
          title={isCollapsed ? "Sign Out" : undefined}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden admin-mobile-header">
        <Link href="/admin" className="flex items-center">
          <img src="/logo.svg" alt="Zenixa" className="h-6 w-auto" />
        </Link>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-[hsl(220,13%,91%)] min-h-screen sticky top-0 transition-all duration-300",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
        role="navigation"
        aria-label="Admin navigation"
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-[hsl(220,13%,91%)] bg-white shadow-sm hover:bg-[hsl(220,14%,96%)]"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>
    </>
  )
}
