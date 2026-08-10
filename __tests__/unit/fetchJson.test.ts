/**
 * fetchJson / assertOk tests
 * Verify API errors are propagated instead of being swallowed
 */

import { ApiError, assertOk, fetchJson } from "@/lib/api/fetchJson"

/** jsdom n'expose pas `Response` : on fabrique le minimum utilisé par le helper. */
function makeResponse(
  { status = 200, body = null as unknown, raw = "" } = {}
): Response {
  const response = {
    ok: status >= 200 && status < 300,
    status,
    bodyUsed: false,
    async json() {
      response.bodyUsed = true
      if (body === null) throw new SyntaxError(`Unexpected token: ${raw}`)
      return body
    },
    clone: () => makeResponse({ status, body, raw }),
  }
  return response as unknown as Response
}

function jsonResponse(body: unknown, status = 200) {
  return makeResponse({ status, body })
}

describe("fetchJson", () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it("returns the parsed body on success", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [1, 2] }))

    await expect(fetchJson<{ data: number[] }>("/api/x")).resolves.toEqual({
      data: [1, 2],
    })
  })

  it("throws an ApiError carrying the server message, status and code", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "Paiement introuvable", code: "NOT_FOUND" }, 404)
    )

    await expect(fetchJson("/api/paiements/1")).rejects.toMatchObject({
      name: "ApiError",
      message: "Paiement introuvable",
      status: 404,
      code: "NOT_FOUND",
    })
  })

  it("falls back to the provided message when the body is not readable", async () => {
    fetchMock.mockResolvedValue(makeResponse({ status: 500, raw: "<html>" }))

    await expect(
      fetchJson("/api/x", { fallbackMessage: "Échec de la requête" })
    ).rejects.toThrow("Échec de la requête")
  })

  it("wraps network failures in an ApiError", async () => {
    fetchMock.mockRejectedValue(new Error("offline"))

    const error: unknown = await fetchJson("/api/x").catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe("NETWORK_ERROR")
    expect((error as ApiError).status).toBe(0)
  })

  it("returns undefined for 204 responses", async () => {
    fetchMock.mockResolvedValue(makeResponse({ status: 204 }))

    await expect(fetchJson("/api/x")).resolves.toBeUndefined()
  })
})

describe("assertOk", () => {
  it("does nothing when the response succeeded", async () => {
    await expect(assertOk(jsonResponse({}), "boom")).resolves.toBeUndefined()
  })

  it("throws the server error and keeps the response body readable", async () => {
    const response = jsonResponse({ error: "Accès refusé" }, 403)

    await expect(assertOk(response, "boom")).rejects.toMatchObject({
      message: "Accès refusé",
      status: 403,
    })
    expect(response.bodyUsed).toBe(false)
  })
})
