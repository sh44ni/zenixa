import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateWebhookSecret } from "@/lib/webhooks"

/**
 * Webhook endpoint management (session-based auth).
 */

/**
 * GET /api/v1/admin/webhooks
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const webhooks = await prisma.webhookEndpoint.findMany({
      orderBy: { createdAt: "desc" },
    })

    // Mask secrets
    const masked = webhooks.map((w) => ({
      ...w,
      secret: w.secret.slice(0, 10) + "...",
    }))

    return NextResponse.json({ success: true, data: masked })
  } catch (error) {
    console.error("Webhooks fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/v1/admin/webhooks
 *
 * Body:
 * {
 *   "url": "https://mystore.com/webhooks/zenixa",
 *   "events": ["order.created", "product.updated", "inventory.low"]
 * }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { url, events } = body

    if (!url || !events?.length) {
      return NextResponse.json({ error: "url and events are required" }, { status: 400 })
    }

    const secret = generateWebhookSecret()

    const webhook = await prisma.webhookEndpoint.create({
      data: { url, secret, events },
    })

    // Return full secret on creation (only time)
    return NextResponse.json({
      success: true,
      data: {
        id: webhook.id,
        url: webhook.url,
        secret: webhook.secret, // Full secret - only shown on creation
        events: webhook.events,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
      },
      message: "Save the webhook secret securely. It will not be shown again.",
    })
  } catch (error) {
    console.error("Webhook create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
