"use client"

import { Button } from "@/components/ui/button"
import { Trash2, X, Download, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface BulkActionBarProps {
    selectedCount: number
    onDelete: () => void
    onExport?: () => void
    onClear: () => void
    className?: string
}

export function BulkActionBar({
    selectedCount,
    onDelete,
    onExport,
    onClear,
    className,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null

    return (
        <div
            className={cn(
                "fixed bottom-24 lg:bottom-4 left-1/2 -translate-x-1/2 z-50",
                "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
                "border rounded-full shadow-lg px-4 py-2",
                "flex items-center gap-3 animate-in slide-in-from-bottom-4",
                className
            )}
        >
            <div className="flex items-center gap-2 text-sm font-medium">
                <FileCheck className="h-4 w-4 text-primary" />
                <span>{selectedCount} selected</span>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-1">
                {onExport && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onExport}
                        className="gap-1.5"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClear}
                    className="h-8 w-8"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
