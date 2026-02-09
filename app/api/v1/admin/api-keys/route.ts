import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateApiKey } from "@/lib/api-auth"

/**
 * API Key management (session-based auth - for admin panel use).
 * These endpoints use NextAuth session auth, NOT API key auth.
 */

/**
 * GET /api/v1/admin/api-keys
 *
 * List all API keys (key value is masked except prefix).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
    })

    // Mask the actual key value for security
    const masked = keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      keyPreview: k.key.slice(0, 12) + "..." + k.key.slice(-4),
      permissions: k.permissions,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
    }))

    return NextResponse.json({ success: true, data: masked })
  } catch (error) {
    console.error("API keys fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/v1/admin/api-keys
 *
 * Create a new API key. Returns the FULL key value (only shown once).
 *
 * Body:
 * {
 *   "name": "My Storefront",
 *   "permissions": ["*"],                    // or specific like ["products:read", "orders:write"]
 *   "expiresAt": "2027-01-01T00:00:00Z"     // optional
 * }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, permissions, expiresAt } = body

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const { key, prefix } = generateApiKey()

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        prefix,
        permissions: permissions || ["*"],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    // Return the full key ONCE - it won't be shown again
    return NextResponse.json({
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key, // Full key - only returned on creation
        prefix: apiKey.prefix,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
      message: "Save this API key securely. It will not be shown again.",
    })
  } catch (error) {
    console.error("API key create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
