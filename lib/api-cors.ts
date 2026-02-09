import { NextRequest, NextResponse } from "next/server"

/**
 * CORS headers for cross-origin storefront access.
 * All /api/v1/ endpoints allow cross-origin requests.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  "Access-Control-Max-Age": "86400",
}

/**
 * Adds CORS headers to a response.
 */
export function withCors(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

/**
 * Handles preflight OPTIONS requests for CORS.
 */
export function corsPreflightResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

/**
 * Wraps a route handler to add CORS headers and handle OPTIONS.
 */
export function withCorsHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    if (request.method === "OPTIONS") {
      return corsPreflightResponse()
    }
    const response = await handler(request, context)
    return withCors(response)
  }
}
