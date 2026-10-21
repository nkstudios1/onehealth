"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { ROUTES } from "@/lib/routes"

/**
 * Stops people landing on a later screen without finishing the earlier ones
 * (for example by typing /signup/password into the address bar).
 *
 * Usage at the top of a page:
 *   const allowed = useStepGuard(Boolean(registrationId && identity))
 *   if (!allowed) return null
 *
 * The optional second argument is where to send people who aren't allowed in.
 * It defaults to /signup. The password reset screens pass ROUTES.resetPassword.
 */
export function useStepGuard(allowed: boolean, redirectTo: string = ROUTES.signup) {
  const router = useRouter()
  useEffect(() => {
    if (!allowed) router.replace(redirectTo)
  }, [allowed, redirectTo, router])
  return allowed
}