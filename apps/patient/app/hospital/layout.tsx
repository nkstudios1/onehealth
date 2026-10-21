"use client"

import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"

import { sessionApi } from "@/lib/api/session"
import { isHospital, useRequireSession } from "@/lib/hooks/use-require-session"
import { ROUTES } from "@/lib/routes"
import { useSessionStore } from "@/lib/stores/session-store"

/**
 * Hospital screens. TEMPORARY HOME: they live in the patient app for the demo so there is one
 * login and one cookie. They only depend on lib/api/*, so this whole folder can be moved into
 * apps/portal later. The portal is a desktop web app (not a PWA), hence the wide layout.
 */
export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const clear = useSessionStore((s) => s.clear)
  const { user, ready } = useRequireSession(isHospital, ROUTES.home)

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
      <header className="flex items-center justify-between border-b border-line bg-surface px-8 py-3">
        <p className="text-title">{user?.organisation?.name ?? "Hospital"}</p>
        <Button variant="outline" className="px-4" onClick={logout}>
          Log out
        </Button>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 py-8">{children}</div>
    </div>
  )
}
