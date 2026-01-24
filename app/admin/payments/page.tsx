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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Loader2, CreditCard, Banknote } from "lucide-react"

const paymentSchema = z.object({
  bankTransferEnabled: z.boolean(),
  codEnabled: z.boolean(),
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
    },
  })

  const bankTransferEnabled = watch("bankTransferEnabled")
  const codEnabled = watch("codEnabled")

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <p className="text-muted-foreground">Configure payment methods for your store</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash on Delivery */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Banknote className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Cash on Delivery</CardTitle>
                    <CardDescription>Accept payment upon delivery</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={codEnabled}
                  onCheckedChange={(checked) => setValue("codEnabled", checked)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                When enabled, customers can pay cash when they receive their order.
                This is a popular payment method in Pakistan.
              </p>
            </CardContent>
          </Card>

          {/* Bank Transfer */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Bank Transfer</CardTitle>
                    <CardDescription>Accept direct bank transfers</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={bankTransferEnabled}
                  onCheckedChange={(checked) => setValue("bankTransferEnabled", checked)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                When enabled, customers can pay via direct bank transfer.
                You&apos;ll need to provide your bank account details below.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bank Account Details */}
        {bankTransferEnabled && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
              <CardDescription>
                These details will be shown to customers who choose bank transfer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    {...register("bankName")}
                    placeholder="e.g., HBL, MCB, UBL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountTitle">Account Title</Label>
                  <Input
                    id="accountTitle"
                    {...register("accountTitle")}
                    placeholder="Account holder name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    {...register("accountNumber")}
                    placeholder="Your account number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN (Optional)</Label>
                  <Input
                    id="iban"
                    {...register("iban")}
                    placeholder="PK..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankInstructions">Payment Instructions</Label>
                <Textarea
                  id="bankInstructions"
                  {...register("bankInstructions")}
                  placeholder="Additional instructions for customers (e.g., add order number as reference)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
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
