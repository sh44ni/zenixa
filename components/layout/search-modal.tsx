"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { X, Search, Clock, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const RECENT_SEARCHES_KEY = "zenixa_recent_searches"
const MAX_RECENT_SEARCHES = 5

const popularSearches = [
    "Electronics",
    "Clothing",
    "Accessories",
    "Home & Living",
    "Sports",
]

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
    const [query, setQuery] = useState("")
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved))
            } catch {
                setRecentSearches([])
            }
        }
    }, [])

    // Focus input when modal opens
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [open])

    // Handle body scroll lock
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [open])

    const saveSearch = (searchTerm: string) => {
        const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, MAX_RECENT_SEARCHES)
        setRecentSearches(updated)
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    }

    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem(RECENT_SEARCHES_KEY)
    }

    const handleSearch = (searchTerm: string) => {
        if (!searchTerm.trim()) return

        saveSearch(searchTerm.trim())
        onOpenChange(false)
        router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSearch(query)
    }

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-[100] bg-background animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
        >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b">
                <form onSubmit={handleSubmit} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            type="search"
                            placeholder="Search products..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10 pr-4 h-11 rounded-card"
                            aria-label="Search products"
                        />
                    </div>
                </form>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                    aria-label="Close search"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Recent Searches
                            </h3>
                            <button
                                onClick={clearRecentSearches}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Clear all
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {recentSearches.map((search, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSearch(search)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm rounded-pill",
                                        "bg-muted hover:bg-muted/80 transition-colors"
                                    )}
                                >
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Popular Searches */}
                <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4" />
                        Popular Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search) => (
                            <button
                                key={search}
                                onClick={() => handleSearch(search)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-pill",
                                    "bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                )}
                            >
                                {search}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
