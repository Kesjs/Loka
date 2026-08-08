/**
 * Custom application errors for consistent error handling
 */

export class ApplicationError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    }
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, details)
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", 404)
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401)
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = "Forbidden") {
    super(message, "FORBIDDEN", 403)
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "CONFLICT", 409, details)
  }
}

export class DuplicatePaymentError extends ConflictError {
  constructor() {
    super(
      "Payment already exists for this contract and period",
      { reason: "duplicate_payment" }
    )
  }
}

export class OverlappingContractError extends ConflictError {
  constructor(tenantId: string, propertyId: string) {
    super(
      "Tenant already has an active contract for this property",
      { tenantId, propertyId }
    )
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, originalError?: any) {
    super(
      "Database operation failed",
      "DATABASE_ERROR",
      500,
      { message, originalError: originalError?.message }
    )
  }
}

export class InvalidStateTransitionError extends ApplicationError {
  constructor(current: string, target: string) {
    super(
      `Cannot transition from ${current} to ${target}`,
      "INVALID_STATE_TRANSITION",
      400,
      { current, target }
    )
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApplicationError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    }
  }

  if (error instanceof Error) {
    console.error("Unexpected error:", error)
    return {
      message: error.message,
      code: "INTERNAL_ERROR",
      statusCode: 500,
    }
  }

  console.error("Unknown error:", error)
  return {
    message: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
    statusCode: 500,
  }
}

/**
 * Wrapper for async error handling in API routes
 */
export function asyncHandler(
  handler: (req: any, res: any) => Promise<any>
) {
  return async (req: any, res: any) => {
    try {
      return await handler(req, res)
    } catch (error) {
      const errorResponse = handleApiError(error)
      return res.status(errorResponse.statusCode).json(errorResponse)
    }
  }
}
