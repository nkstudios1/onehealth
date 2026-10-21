import { env } from "@/lib/env"
import { ApiError, type ApiErrorCode } from "./errors"

type Envelope<T> =
  | { success: true; message: string; data: T; meta: { requestId: string } }
  | {
      success: false
      message: string
      code: ApiErrorCode
      errors: Record<string, string[]> | null
      meta: { requestId: string; retryAfter?: number }
    }

/** Laravel puts a CSRF token in the XSRF-TOKEN cookie; we send it back in a header. */
function readXsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function ensureCsrfCookie() {
  if (readXsrfCookie()) return
  await fetch(`${env.apiUrl}/auth/csrf`, { credentials: "include" }).catch(() => null)
}

export async function request<T>(
  path: string,
  body?: unknown,
  method: "GET" | "POST" = "POST"
): Promise<T> {
  let response: Response
  try {
    if (method !== "GET") await ensureCsrfCookie()
    const xsrf = readXsrfCookie()

    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(method !== "GET" ? { "Content-Type": "application/json" } : {}),
        ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
      },
      body: method === "GET" || body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError("NETWORK", "We couldn't reach the server. Check your connection and try again.")
  }

  const json = (await response.json().catch(() => null)) as Envelope<T> | null

  if (!response.ok || !json || json.success === false) {
    const err = json && json.success === false ? json : null
    throw new ApiError(
      err?.code ?? "UNKNOWN",
      err?.message ?? "Something went wrong. Please try again.",
      response.status
    )
  }
  return json.data
}