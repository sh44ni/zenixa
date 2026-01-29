"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Loader2, Truck, Gift } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface DeliverySettingsProps {
    settings: any
}

export function DeliverySettings({ settings }: DeliverySettingsProps) {
    const [saving, setSaving] = useState(false)
    const [deliveryCharges, setDeliveryCharges] = useState<number>(settings?.deliveryCharges ?? 250)
    const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(settings?.freeDeliveryEnabled ?? true)
    const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(settings?.freeDeliveryThreshold ?? 5000)
    const [alwaysFreeDelivery, setAlwaysFreeDelivery] = useState(settings?.alwaysFreeDelivery ?? false)

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deliveryCharges,
                    freeDeliveryEnabled,
                    freeDeliveryThreshold,
                    alwaysFreeDelivery,
                }),
            })

            if (!res.ok) throw new Error("Failed to save")

            toast({ title: "Saved!", description: "Delivery settings updated" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    // Calculate example shipping for preview
    const getExampleShipping = (cartTotal: number) => {
        if (alwaysFreeDelivery) return 0
        if (freeDeliveryEnabled && cartTotal >= freeDeliveryThreshold) return 0
        return deliveryCharges
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Charges
                </CardTitle>
                <CardDescription>
                    Configure delivery fees and free delivery thresholds
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Always Free Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50">
                    <div className="flex items-center gap-3">
                        <Gift className="h-5 w-5 text-green-600" />
                        <div>
                            <Label className="font-semibold">Always Free Delivery</Label>
                            <p className="text-sm text-muted-foreground">
                                Make delivery free for all orders regardless of amount
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={alwaysFreeDelivery}
                        onCheckedChange={setAlwaysFreeDelivery}
                    />
                </div>

                {/* Delivery Charges */}
                <div className={`space-y-4 ${alwaysFreeDelivery ? "opacity-50 pointer-events-none" : ""}`}>
                    <div className="space-y-2">
                        <Label>Delivery Charges (PKR)</Label>
                        <Input
                            type="number"
                            value={deliveryCharges}
                            onChange={(e) => setDeliveryCharges(Number(e.target.value))}
                            placeholder="250"
                            min={0}
                        />
                        <p className="text-xs text-muted-foreground">
                            Standard delivery charge applied to orders
                        </p>
                    </div>

                    {/* Free Delivery Threshold */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="font-semibold">Enable Free Delivery Threshold</Label>
                                <p className="text-sm text-muted-foreground">
                                    Waive delivery fee for orders above a certain amount
                                </p>
                            </div>
                            <Switch
                                checked={freeDeliveryEnabled}
                                onCheckedChange={setFreeDeliveryEnabled}
                            />
                        </div>

                        {freeDeliveryEnabled && (
                            <div className="space-y-2">
                                <Label>Free Delivery Threshold (PKR)</Label>
                                <Input
                                    type="number"
                                    value={freeDeliveryThreshold}
                                    onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                                    placeholder="5000"
                                    min={0}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Orders of this amount or more get free delivery
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview */}
                <div className="border rounded-lg p-4 bg-secondary/10">
                    <p className="text-sm font-medium mb-3">Preview (how it appears at checkout)</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Cart: {formatPrice(2000)}</span>
                            <span>Delivery: {getExampleShipping(2000) === 0 ? <span className="text-green-600">Free</span> : formatPrice(getExampleShipping(2000))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cart: {formatPrice(5000)}</span>
                            <span>Delivery: {getExampleShipping(5000) === 0 ? <span className="text-green-600">Free</span> : formatPrice(getExampleShipping(5000))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cart: {formatPrice(10000)}</span>
                            <span>Delivery: {getExampleShipping(10000) === 0 ? <span className="text-green-600">Free</span> : formatPrice(getExampleShipping(10000))}</span>
                        </div>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Delivery Settings"
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
