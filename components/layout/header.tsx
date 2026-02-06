"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { useCartStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ShoppingCart,
  User,
  Search,
  Package,
  LogOut,
  Heart,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function Header() {
  const { data: session } = useSession()
  const itemCount = useCartStore((state) => state.getItemCount())
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-border/10"
          : "bg-white/80 backdrop-blur-md"
          }`}
      >
        <div className="container mx-auto px-4 w-full h-16 md:h-20 flex items-center justify-between">

          {/* Mobile: Logo Only (Centered) */}
          <div className="flex md:hidden w-full items-center justify-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="Zenixa" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop: Full Layout */}
          <div className="hidden md:flex w-full items-center justify-between gap-8">
            {/* Logo - no pill */}
            <Link href="/" className="flex items-center group shrink-0">
              <img src="/logo.svg" alt="Zenixa" className="h-9 w-auto group-hover:scale-105 transition-transform duration-300" />
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-1">
              {[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/products" },
                { label: "Categories", href: "/categories" },
                { label: "Track Order", href: "/tracking" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors hover:bg-secondary/50 rounded-full"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary" onClick={() => router.push('/products')}>
                <Search className="h-5 w-5" />
              </Button>

              <Link href="/account/wishlist">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary relative">
                  <ShoppingCart className="h-5 w-5" />
                  {mounted && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-[10px] text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary border border-transparent hover:border-border">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl border border-border/50 shadow-xl bg-white p-2 mt-2">
                    <DropdownMenuLabel className="p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="rounded-xl cursor-pointer">
                        <User className="mr-2 h-4 w-4" /> Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="rounded-xl cursor-pointer">
                        <Package className="mr-2 h-4 w-4" /> Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()} className="rounded-xl cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button className="rounded-full px-6 bg-foreground text-background hover:bg-primary hover:text-white transition-all shadow-md">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
