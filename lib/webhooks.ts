import { prisma } from "@/lib/prisma"
import crypto from "crypto"

/**
 * Webhook system for notifying external storefronts of data changes.
 *
 * Supported events:
 *   - order.created, order.updated, order.status_changed, order.cancelled
 *   - product.created, product.updated, product.deleted
 *   - inventory.updated, inventory.low
 *   - category.created, category.updated, category.deleted
 *   - coupon.created, coupon.updated, coupon.deleted
 *   - settings.updated
 *
 * Each webhook delivery includes:
 *   - X-Webhook-Signature: HMAC-SHA256 of the payload
 *   - X-Webhook-Event: The event name
 *   - X-Webhook-Id: Unique delivery ID
 */

export type WebhookEvent =
  | "order.created"
  | "order.updated"
  | "order.status_changed"
  | "order.cancelled"
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "inventory.updated"
  | "inventory.low"
  | "category.created"
  | "category.updated"
  | "category.deleted"
  | "coupon.created"
  | "coupon.updated"
  | "coupon.deleted"
  | "settings.updated"

interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: unknown
}

/**
 * Signs a webhook payload using HMAC-SHA256.
 */
function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

/**
 * Dispatches a webhook event to all subscribed endpoints.
 * Runs asynchronously (fire-and-forget) to avoid blocking the API response.
 */
export async function dispatchWebhook(event: WebhookEvent, data: unknown): Promise<void> {
  try {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        isActive: true,
        events: { has: event },
      },
    })

    if (endpoints.length === 0) return

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    }

    const body = JSON.stringify(payload)

    // Send to all endpoints concurrently
    const deliveries = endpoints.map(async (endpoint) => {
      const deliveryId = crypto.randomUUID()
      const signature = signPayload(body, endpoint.secret)

      try {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": `sha256=${signature}`,
            "X-Webhook-Event": event,
            "X-Webhook-Id": deliveryId,
          },
          body,
          signal: AbortSignal.timeout(10000), // 10s timeout
        })

        if (!response.ok) {
          await prisma.webhookEndpoint.update({
            where: { id: endpoint.id },
            data: { lastError: `HTTP ${response.status}: ${response.statusText}` },
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        await prisma.webhookEndpoint.update({
          where: { id: endpoint.id },
          data: { lastError: message },
        }).catch(() => {})
      }
    })

    await Promise.allSettled(deliveries)
  } catch {
    // Webhook dispatch should never crash the main request
  }
}

/**
 * Generates a new webhook signing secret.
 */
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString("hex")}`
}
