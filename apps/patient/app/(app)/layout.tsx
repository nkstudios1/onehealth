"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Bell, CaretDown, CaretLeft, CaretRight, FileText, Gear, Heartbeat, House, IdentificationCard, ShieldCheck, SignOut, UserCircle, UsersThree } from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { Logo } from "@/components/brand/logo"
import { accessApi } from "@/lib/api/access"
import { sessionApi } from "@/lib/api/session"
import { usePoll } from "@/lib/hooks/use-poll"
import { isPatient, useRequireSession } from "@/lib/hooks/use-require-session"
import { ROUTES, hospitalRoutes } from "@/lib/routes"
import { useSessionStore } from "@/lib/stores/session-store"

const NAV = [
  { label: "Home", href: "/home", Icon: House },
  { label: "My Vitals", href: "/vitals", Icon: Heartbeat },
  { label: "My Records", href: "/records", Icon: FileText },
  { label: "Access Log", href: "/access", Icon: ShieldCheck },
]

/** Menu rows whose pages are not built yet. Shown greyed out with "Soon" instead of doing nothing. */
function SoonItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button type="button" disabled aria-disabled className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-ink-weak">
      {icon} <span className="flex-1">{label}</span>
      <span className="rounded-full bg-chip px-2 py-0.5 text-caption">Soon</span>
    </button>
  )
}

export default function PatientAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const clear = useSessionStore((s) => s.clear)
  const { user, ready } = useRequireSession(isPatient, hospitalRoutes.scan)
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  // Red dot on the bell only when a hospital is really waiting for an answer.
  const pending = usePoll(accessApi.pendingRequests, 8000, ready && Boolean(user))
  const hasPending = (pending.data?.length ?? 0) > 0

  async function logout() {
    try { await sessionApi.logout() } finally { clear(); router.replace(ROUTES.login) }
  }

  /** A nav item is active on its own page and any page beneath it. */
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  if (!ready) return <div className="min-h-svh bg-page" aria-busy="true" />

  const name = user?.fullName ?? user?.username ?? "Patient"
  const personalId = user?.personalId ?? ""

  return (
    <div className="min-h-svh bg-page text-ink">
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-line bg-surface px-5 lg:px-9">
        <Logo className="h-9" />
        <div className="relative flex items-center gap-2">
          <Button className="hidden h-10 rounded-lg px-4 sm:flex" onClick={() => router.push("/access") }>
            <UsersThree aria-hidden size={19} /> Share access
          </Button>
          <Link href="/access" aria-label={hasPending ? "Notifications: a request needs your decision" : "Notifications"} className="relative flex size-10 items-center justify-center rounded-lg border border-line bg-surface hover:bg-field">
            <Bell aria-hidden size={20} />
            {hasPending ? <span className="absolute right-2 top-2 size-2 rounded-full bg-danger" /> : null}
          </Link>
          <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-field" aria-expanded={profileOpen} aria-haspopup="menu">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-weak font-semibold text-brand">{name.slice(0, 1).toUpperCase()}</span>
            <span className="hidden text-left md:block"><span className="block text-body font-medium leading-5">{name}</span>{personalId ? <span className="block text-caption text-ink-subtle">ID: {personalId}</span> : null}</span>
            <CaretDown aria-hidden size={17} className="hidden md:block" />
          </button>
          {profileOpen ? (
            <div className="absolute right-0 top-12 z-40 w-[310px] overflow-hidden rounded-xl border border-line bg-surface shadow-card">
              <div className="border-b border-line px-4 py-4"><p className="text-caption text-ink-subtle">PERSONAL</p><div className="mt-2 flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-full bg-brand-weak text-lg font-semibold text-brand">{name.slice(0, 1).toUpperCase()}</span><div><p className="font-medium">{name}</p>{personalId ? <p className="text-caption text-ink-subtle">ID: {personalId}</p> : null}</div></div></div>
              <div className="p-2">
                <SoonItem icon={<UserCircle size={20} />} label="My Account" />
                <Link href="/home#card" onClick={() => setProfileOpen(false)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-field"><IdentificationCard size={20} /> OneHealth Card</Link>
                <SoonItem icon={<UsersThree size={20} />} label="Emergency Contacts" />
              </div>
              <div className="border-y border-line p-2">
                <button type="button" onClick={() => setThemeOpen((open) => !open)} aria-expanded={themeOpen} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-field">
                  <span className="flex-1">Theme</span>
                  <span className="rounded-md border border-line px-2 py-1 text-caption capitalize">{theme ?? "system"} <CaretDown className="ml-1 inline" /></span>
                </button>
                {themeOpen ? <div className="ml-8 mt-1 space-y-1 pb-2">
                  {(["light", "dark", "system"] as const).map((option) => <button key={option} type="button" onClick={() => { setTheme(option); setThemeOpen(false) }} className={`block w-full rounded-md px-3 py-2 text-left text-body capitalize hover:bg-field ${theme === option ? "bg-brand-weak font-medium text-brand" : ""}`}>{option}{theme === option ? " ✓" : ""}</button>)}
                </div> : null}
                <SoonItem icon={<Gear size={20} />} label="Settings" />
              </div>
              <div className="p-2"><button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-danger hover:bg-field"><SignOut size={20} /> Log out</button></div>
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
                const active = isActive(href)
                return <Link key={label} href={href} aria-current={active ? "page" : undefined} className={`flex h-10 items-center gap-3 rounded-lg px-3 text-left text-body transition ${active ? "bg-brand-weak font-medium text-brand" : "hover:bg-field"}`} title={collapsed ? label : undefined}><Icon size={20} weight={active ? "fill" : "regular"} />{!collapsed ? <span>{label}</span> : null}</Link>
              })}
            </nav>
          </div>
        </aside>
        <div className="min-w-0 flex-1 pb-16 lg:pb-0">
          {children}
          <footer className="border-t border-line px-6 py-7 text-caption text-ink-subtle lg:px-10"><div className="flex flex-col justify-between gap-2 sm:flex-row"><span>© 2026 OneHealth. All rights reserved.</span><span className="flex gap-4"><span>Privacy Policy</span><span>•</span><span>Terms of Service</span></span></div></footer>
        </div>
      </div>
      {/* The sidebar is hidden below the lg breakpoint, so phones get the same links as a bottom bar. */}
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface lg:hidden">
        {NAV.map(({ label, href, Icon }) => {
          const active = isActive(href)
          return <Link key={label} href={href} aria-current={active ? "page" : undefined} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-caption ${active ? "font-medium text-brand" : "text-ink-subtle"}`}><Icon size={22} weight={active ? "fill" : "regular"} />{label}</Link>
        })}
      </nav>
    </div>
  )
}
