/**
 * Client-side fetch helper
 * Propagates the error returned by the API instead of a generic message.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type ApiErrorBody = {
  error?: string | { message?: string; code?: string; details?: Record<string, unknown> }
  message?: string
  code?: string
  details?: Record<string, unknown>
}

function extractError(body: unknown, fallbackMessage: string) {
  if (!body || typeof body !== "object") {
    return { message: fallbackMessage }
  }

  const { error, message, code, details } = body as ApiErrorBody

  if (typeof error === "string") {
    return { message: error, code, details }
  }

  if (error && typeof error === "object") {
    return {
      message: error.message || fallbackMessage,
      code: error.code ?? code,
      details: error.details ?? details,
    }
  }

  return { message: message || fallbackMessage, code, details }
}

/**
 * Throw an `ApiError` carrying the server message when a response failed.
 * Use it right after `fetch` so API errors are never replaced by a generic one.
 */
export async function assertOk(
  response: Response,
  fallbackMessage: string
): Promise<void> {
  if (response.ok) return

  let body: unknown = null
  try {
    body = await response.clone().json()
  } catch {
    // Réponse sans corps JSON : on garde le message par défaut.
  }
  const { message, code, details } = extractError(body, fallbackMessage)
  throw new ApiError(message, response.status, code, details)
}

export interface FetchJsonInit extends RequestInit {
  /** Message used when the response carries no readable error. */
  fallbackMessage?: string
}

/**
 * Fetch JSON and throw an `ApiError` carrying the server message, status and
 * error code when the request fails.
 */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init: FetchJsonInit = {}
): Promise<T> {
  const { fallbackMessage = "La requête a échoué", ...requestInit } = init

  let response: Response
  try {
    response = await fetch(input, requestInit)
  } catch (cause) {
    throw new ApiError(
      cause instanceof Error && cause.message
        ? `Réseau indisponible : ${cause.message}`
        : "Réseau indisponible",
      0,
      "NETWORK_ERROR"
    )
  }

  if (!response.ok) {
    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      // Réponse sans corps JSON : on garde le message par défaut.
    }
    const { message, code, details } = extractError(body, fallbackMessage)
    throw new ApiError(message, response.status, code, details)
  }

  if (response.status === 204) {
    return undefined as T
  }

  try {
    return (await response.json()) as T
  } catch (cause) {
    throw new ApiError(
      cause instanceof Error && cause.message
        ? `Réponse illisible du serveur : ${cause.message}`
        : "Réponse illisible du serveur",
      response.status,
      "INVALID_JSON"
    )
  }
}
