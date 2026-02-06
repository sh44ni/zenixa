"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Package,
    Layers,
    Box
} from "lucide-react"
import { cn } from "@/lib/utils"

type Step = "upload" | "preview" | "import" | "complete"

interface PreviewData {
    totalRows: number
    validProducts: number
    simpleCount: number
    variableCount: number
    variationCount: number
    preview: {
        type: string
        sku: string
        name: string
        price: number | null
        image: string
    }[]
    errors: string[]
}

interface ImportResult {
    created: number
    updated: number
    skipped: number
    errors: string[]
    totalErrors: number
}

export default function ImportWizardPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>("upload")
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [loading, setLoading] = useState(false)
    const [previewData, setPreviewData] = useState<PreviewData | null>(null)
    const [importResult, setImportResult] = useState<ImportResult | null>(null)
    const [progress, setProgress] = useState(0)
    const [currentProduct, setCurrentProduct] = useState("")

    const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
        { id: "upload", label: "Upload", icon: <Upload className="w-4 h-4" /> },
        { id: "preview", label: "Preview", icon: <FileSpreadsheet className="w-4 h-4" /> },
        { id: "import", label: "Import", icon: <Package className="w-4 h-4" /> },
        { id: "complete", label: "Complete", icon: <CheckCircle2 className="w-4 h-4" /> },
    ]

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile?.name.endsWith(".csv")) {
            setFile(droppedFile)
        } else {
            toast({ title: "Error", description: "Please upload a CSV file", variant: "destructive" })
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const handlePreview = async () => {
        if (!file) return
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/admin/products/import/preview", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to parse CSV")
            }

            setPreviewData(data)
            setStep("preview")
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to preview CSV",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleImport = async () => {
        if (!file) return
        setStep("import")
        setProgress(0)
        setCurrentProduct("Starting import...")

        try {
            const formData = new FormData()
            formData.append("file", file)

            // Simulate progress while waiting for import
            const progressInterval = setInterval(() => {
                setProgress(p => Math.min(p + Math.random() * 15, 90))
            }, 500)

            const res = await fetch("/api/admin/products/import", {
                method: "POST",
                body: formData,
            })

            clearInterval(progressInterval)
            setProgress(100)

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to import products")
            }

            setImportResult(data)
            setCurrentProduct("Complete!")
            setStep("complete")
        } catch (error) {
            toast({
                title: "Import Failed",
                description: error instanceof Error ? error.message : "Failed to import products",
                variant: "destructive",
            })
            setStep("preview")
        }
    }

    const handleStartOver = () => {
        setFile(null)
        setPreviewData(null)
        setImportResult(null)
        setProgress(0)
        setStep("upload")
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Import Products</h1>
                <p className="text-slate-400">Import products from a CSV file</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2">
                {steps.map((s, i) => (
                    <div key={s.id} className="flex items-center">
                        <div
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                step === s.id
                                    ? "bg-primary text-primary-foreground"
                                    : steps.findIndex(x => x.id === step) > i
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-slate-700/50 text-slate-400"
                            )}
                        >
                            {s.icon}
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-slate-600 mx-2" />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <Card className="bg-slate-800/50 border-slate-700">
                {/* Upload Step */}
                {step === "upload" && (
                    <>
                        <CardHeader>
                            <CardTitle className="text-white">Upload CSV File</CardTitle>
                            <CardDescription>
                                Drag and drop your CSV file or click to browse
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
                                    isDragging
                                        ? "border-primary bg-primary/10"
                                        : file
                                            ? "border-green-500 bg-green-500/10"
                                            : "border-slate-600 hover:border-slate-500"
                                )}
                                onClick={() => document.getElementById("file-input")?.click()}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                {file ? (
                                    <div className="space-y-2">
                                        <FileSpreadsheet className="w-12 h-12 mx-auto text-green-400" />
                                        <p className="text-white font-medium">{file.name}</p>
                                        <p className="text-slate-400 text-sm">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="w-12 h-12 mx-auto text-slate-400" />
                                        <p className="text-slate-300">
                                            Drop your CSV file here, or click to browse
                                        </p>
                                        <p className="text-slate-500 text-sm">
                                            Supports Zenixa CSV format with single/variable/variant products
                                        </p>
                                        <a
                                            href="/example-products.csv"
                                            download
                                            className="inline-block text-primary hover:underline text-sm mt-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Download example CSV
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={handlePreview}
                                    disabled={!file || loading}
                                    className="gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Parsing...
                                        </>
                                    ) : (
                                        <>
                                            Continue
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Preview Step */}
                {step === "preview" && previewData && (
                    <>
                        <CardHeader>
                            <CardTitle className="text-white">Preview Import</CardTitle>
                            <CardDescription>
                                Review the products that will be imported
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                                    <Box className="w-6 h-6 mx-auto text-blue-400 mb-2" />
                                    <p className="text-2xl font-bold text-white">{previewData.simpleCount}</p>
                                    <p className="text-slate-400 text-sm">Simple Products</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                                    <Layers className="w-6 h-6 mx-auto text-purple-400 mb-2" />
                                    <p className="text-2xl font-bold text-white">{previewData.variableCount}</p>
                                    <p className="text-slate-400 text-sm">Variable Products</p>
                                </div>
                                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                                    <Package className="w-6 h-6 mx-auto text-green-400 mb-2" />
                                    <p className="text-2xl font-bold text-white">{previewData.variationCount}</p>
                                    <p className="text-slate-400 text-sm">Variations</p>
                                </div>
                            </div>

                            {/* Preview Table */}
                            <div className="border border-slate-700 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-slate-300">Type</th>
                                            <th className="px-4 py-3 text-left text-slate-300">SKU</th>
                                            <th className="px-4 py-3 text-left text-slate-300">Name</th>
                                            <th className="px-4 py-3 text-right text-slate-300">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {previewData.preview.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-700/30">
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        "px-2 py-1 rounded text-xs font-medium",
                                                        item.type === "simple" && "bg-blue-500/20 text-blue-400",
                                                        item.type === "variable" && "bg-purple-500/20 text-purple-400",
                                                        item.type === "variation" && "bg-green-500/20 text-green-400"
                                                    )}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                                                    {item.sku}
                                                </td>
                                                <td className="px-4 py-3 text-white truncate max-w-xs">
                                                    {item.name}
                                                </td>
                                                <td className="px-4 py-3 text-right text-white">
                                                    {item.price ? `$${item.price}` : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {previewData.preview.length < previewData.validProducts && (
                                <p className="text-slate-400 text-sm text-center">
                                    Showing {previewData.preview.length} of {previewData.validProducts} products
                                </p>
                            )}

                            {/* Errors */}
                            {previewData.errors.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-red-400 mb-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="font-medium">Parse Warnings</span>
                                    </div>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        {previewData.errors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={handleStartOver} className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>
                                <Button onClick={handleImport} className="gap-2">
                                    Start Import
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Import Step */}
                {step === "import" && (
                    <>
                        <CardHeader>
                            <CardTitle className="text-white">Importing Products</CardTitle>
                            <CardDescription>
                                Please wait while your products are being imported
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 py-12">
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="flex items-center justify-center">
                                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                                </div>
                                <Progress value={progress} className="h-3" />
                                <p className="text-center text-slate-300">
                                    {currentProduct}
                                </p>
                                <p className="text-center text-slate-500 text-sm">
                                    {Math.round(progress)}% complete
                                </p>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* Complete Step */}
                {step === "complete" && importResult && (
                    <>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                                Import Complete
                            </CardTitle>
                            <CardDescription>
                                Your products have been imported successfully
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Results */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-green-400">{importResult.created}</p>
                                    <p className="text-slate-300">Created</p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-blue-400">{importResult.updated}</p>
                                    <p className="text-slate-300">Updated</p>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-yellow-400">{importResult.skipped}</p>
                                    <p className="text-slate-300">Skipped</p>
                                </div>
                            </div>

                            {/* Errors */}
                            {importResult.totalErrors > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-red-400 mb-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="font-medium">
                                            {importResult.totalErrors} Error(s)
                                        </span>
                                    </div>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        {importResult.errors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={handleStartOver}>
                                    Import More
                                </Button>
                                <Button onClick={() => router.push("/admin/products")}>
                                    View Products
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    )
}
