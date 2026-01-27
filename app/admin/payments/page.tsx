"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, CreditCard, Banknote, Smartphone, Wallet } from "lucide-react"

const paymentSchema = z.object({
  bankTransferEnabled: z.boolean(),
  codEnabled: z.boolean(),
  requireScreenshot: z.boolean(),
  bankName: z.string().optional(),
  accountTitle: z.string().optional(),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
  bankInstructions: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      bankTransferEnabled: true,
      codEnabled: true,
      requireScreenshot: false,
    },
  })

  const bankTransferEnabled = watch("bankTransferEnabled")
  const codEnabled = watch("codEnabled")
  const requireScreenshot = watch("requireScreenshot")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/payment-settings")
      const data = await response.json()
      if (data) {
        reset(data)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PaymentFormData) => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Success",
        description: "Payment settings saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payment settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Payments</h1>
        <p className="text-sm text-muted-foreground">Configure payment methods</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Active Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cash on Delivery */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Banknote className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when delivered</p>
                  </div>
                </div>
                <Switch
                  checked={codEnabled}
                  onCheckedChange={(checked) => setValue("codEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">Direct bank transfer</p>
                  </div>
                </div>
                <Switch
                  checked={bankTransferEnabled}
                  onCheckedChange={(checked) => setValue("bankTransferEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon - Mocked Payment Methods */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* JazzCash */}
            <Card className="opacity-60 pointer-events-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <Smartphone className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">JazzCash</p>
                        <Badge variant="secondary" className="text-[10px]">Soon</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Mobile wallet</p>
                    </div>
                  </div>
                  <Switch disabled checked={false} />
                </div>
              </CardContent>
            </Card>

            {/* EasyPaisa */}
            <Card className="opacity-60 pointer-events-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">EasyPaisa</p>
                        <Badge variant="secondary" className="text-[10px]">Soon</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Mobile wallet</p>
                    </div>
                  </div>
                  <Switch disabled checked={false} />
                </div>
              </CardContent>
            </Card>

            {/* Debit Card */}
            <Card className="opacity-60 pointer-events-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Debit Card</p>
                        <Badge variant="secondary" className="text-[10px]">Soon</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">VISA / Mastercard</p>
                    </div>
                  </div>
                  <Switch disabled checked={false} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bank Account Details */}
        {bankTransferEnabled && (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Bank Account Details</CardTitle>
              <CardDescription className="text-xs">
                Shown to customers choosing bank transfer
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              {/* Require Screenshot Toggle */}
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Require Payment Proof</p>
                  <p className="text-xs text-muted-foreground">
                    Customers must upload screenshot
                  </p>
                </div>
                <Switch
                  checked={requireScreenshot}
                  onCheckedChange={(checked) => setValue("requireScreenshot", checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-sm">Bank Name</Label>
                  <Input
                    id="bankName"
                    {...register("bankName")}
                    placeholder="e.g., HBL, MCB, UBL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountTitle" className="text-sm">Account Title</Label>
                  <Input
                    id="accountTitle"
                    {...register("accountTitle")}
                    placeholder="Account holder name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber" className="text-sm">Account Number</Label>
                  <Input
                    id="accountNumber"
                    {...register("accountNumber")}
                    placeholder="Your account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban" className="text-sm">IBAN (Optional)</Label>
                  <Input
                    id="iban"
                    {...register("iban")}
                    placeholder="PK..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankInstructions" className="text-sm">Payment Instructions</Label>
                <Textarea
                  id="bankInstructions"
                  {...register("bankInstructions")}
                  placeholder="Additional instructions (e.g., add order number as reference)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
