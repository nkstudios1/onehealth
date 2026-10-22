"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Bell, CaretDown, CaretLeft, CaretRight, Gear, House, IdentificationCard, List, SignOut, UserCircle, UsersThree } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Logo } from "@/components/brand/logo"
import { sessionApi } from "@/lib/api/session"
import { isPatient, useRequireSession } from "@/lib/hooks/use-require-session"
import { ROUTES, hospitalRoutes } from "@/lib/routes"
import { useSessionStore } from "@/lib/stores/session-store"

const NAV = [
  { label: "Home", href: "/home", Icon: House },
  { label: "My Vitals", href: "/vitals", Icon: IdentificationCard },
  { label: "My Records", href: "/records", Icon: List },
  { label: "Access Log", href: "/home#access-log", Icon: List },
]

export default function PatientAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const clear = useSessionStore((s) => s.clear)
  const { user, ready } = useRequireSession(isPatient, hospitalRoutes.scan)
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  async function logout() {
    try { await sessionApi.logout() } finally { clear(); router.replace(ROUTES.login) }
  }

  if (!ready) return <div className="min-h-svh bg-page" aria-busy="true" />

  const name = user?.fullName ?? user?.username ?? "Isoken Oghenemaro"
  const personalId = user?.personalId ?? "8012345678"

  return (
    <div className="min-h-svh bg-page text-ink">
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-line bg-surface px-5 lg:px-9">
        <Logo className="h-9" />
        <div className="relative flex items-center gap-2">
          <Button className="hidden h-10 rounded-lg px-4 sm:flex" onClick={() => router.push("/access") }>
            <UsersThree aria-hidden size={19} /> Share access
          </Button>
          <button type="button" aria-label="Notifications" className="relative flex size-10 items-center justify-center rounded-lg border border-line bg-surface hover:bg-field">
            <Bell aria-hidden size={20} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[#ef1f4b]" />
          </button>
          <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-field" aria-expanded={profileOpen} aria-haspopup="menu">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-weak font-semibold text-brand">{name.slice(0, 1).toUpperCase()}</span>
            <span className="hidden text-left md:block"><span className="block text-body font-medium leading-5">{name}</span><span className="block text-caption text-ink-subtle">ID: {personalId}</span></span>
            <CaretDown aria-hidden size={17} className="hidden md:block" />
          </button>
          {profileOpen ? (
            <div className="absolute right-0 top-12 z-40 w-[310px] overflow-hidden rounded-xl border border-line bg-surface shadow-card">
              <div className="border-b border-line px-4 py-4"><p className="text-caption text-ink-subtle">PERSONAL</p><div className="mt-2 flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-full bg-brand-weak text-lg font-semibold text-brand">{name.slice(0, 1).toUpperCase()}</span><div><p className="font-medium">{name}</p><p className="text-caption text-ink-subtle">ID: {personalId}</p></div></div></div>
              <div className="p-2">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-field"><UserCircle size={20} /> My Account</button>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-field"><IdentificationCard size={20} /> OneHealth Card</button>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-field"><UsersThree size={20} /> Emergency Contacts</button>
              </div>
              <div className="border-y border-line p-2">
                <button type="button" onClick={() => setThemeOpen((open) => !open)} aria-expanded={themeOpen} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-field">
                  <span className="flex-1">Theme</span>
                  <span className="rounded-md border border-line px-2 py-1 text-caption capitalize">{theme ?? "system"} <CaretDown className="ml-1 inline" /></span>
                </button>
                {themeOpen ? <div className="ml-8 mt-1 space-y-1 pb-2">
                  {(["light", "dark", "system"] as const).map((option) => <button key={option} type="button" onClick={() => { setTheme(option); setThemeOpen(false) }} className={`block w-full rounded-md px-3 py-2 text-left text-body capitalize hover:bg-field ${theme === option ? "bg-brand-weak font-medium text-brand" : ""}`}>{option}{theme === option ? " ✓" : ""}</button>)}
                </div> : null}
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-field"><Gear size={20} /> Settings</button>
              </div>
              <div className="p-2"><button className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-field">Switch account <CaretRight size={18} /></button><button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[#ef1f4b] hover:bg-field"><SignOut size={20} /> Log out</button></div>
            </div>
          ) : null}
        </div>
      </header>
      <div className="flex min-h-[calc(100svh-76px)]">
        <aside className={`hidden shrink-0 border-r border-line bg-surface transition-[width] duration-200 lg:block ${collapsed ? "w-[78px]" : "w-[228px]"}`}>
          <div className="sticky top-[76px] flex h-[calc(100svh-76px)] flex-col px-4 py-6">
            <button type="button" onClick={() => setCollapsed((value) => !value)} className="mb-4 flex size-9 items-center justify-center rounded-lg hover:bg-field" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <CaretRight size={20} /> : <CaretLeft size={20} />}</button>
            <div className="mb-3 border-t border-line" />
            <nav className="flex flex-col gap-1">
              {NAV.map(({ label, href, Icon }) => {
                const active = pathname === "/home" && label === "Home"
                return <button key={label} type="button" onClick={() => router.push(href)} className={`flex h-10 items-center gap-3 rounded-lg px-3 text-left text-body transition ${active ? "bg-brand-weak font-medium text-brand" : "hover:bg-field"}`} title={collapsed ? label : undefined}><Icon size={20} weight={active ? "fill" : "regular"} />{!collapsed ? <span>{label}</span> : null}</button>
              })}
            </nav>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          {children}
          <footer className="border-t border-line px-6 py-7 text-caption text-ink-subtle lg:px-10"><div className="flex flex-col justify-between gap-2 sm:flex-row"><span>© 2026 OneHealth. All rights reserved.</span><span className="flex gap-4"><span>Privacy Policy</span><span>•</span><span>Terms of Service</span></span></div></footer>
        </div>
      </div>
    </div>
  )
}
