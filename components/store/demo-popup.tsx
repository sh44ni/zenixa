"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Lock, ExternalLink, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function DemoPopup() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Show popup after 1 second delay
        const timer = setTimeout(() => setIsVisible(true), 1000)
        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 right-4 z-50 w-full max-w-sm"
                >
                    <div className="mx-4 md:mr-4 bg-white/90 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl p-5 relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400" />

                        {/* Close Button */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-black/5"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                                <ShieldAlert className="h-6 w-6 text-primary" />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Demo Store Mode</h3>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                        This is a live demo of the Zenixa e-commerce platform. Feel free to explore and test features.
                                    </p>
                                </div>

                                <div className="bg-secondary/50 rounded-lg p-3 text-sm space-y-1.5 border border-black/5">
                                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        <span>Admin Access</span>
                                        <Lock className="h-3 w-3" />
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-12">Email:</span>
                                        <span className="font-mono font-medium text-foreground select-all">admin@zenixa.pk</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-12">Pass:</span>
                                        <span className="font-mono font-medium text-foreground select-all">admin</span>
                                    </div>
                                </div>

                                <div className="pt-1">
                                    <Button asChild className="w-full shadow-lg shadow-primary/20" size="sm">
                                        <Link href="/admin" target="_blank">
                                            Go to Admin Panel
                                            <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
