"use client"

import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"

import { Logo } from "@/components/brand/logo"
import { sessionApi } from "@/lib/api/session"
import { isPatient, useRequireSession } from "@/lib/hooks/use-require-session"
import { ROUTES, hospitalRoutes } from "@/lib/routes"
import { useSessionStore } from "@/lib/stores/session-store"

/** Everything signed-in patients see. Hospital accounts that land here are sent to their screens. */
export default function PatientAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const clear = useSessionStore((s) => s.clear)
  const { user, ready } = useRequireSession(isPatient, hospitalRoutes.scan)

  async function logout() {
    try {
      await sessionApi.logout()
    } finally {
      clear()
      router.replace(ROUTES.login)
    }
  }

  if (!ready) return <div className="min-h-svh bg-page" aria-busy="true" />

  return (
    <div className="min-h-svh bg-page text-ink">
      <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-4 py-3">
        <Logo className="h-8" />
        <div className="flex items-center gap-3">
          <span className="hidden text-body sm:inline">{user?.username ?? user?.fullName}</span>
          <Button variant="outline" className="px-4" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
      {children}
    </div>
  )
}
