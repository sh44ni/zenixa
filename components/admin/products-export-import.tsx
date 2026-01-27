"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Download, Upload, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function ProductsExportImport() {
    const [exporting, setExporting] = useState(false)
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState<{
        created: number
        updated: number
        errors: string[]
        totalErrors: number
    } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setImporting(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/admin/products/import", {
                method: "POST",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Import failed")
            }

            setImportResult(result)

            toast({
                title: "Import Complete",
                description: `Created: ${result.created}, Updated: ${result.updated}${result.totalErrors > 0 ? `, Errors: ${result.totalErrors}` : ""}`,
            })

            // Refresh page to show new products
            if (result.created > 0 || result.updated > 0) {
                setTimeout(() => window.location.reload(), 1500)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Import failed",
                variant: "destructive",
            })
        } finally {
            setImporting(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    return (
        <>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport} disabled={exporting}>
                    {exporting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Export CSV</span>
                </Button>

                <label>
                    <Button variant="outline" asChild disabled={importing}>
                        <span className="cursor-pointer">
                            {importing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">Import CSV</span>
                        </span>
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleImport}
                        disabled={importing}
                    />
                </label>
            </div>

            <Dialog open={!!importResult} onOpenChange={() => setImportResult(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Results</DialogTitle>
                        <DialogDescription>Summary of the import operation</DialogDescription>
                    </DialogHeader>
                    {importResult && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{importResult.created}</p>
                                    <p className="text-sm text-muted-foreground">Created</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{importResult.updated}</p>
                                    <p className="text-sm text-muted-foreground">Updated</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <p className="text-2xl font-bold text-red-600">{importResult.totalErrors}</p>
                                    <p className="text-sm text-muted-foreground">Errors</p>
                                </div>
                            </div>
                            {importResult.errors.length > 0 && (
                                <div className="max-h-40 overflow-y-auto">
                                    <p className="font-medium text-sm mb-2">Error Details:</p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        {importResult.errors.map((error, i) => (
                                            <li key={i} className="text-red-600">• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
