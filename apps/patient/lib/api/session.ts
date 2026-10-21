// lib/api/session.ts
import { request } from "./client"
import type { SessionUser } from "./types"

/** "Who am I" and "sign out". Both use the session cookie the login set. */
export const sessionApi = {
  me: () => request<{ user: SessionUser }>("/auth/me", undefined, "GET").then((r) => r.user),
  logout: () => request<unknown>("/auth/logout", {}),
}
