import {
  ApplicationError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DuplicatePaymentError,
  OverlappingContractError,
  DatabaseError,
  InvalidStateTransitionError,
  handleApiError,
  asyncHandler,
} from "@/lib/errors/ApplicationError"

describe("ApplicationError", () => {
  it("exposes message, code, status and details", () => {
    const error = new ApplicationError("boom", "BOOM", 418, { a: 1 })

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe("boom")
    expect(error.code).toBe("BOOM")
    expect(error.statusCode).toBe(418)
    expect(error.details).toEqual({ a: 1 })
    expect(error.name).toBe("ApplicationError")
    expect(error.stack).toBeDefined()
  })

  it("defaults to status 500 without details", () => {
    const error = new ApplicationError("boom", "BOOM")
    expect(error.statusCode).toBe(500)
    expect(error.details).toBeUndefined()
  })

  it("serialises to JSON", () => {
    expect(new ApplicationError("boom", "BOOM", 400, { a: 1 }).toJSON()).toEqual({
      message: "boom",
      code: "BOOM",
      statusCode: 400,
      details: { a: 1 },
    })
  })
})

describe("error subclasses", () => {
  it("ValidationError", () => {
    const error = new ValidationError("champ invalide", { field: "nom" })
    expect(error).toBeInstanceOf(ApplicationError)
    expect(error.name).toBe("ValidationError")
    expect(error.code).toBe("VALIDATION_ERROR")
    expect(error.statusCode).toBe(400)
    expect(error.details).toEqual({ field: "nom" })
  })

  it.each([
    [new NotFoundError(), "NOT_FOUND", 404, "Resource not found"],
    [new UnauthorizedError(), "UNAUTHORIZED", 401, "Unauthorized"],
    [new ForbiddenError(), "FORBIDDEN", 403, "Forbidden"],
  ])("%# uses default message and status", (error, code, statusCode, message) => {
    expect(error.code).toBe(code)
    expect(error.statusCode).toBe(statusCode)
    expect(error.message).toBe(message)
  })

  it("allows overriding default messages", () => {
    expect(new NotFoundError("Contrat introuvable").message).toBe(
      "Contrat introuvable"
    )
  })

  it("ConflictError", () => {
    const error = new ConflictError("conflit", { reason: "x" })
    expect(error.code).toBe("CONFLICT")
    expect(error.statusCode).toBe(409)
    expect(error.details).toEqual({ reason: "x" })
  })

  it("DuplicatePaymentError extends ConflictError", () => {
    const error = new DuplicatePaymentError()
    expect(error).toBeInstanceOf(ConflictError)
    expect(error.statusCode).toBe(409)
    expect(error.details).toEqual({ reason: "duplicate_payment" })
  })

  it("OverlappingContractError carries the ids", () => {
    const error = new OverlappingContractError("tenant-1", "unit-1")
    expect(error).toBeInstanceOf(ConflictError)
    expect(error.details).toEqual({
      tenantId: "tenant-1",
      propertyId: "unit-1",
    })
  })

  it("DatabaseError hides the raw message in details", () => {
    const error = new DatabaseError("insert failed", new Error("pg down"))
    expect(error.message).toBe("Database operation failed")
    expect(error.code).toBe("DATABASE_ERROR")
    expect(error.statusCode).toBe(500)
    expect(error.details).toEqual({
      message: "insert failed",
      originalError: "pg down",
    })
  })

  it("DatabaseError tolerates a missing original error", () => {
    expect(new DatabaseError("insert failed").details).toEqual({
      message: "insert failed",
      originalError: undefined,
    })
  })

  it("InvalidStateTransitionError describes the transition", () => {
    const error = new InvalidStateTransitionError("resilie", "actif")
    expect(error.message).toBe("Cannot transition from resilie to actif")
    expect(error.code).toBe("INVALID_STATE_TRANSITION")
    expect(error.statusCode).toBe(400)
    expect(error.details).toEqual({ current: "resilie", target: "actif" })
  })
})

describe("handleApiError", () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  it("formats an ApplicationError without logging", () => {
    expect(handleApiError(new ValidationError("invalide", { f: 1 }))).toEqual({
      message: "invalide",
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details: { f: 1 },
    })
    expect(consoleError).not.toHaveBeenCalled()
  })

  it("formats a plain Error as INTERNAL_ERROR", () => {
    expect(handleApiError(new Error("unexpected"))).toEqual({
      message: "unexpected",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    })
    expect(consoleError).toHaveBeenCalled()
  })

  it("formats unknown throwables", () => {
    expect(handleApiError("just a string")).toEqual({
      message: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    })
    expect(consoleError).toHaveBeenCalled()
  })
})

describe("asyncHandler", () => {
  interface FakeRes {
    status: jest.Mock
    json: jest.Mock
  }

  const buildRes = (): FakeRes => {
    const res: FakeRes = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    }
    return res
  }

  it("returns the handler result when it resolves", async () => {
    const res = buildRes()
    const handler = jest.fn().mockResolvedValue("ok")

    await expect(asyncHandler(handler)({ id: 1 }, res)).resolves.toBe("ok")
    expect(handler).toHaveBeenCalledWith({ id: 1 }, res)
    expect(res.status).not.toHaveBeenCalled()
  })

  it("converts a thrown ApplicationError into an error response", async () => {
    const res = buildRes()
    const handler = jest.fn().mockRejectedValue(new NotFoundError())

    await asyncHandler(handler)({}, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      message: "Resource not found",
      code: "NOT_FOUND",
      statusCode: 404,
      details: undefined,
    })
  })
})
