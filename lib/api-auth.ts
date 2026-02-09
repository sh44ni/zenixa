import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiUnauthorized, apiForbidden } from "@/lib/api-response"
import crypto from "crypto"

/**
 * API Key Authentication for external storefront connections.
 *
 * Authenticate via:
 *   - Header: X-API-Key: znx_xxxxxxxxxxxxxxxx
 *   - Header: Authorization: Bearer znx_xxxxxxxxxxxxxxxx
 *
 * Keys are generated with prefix "znx_" followed by 48 random hex characters.
 */

interface AuthResult {
  authenticated: true
  apiKey: {
    id: string
    name: string
    permissions: string[]
  }
}

interface AuthError {
  authenticated: false
  response: ReturnType<typeof apiUnauthorized>
}

type ApiAuthResult = AuthResult | AuthError

/**
 * Extracts and validates an API key from the request.
 * Updates lastUsedAt timestamp on successful auth.
 */
export async function authenticateApiKey(request: NextRequest): Promise<ApiAuthResult> {
  // Extract key from headers
  const apiKeyHeader = request.headers.get("x-api-key")
  const authHeader = request.headers.get("authorization")

  let keyValue: string | null = null

  if (apiKeyHeader) {
    keyValue = apiKeyHeader
  } else if (authHeader?.startsWith("Bearer ")) {
    keyValue = authHeader.slice(7)
  }

  if (!keyValue) {
    return { authenticated: false, response: apiUnauthorized("Missing API key. Provide via X-API-Key header or Authorization: Bearer header.") }
  }

  // Look up the key
  const apiKey = await prisma.apiKey.findUnique({
    where: { key: keyValue },
  })

  if (!apiKey) {
    return { authenticated: false, response: apiUnauthorized("Invalid API key.") }
  }

  if (!apiKey.isActive) {
    return { authenticated: false, response: apiUnauthorized("API key has been deactivated.") }
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { authenticated: false, response: apiUnauthorized("API key has expired.") }
  }

  // Update last used timestamp (fire-and-forget)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {})

  return {
    authenticated: true,
    apiKey: {
      id: apiKey.id,
      name: apiKey.name,
      permissions: apiKey.permissions,
    },
  }
}

/**
 * Checks if the API key has a specific permission.
 * Permissions use resource:action format. Wildcard "*" grants all.
 */
export function hasPermission(permissions: string[], required: string): boolean {
  if (permissions.includes("*")) return true
  if (permissions.includes(required)) return true

  // Check resource-level wildcard (e.g., "products:*" covers "products:read")
  const [resource] = required.split(":")
  if (permissions.includes(`${resource}:*`)) return true

  return false
}

/**
 * Combined auth + permission check. Returns error response if unauthorized.
 */
export async function requirePermission(
  request: NextRequest,
  permission: string
): Promise<AuthResult | { authenticated: false; response: ReturnType<typeof apiUnauthorized | typeof apiForbidden> }> {
  const auth = await authenticateApiKey(request)

  if (!auth.authenticated) {
    return auth
  }

  if (!hasPermission(auth.apiKey.permissions, permission)) {
    return {
      authenticated: false,
      response: apiForbidden(`Missing required permission: ${permission}`),
    }
  }

  return auth
}

/**
 * Generates a new API key string with "znx_" prefix.
 */
export function generateApiKey(): { key: string; prefix: string } {
  const random = crypto.randomBytes(24).toString("hex")
  const key = `znx_${random}`
  const prefix = key.slice(0, 12)
  return { key, prefix }
}
