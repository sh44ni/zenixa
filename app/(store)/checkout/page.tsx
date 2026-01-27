"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Loader2, CreditCard, Banknote, AlertCircle } from "lucide-react"

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  shippingAddress: z.string().min(10, "Please enter your complete address"),
  city: z.string().min(2, "Please enter your city"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["BANK_TRANSFER", "COD"]),
  notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface PaymentSettings {
  bankTransferEnabled: boolean
  codEnabled: boolean
  bankName: string | null
  accountTitle: string | null
  accountNumber: string | null
  iban: string | null
  bankInstructions: string | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)

  // Coupon State
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number } | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "COD",
    },
  })

  const selectedPayment = watch("paymentMethod")

  useEffect(() => {
    // Fetch payment settings
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then((data) => setPaymentSettings(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    // Pre-fill user data if logged in
    if (session?.user) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.name) setValue("customerName", data.name)
          if (data.email) setValue("customerEmail", data.email)
          if (data.phone) setValue("customerPhone", data.phone)
          if (data.address) setValue("shippingAddress", data.address)
          if (data.city) setValue("city", data.city)
        })
        .catch(console.error)
    }
  }, [session, setValue])

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  const subtotal = getTotal()

  let discountAmount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discountAmount = (subtotal * appliedCoupon.value) / 100
    } else {
      discountAmount = appliedCoupon.value
    }
  }

  const shipping = subtotal >= 5000 ? 0 : 250
  const total = Math.max(0, subtotal + shipping - discountAmount) // Ensure total doesn't go negative

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    try {
      const res = await fetch("/api/checkout/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Invalid coupon")

      setAppliedCoupon(data.coupon)
      toast({ title: "Coupon Applied", description: "Discount added successfully!" })
    } catch (error: any) {
      setAppliedCoupon(null)
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true)
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        variantId: item.variant?.id || null,
        quantity: item.quantity,
        price: item.product.price + (item.variant?.priceModifier || 0),
      }))

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: orderItems,

          subtotal,
          shipping,
          discount: discountAmount,
          couponCode: appliedCoupon?.code,
          total,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const order = await response.json()
      clearCart()

      toast({
        title: "Order placed successfully!",
        description: `Your order number is ${order.orderNumber}`,
      })

      router.push(`/order-confirmation/${order.orderNumber}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      {...register("customerName")}
                      placeholder="Enter your full name"
                    />
                    {errors.customerName && (
                      <p className="text-sm text-destructive">{errors.customerName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      {...register("customerEmail")}
                      placeholder="Enter your email"
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-destructive">{errors.customerEmail.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    {...register("customerPhone")}
                    placeholder="Enter your phone number"
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-destructive">{errors.customerPhone.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Complete Address *</Label>
                  <Textarea
                    id="shippingAddress"
                    {...register("shippingAddress")}
                    placeholder="House/Apartment number, Street name, Area"
                    rows={3}
                  />
                  {errors.shippingAddress && (
                    <p className="text-sm text-destructive">{errors.shippingAddress.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="Enter your city"
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      {...register("postalCode")}
                      placeholder="Enter postal code (optional)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={selectedPayment}
                  onValueChange={(value) => setValue("paymentMethod", value as "BANK_TRANSFER" | "COD")}
                >
                  {paymentSettings?.codEnabled !== false && (
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="COD" id="cod" />
                      <Label htmlFor="cod" className="flex items-center cursor-pointer flex-1">
                        <Banknote className="h-5 w-5 mr-3 text-green-600" />
                        <div>
                          <p className="font-medium">Cash on Delivery (COD)</p>
                          <p className="text-sm text-muted-foreground">
                            Pay when you receive your order
                          </p>
                        </div>
                      </Label>
                    </div>
                  )}

                  {paymentSettings?.bankTransferEnabled !== false && (
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="BANK_TRANSFER" id="bank" />
                      <Label htmlFor="bank" className="flex items-center cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 mr-3 text-blue-600" />
                        <div>
                          <p className="font-medium">Bank Transfer</p>
                          <p className="text-sm text-muted-foreground">
                            Transfer to our bank account
                          </p>
                        </div>
                      </Label>
                    </div>
                  )}
                </RadioGroup>

                {selectedPayment === "BANK_TRANSFER" && paymentSettings && (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <AlertCircle className="h-5 w-5" />
                      <p className="font-medium">Bank Account Details</p>
                    </div>
                    <div className="text-sm space-y-1 text-blue-900">
                      {paymentSettings.bankName && <p>Bank: {paymentSettings.bankName}</p>}
                      {paymentSettings.accountTitle && <p>Account Title: {paymentSettings.accountTitle}</p>}
                      {paymentSettings.accountNumber && <p>Account Number: {paymentSettings.accountNumber}</p>}
                      {paymentSettings.iban && <p>IBAN: {paymentSettings.iban}</p>}
                      {paymentSettings.bankInstructions && (
                        <p className="mt-2 text-muted-foreground">{paymentSettings.bankInstructions}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register("notes")}
                  placeholder="Any special instructions for your order..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => {
                    const itemPrice = item.product.price + (item.variant?.priceModifier || 0)
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={item.product.images[0] || "/placeholder.jpg"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground">
                              {item.variant.size} {item.variant.color}
                            </p>
                          )}
                          <p className="text-sm font-medium">{formatPrice(itemPrice * item.quantity)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>



                <Separator />

                {/* Coupon Input */}
                <div className="space-y-2">
                  <Label>Coupon Code</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="uppercase"
                    />
                    {appliedCoupon ? (
                      <Button type="button" variant="outline" onClick={handleRemoveCoupon}>
                        Remove
                      </Button>
                    ) : (
                      <Button type="button" onClick={handleApplyCoupon} disabled={validatingCoupon || !couponCode}>
                        {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Place Order - ${formatPrice(total)}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form >
    </div >
  )
}
