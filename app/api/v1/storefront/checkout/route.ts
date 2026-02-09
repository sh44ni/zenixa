import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-auth"
import { apiSuccess, apiValidationError, apiNotFound, apiServerError } from "@/lib/api-response"
import { withCors, corsPreflightResponse } from "@/lib/api-cors"
import { dispatchWebhook } from "@/lib/webhooks"

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * POST /api/v1/storefront/checkout
 *
 * Creates a new order from the storefront.
 *
 * Body:
 * {
 *   "customer": {
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "phone": "+923001234567"
 *   },
 *   "shipping": {
 *     "address": "123 Main St",
 *     "city": "Lahore",
 *     "postalCode": "54000"  // optional
 *   },
 *   "items": [
 *     { "productId": "xxx", "variantId": "yyy", "quantity": 2 }
 *   ],
 *   "paymentMethod": "COD" | "BANK_TRANSFER",
 *   "couponCode": "SAVE10",           // optional
 *   "notes": "Leave at door",         // optional
 *   "userId": "user_id"               // optional, links order to customer account
 * }
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request)
  if (!auth.authenticated) return withCors(auth.response)

  try {
    const body = await request.json()
    const { customer, shipping, items, paymentMethod, couponCode, notes, userId } = body

    // Validate required fields
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return withCors(apiValidationError("customer.name, customer.email, and customer.phone are required"))
    }
    if (!shipping?.address || !shipping?.city) {
      return withCors(apiValidationError("shipping.address and shipping.city are required"))
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return withCors(apiValidationError("items array is required and must not be empty"))
    }
    if (!paymentMethod || !["COD", "BANK_TRANSFER"].includes(paymentMethod)) {
      return withCors(apiValidationError("paymentMethod must be 'COD' or 'BANK_TRANSFER'"))
    }

    // Resolve items and calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      })

      if (!product) {
        return withCors(apiNotFound(`Product ${item.productId}`))
      }

      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : product.variants[0]

      if (!variant) {
        return withCors(apiNotFound(`Variant ${item.variantId}`))
      }

      if (variant.stock < item.quantity) {
        return withCors(apiValidationError(
          `Insufficient stock for "${product.name}" (${variant.size || ""} ${variant.color || ""}). Available: ${variant.stock}`
        ))
      }

      const effectivePrice = variant.price ?? (product.price + variant.priceModifier)
      subtotal += effectivePrice * item.quantity

      orderItems.push({
        productId: product.id,
        variantId: variant.id,
        quantity: item.quantity,
        price: effectivePrice,
      })
    }

    // Apply coupon if provided
    let discount = 0
    let appliedCoupon: string | null = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      })

      if (coupon && coupon.isActive) {
        const now = new Date()
        const validStart = !coupon.startDate || coupon.startDate <= now
        const validEnd = !coupon.endDate || coupon.endDate >= now
        const withinLimit = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit

        if (validStart && validEnd && withinLimit) {
          discount = coupon.type === "PERCENTAGE"
            ? subtotal * (coupon.value / 100)
            : coupon.value
          appliedCoupon = coupon.code

          // Increment usage
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          })
        }
      }
    }

    // Get delivery settings
    const settings = await prisma.siteSettings.findFirst({ where: { id: "default" } })
    let shippingCharge = settings?.deliveryCharges ?? 250
    if (settings?.alwaysFreeDelivery) {
      shippingCharge = 0
    } else if (settings?.freeDeliveryEnabled && subtotal >= (settings?.freeDeliveryThreshold ?? 5000)) {
      shippingCharge = 0
    }

    const total = subtotal - discount + shippingCharge

    // Generate order number
    const orderNumber = `ZNX-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: shipping.address,
        city: shipping.city,
        postalCode: shipping.postalCode || null,
        subtotal,
        discount,
        couponCode: appliedCoupon,
        shipping: shippingCharge,
        total,
        paymentMethod: paymentMethod === "COD" ? "COD" : "BANK_TRANSFER",
        notes: notes || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, images: true } },
            variant: { select: { id: true, size: true, color: true } },
          },
        },
      },
    })

    // Decrement stock
    for (const item of orderItems) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // Dispatch webhook (fire-and-forget)
    dispatchWebhook("order.created", {
      orderNumber: order.orderNumber,
      total: order.total,
      itemCount: order.items.length,
      paymentMethod: order.paymentMethod,
    }).catch(() => {})

    return withCors(apiSuccess({
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items.map((i) => ({
        product: i.product,
        variant: i.variant,
        quantity: i.quantity,
        price: i.price,
      })),
      createdAt: order.createdAt,
    }, 201))
  } catch (error) {
    console.error("Checkout error:", error)
    return withCors(apiServerError())
  }
}
