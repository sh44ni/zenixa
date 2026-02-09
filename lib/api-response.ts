import { NextResponse } from "next/server"

/**
 * Standardized API response format for all /api/v1/ endpoints.
 *
 * Success: { success: true, data: T, meta?: { page, totalPages, total } }
 * Error:   { success: false, error: { code: string, message: string, details?: any } }
 */

interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ----- Success Helpers -----

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data } as ApiSuccessResponse<T>, { status })
}

export function apiPaginated<T>(
  data: T[],
  meta: PaginationMeta,
  status = 200
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json(
    { success: true, data, meta } as ApiSuccessResponse<T[]>,
    { status }
  )
}

export function apiCreated<T>(data: T): NextResponse<ApiResponse<T>> {
  return apiSuccess(data, 201)
}

export function apiDeleted(): NextResponse<ApiResponse<{ deleted: true }>> {
  return apiSuccess({ deleted: true })
}

// ----- Error Helpers -----

export function apiError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } } as ApiErrorResponse,
    { status }
  )
}

export function apiUnauthorized(message = "Invalid or missing API key"): NextResponse<ApiResponse<never>> {
  return apiError("UNAUTHORIZED", message, 401)
}

export function apiForbidden(message = "Insufficient permissions"): NextResponse<ApiResponse<never>> {
  return apiError("FORBIDDEN", message, 403)
}

export function apiNotFound(resource = "Resource"): NextResponse<ApiResponse<never>> {
  return apiError("NOT_FOUND", `${resource} not found`, 404)
}

export function apiValidationError(message: string, details?: unknown): NextResponse<ApiResponse<never>> {
  return apiError("VALIDATION_ERROR", message, 422, details)
}

export function apiServerError(message = "Internal server error"): NextResponse<ApiResponse<never>> {
  return apiError("INTERNAL_ERROR", message, 500)
}

export function apiConflict(message: string): NextResponse<ApiResponse<never>> {
  return apiError("CONFLICT", message, 409)
}

export function apiRateLimited(): NextResponse<ApiResponse<never>> {
  return apiError("RATE_LIMITED", "Too many requests. Please try again later.", 429)
}

// ----- Pagination Helpers -----

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") || "20")))
  const skip = (page - 1) * perPage
  return { page, perPage, skip }
}

export function buildMeta(page: number, perPage: number, total: number): PaginationMeta {
  return {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  }
}
