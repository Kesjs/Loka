/**
 * @jest-environment node
 */
import { NextResponse } from "next/server"
import {
  withErrorHandler,
  withErrorHandlerSync,
  successResponse,
  createdResponse,
  noContentResponse,
  requireAuth,
  parseJsonBody,
} from "@/lib/api/errorHandler"
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors/ApplicationError"

const getUser = jest.fn()
jest.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: () => getUser() } }),
}))

describe("api/errorHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("withErrorHandler", () => {
    it("passes the handler response through", async () => {
      const expected = NextResponse.json({ ok: true })
      const handler = jest.fn().mockResolvedValue(expected)

      await expect(withErrorHandler(handler)({} as any)).resolves.toBe(expected)
    })

    it("maps an ApplicationError to its status code and payload", async () => {
      const handler = jest
        .fn()
        .mockRejectedValue(new ValidationError("Champ manquant", { field: "nom" }))

      const response = await withErrorHandler(handler)({} as any)

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        error: {
          message: "Champ manquant",
          code: "VALIDATION_ERROR",
          details: { field: "nom" },
        },
      })
    })

    it("maps an unexpected error to a 500", async () => {
      const handler = jest.fn().mockRejectedValue(new Error("boom"))

      const response = await withErrorHandler(handler)({} as any)

      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({
        error: { message: "boom", code: "INTERNAL_ERROR" },
      })
    })
  })

  describe("withErrorHandlerSync", () => {
    it("passes the handler response through", async () => {
      const expected = NextResponse.json({ ok: true })

      await expect(withErrorHandlerSync(() => expected)({} as any)).resolves.toBe(
        expected
      )
    })

    it("catches synchronous throws", async () => {
      const response = await withErrorHandlerSync(() => {
        throw new NotFoundError()
      })({} as any)

      expect(response.status).toBe(404)
      await expect(response.json()).resolves.toEqual({
        error: { message: "Resource not found", code: "NOT_FOUND" },
      })
    })
  })

  describe("response helpers", () => {
    it("successResponse defaults to 200", async () => {
      const response = successResponse({ id: 1 })
      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({ data: { id: 1 } })
    })

    it("successResponse accepts a custom status", () => {
      expect(successResponse({ id: 1 }, 202).status).toBe(202)
    })

    it("createdResponse returns 201", async () => {
      const response = createdResponse({ id: 1 })
      expect(response.status).toBe(201)
      await expect(response.json()).resolves.toEqual({ data: { id: 1 } })
    })

    it("noContentResponse returns an empty 204", async () => {
      const response = noContentResponse()
      expect(response.status).toBe(204)
      await expect(response.text()).resolves.toBe("")
    })
  })

  describe("requireAuth", () => {
    it("returns the authenticated user", async () => {
      getUser.mockResolvedValue({ data: { user: { id: "user-1" } } })

      await expect(requireAuth({} as any)).resolves.toEqual({ id: "user-1" })
    })

    it("throws UnauthorizedError when there is no session", async () => {
      getUser.mockResolvedValue({ data: { user: null } })

      await expect(requireAuth({} as any)).rejects.toBeInstanceOf(
        UnauthorizedError
      )
    })
  })

  describe("parseJsonBody", () => {
    it("returns the parsed body", async () => {
      const req = { json: async () => ({ nom: "Awa" }) } as any

      await expect(parseJsonBody(req)).resolves.toEqual({ nom: "Awa" })
    })

    it("throws a ValidationError on malformed JSON", async () => {
      const req = {
        json: async () => {
          throw new SyntaxError("Unexpected token")
        },
      } as any

      await expect(parseJsonBody(req)).rejects.toThrow(
        "Invalid JSON in request body"
      )
      await expect(parseJsonBody(req)).rejects.toBeInstanceOf(ValidationError)
    })
  })
})
