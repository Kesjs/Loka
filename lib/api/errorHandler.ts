/**
 * API error handling wrapper
 * Wraps API route handlers to catch and format errors consistently
 */

import { NextRequest, NextResponse } from "next/server"
import {
  ApplicationError,
  handleApiError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors/ApplicationError"
import { createClient } from "@/lib/supabase/server"

export interface ApiResponse<T = any> {
  data?: T
  error?: {
    message: string
    code: string
    statusCode: number
    details?: Record<string, any>
  }
}

/**
 * Wrap an async API handler with error handling
 * Usage:
 *   export const POST = withErrorHandler(async (req) => {
 *     // your handler code
 *   })
 */
export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (error) {
      console.error("[API Error]", error)
      const errorResponse = handleApiError(error)

      return NextResponse.json(
        {
          error: {
            message: errorResponse.message,
            code: errorResponse.code,
            details: errorResponse.details,
          },
        },
        { status: errorResponse.statusCode }
      )
    }
  }
}

/**
 * Wrap a sync API handler with error handling
 */
export function withErrorHandlerSync(
  handler: (req: NextRequest) => NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return handler(req)
    } catch (error) {
      console.error("[API Error]", error)
      const errorResponse = handleApiError(error)

      return NextResponse.json(
        {
          error: {
            message: errorResponse.message,
            code: errorResponse.code,
            details: errorResponse.details,
          },
        },
        { status: errorResponse.statusCode }
      )
    }
  }
}

/**
 * Build an error response preserving the status code and message of known
 * `ApplicationError`s. Unexpected errors are logged and answered with
 * `fallbackMessage` so internals are never exposed but never lost either.
 */
export function apiErrorResponse(error: unknown, fallbackMessage: string) {
  const { message, code, statusCode, details } = handleApiError(error)
  const isApplicationError = error instanceof ApplicationError

  if (!isApplicationError) {
    console.error("[API Error]", error)
  }

  return NextResponse.json(
    {
      error: isApplicationError ? message : fallbackMessage,
      code,
      details: isApplicationError ? details : undefined,
    },
    { status: statusCode }
  )
}

/**
 * Success response formatter
 */
export function successResponse<T>(data: T, statusCode: number = 200) {
  return NextResponse.json({ data }, { status: statusCode })
}

/**
 * Created response (201)
 */
export function createdResponse<T>(data: T) {
  return successResponse(data, 201)
}

/**
 * No content response (204)
 */
export function noContentResponse() {
  return new NextResponse(null, { status: 204 })
}

/**
 * Validate user authentication
 */
export async function requireAuth(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new UnauthorizedError("Authentication required")
  }

  return user
}

/**
 * Parse JSON body with error handling
 */
export async function parseJsonBody(req: NextRequest) {
  try {
    return await req.json()
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body")
  }
}

// Re-export error classes for convenience
export { UnauthorizedError, ValidationError, ApplicationError }
