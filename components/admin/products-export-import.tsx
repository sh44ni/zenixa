"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Download, Upload, Loader2 } from "lucide-react"

export function ProductsExportImport() {
    const router = useRouter()
    const [exporting, setExporting] = useState(false)

    const handleExport = async () => {
        setExporting(true)
        try {
            const response = await fetch("/api/admin/products/export")
            if (!response.ok) throw new Error("Export failed")

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `products-${new Date().toISOString().split("T")[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)

            toast({
                title: "Success",
                description: "Products exported successfully",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to export products",
                variant: "destructive",
            })
        } finally {
            setExporting(false)
        }
    }

    const handleImport = () => {
        // Navigate to the import wizard
        router.push("/admin/products/import")
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
                {exporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                <span className="hidden sm:inline">Export CSV</span>
            </Button>

            <Button variant="outline" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Import CSV</span>
            </Button>
        </div>
    )
}
