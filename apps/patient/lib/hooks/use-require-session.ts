"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { sessionApi } from "@/lib/api/session"
import type { SessionUser } from "@/lib/api/types"
import { ROUTES } from "@/lib/routes"
import { useSessionStore } from "@/lib/stores/session-store"

/**
 * Guard for a whole section of the app (used by the layout files).
 * - Not signed in -> /login.
 * - Signed in as the wrong kind of account -> `wrongAccountRoute`.
 * After a page refresh the store is empty, so it asks the server who is signed in
 * (the session cookie survives a refresh, the in-memory store does not).
 *
 * This only decides what to SHOW. The real protection is the backend, which checks the
 * account type on every request.
 */
export function useRequireSession(allow: (user: SessionUser) => boolean, wrongAccountRoute: string) {
  const router = useRouter()
  const user = useSessionStore((s) => s.user)
  const setUser = useSessionStore((s) => s.setUser)
  const [checking, setChecking] = useState(user === null)

  useEffect(() => {
    if (user) return
    let alive = true
    sessionApi
      .me()
      .then((u) => alive && setUser(u))
      .catch(() => alive && router.replace(ROUTES.login))
      .finally(() => alive && setChecking(false))
    return () => {
      alive = false
    }
  }, [user, setUser, router])

  const allowed = user ? allow(user) : false

  useEffect(() => {
    if (user && !allowed) router.replace(wrongAccountRoute)
  }, [user, allowed, router, wrongAccountRoute])

  return { user, ready: user !== null && allowed, checking }
}

export const isPatient = (user: SessionUser) => user.type === "patient"
export const isHospital = (user: SessionUser) => user.type === "org_admin" || user.type === "org_staff"
