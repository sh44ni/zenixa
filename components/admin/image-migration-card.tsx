"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Loader2, ImageIcon, CheckCircle, AlertCircle } from "lucide-react"

export function ImageMigrationCard() {
    const [migrating, setMigrating] = useState(false)
    const [result, setResult] = useState<{
        success: boolean
        productsUpdated: number
        imagesCloned: number
    } | null>(null)

    const handleMigrate = async () => {
        setMigrating(true)
        setResult(null)

        try {
            const response = await fetch("/api/admin/media/migrate", {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Migration failed")
            }

            const data = await response.json()
            setResult(data)

            toast({
                title: "Migration Complete!",
                description: `${data.imagesCloned} images cloned, ${data.productsUpdated} products updated`,
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to migrate images. Check console for details.",
                variant: "destructive",
            })
        } finally {
            setMigrating(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ImageIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Migrate External Images</CardTitle>
                            <CardDescription className="text-xs">
                                Clone all external URLs to local storage
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline">One-time</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    This will download all external images (Unsplash, etc.) from your products,
                    convert them to <strong>WebP format</strong> for better compression,
                    and save them locally in <code className="bg-muted px-1 rounded">/uploads/</code>.
                </p>

                {result && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${result.imagesCloned > 0
                            ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                            : "bg-muted"
                        }`}>
                        {result.imagesCloned > 0 ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <span className="text-sm">
                            {result.imagesCloned > 0 ? (
                                <>
                                    <strong>{result.imagesCloned}</strong> images cloned,
                                    <strong>{result.productsUpdated}</strong> products updated
                                </>
                            ) : (
                                "No external images found to migrate"
                            )}
                        </span>
                    </div>
                )}

                <Button
                    onClick={handleMigrate}
                    disabled={migrating}
                    className="w-full"
                >
                    {migrating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Migrating Images...
                        </>
                    ) : (
                        <>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Migrate All External Images
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
