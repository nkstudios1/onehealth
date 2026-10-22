"use client"

// app/(app)/home/page.tsx
// The patient's dashboard. Every number and row here comes from the API (nothing is sample data).
//
// Concept, "polling": the browser cannot be told by the server that something changed, so
// `usePoll` asks again every few seconds. A new hospital request therefore appears on its own.
// Each `usePoll` returns `data` (undefined until the first reply), `error` and `refresh()`.
import Link from "next/link"
import {
  ArrowRight,
  CaretRight,
  CheckCircle,
  Circle,
  FileText,
  Heartbeat,
  ShieldCheck,
  UserCircle,
} from "@phosphor-icons/react"

import { Essentials } from "@/components/home/essentials"
import { ActivateCard } from "@/components/card/activate-card"
import { HealthCard } from "@/components/card/health-card"
import { PendingRequests } from "@/components/access/pending-requests"
import { ActiveSessions } from "@/components/access/active-sessions"
import { accessApi } from "@/lib/api/access"
import type { PatientRecord, PatientSession } from "@/lib/api/access-types"
import { usePoll } from "@/lib/hooks/use-poll"
import { useSessionStore } from "@/lib/stores/session-store"

/** "2d ago", "3h ago", "just now". Used for "last updated" and session times. */
function timeAgo(iso: string | null) {
  if (!iso) return "date not set"
  const diff = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diff)) return "date not set"
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const METHOD_LABEL: Record<string, string> = {
  card_qr: "Card scan",
  emergency_contact: "Emergency contact",
}

/** The three big numbers at the top. Same layout for each; the first is the filled one. */
function SummaryCard({
  filled,
  title,
  value,
  label,
  detail,
  href,
  icon,
}: {
  filled?: boolean
  title: string
  value: string
  label: string
  detail: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-[168px] flex-col justify-between rounded-2xl border p-4 shadow-card ${
        filled ? "border-transparent bg-brand text-on-brand" : "border-line bg-surface text-ink"
      }`}
    >
      <div className="flex items-center justify-between text-caption font-medium uppercase">
        <span>{title}</span>
        <span className={filled ? "text-on-brand" : "text-brand"}>{icon}</span>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <strong className="text-[48px] leading-none tracking-tight">{value}</strong>
          <span className={`font-semibold ${filled ? "text-on-brand" : "text-brand"}`}>{label}</span>
        </div>
        <div className={`mt-2 flex items-center justify-between text-caption ${filled ? "text-on-brand/85" : "text-ink-subtle"}`}>
          <span>{detail}</span>
          <CaretRight aria-hidden size={19} />
        </div>
      </div>
    </Link>
  )
}

function VitalCard({ record }: { record: PatientRecord }) {
  return (
    <article className="w-[190px] shrink-0 rounded-2xl border border-line bg-field p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-weak text-brand">
          <Heartbeat aria-hidden size={18} />
        </span>
        <h3 className="truncate text-body font-medium">{record.type}</h3>
      </div>
      <p className="mt-6 min-h-[54px] break-words text-title font-extrabold tracking-tight">{record.title}</p>
      <div className="mt-4 flex items-center justify-between border-t border-line-subtle pt-3 text-caption text-ink-subtle">
        <span>Updated {timeAgo(record.eventAt ?? record.createdAt)}</span>
        <CaretRight aria-hidden size={17} />
      </div>
    </article>
  )
}

function SessionRow({ session }: { session: PatientSession }) {
  const active = session.status === "active"
  return (
    <div className="flex min-h-[52px] items-center justify-between gap-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand text-caption font-bold text-on-brand">
          {session.organisationName.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-body">{session.organisationName}</span>
          <span className="block text-caption text-ink-subtle">{timeAgo(session.startedAt)}</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-caption">
        <span className="hidden rounded border border-line-subtle px-2 py-1 text-ink-subtle sm:inline">
          {METHOD_LABEL[session.method] ?? session.method}
        </span>
        <span className={`rounded-full px-2 py-1 ${active ? "bg-brand-weak text-brand" : "bg-chip text-ink-subtle"}`}>
          {active ? "Active" : "Ended"}
        </span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const user = useSessionStore((s) => s.user)
  const name = user?.fullName ?? user?.username ?? "there"
  const firstName = name.split(" ")[0]

  const records = usePoll(accessApi.getRecords, 15000)
  const sessions = usePoll(accessApi.sessionHistory, 8000)
  const pending = usePoll(accessApi.pendingRequests, 4000)
  const card = usePoll(accessApi.getCard, 60000)

  const recordList = records.data ?? []
  const sessionList = sessions.data ?? []
  const pendingCount = pending.data?.length ?? 0
  const activeCount = sessionList.filter((s) => s.status === "active").length
  const hospitalCount = new Set(sessionList.map((s) => s.organisationName)).size

  const count = (category: PatientRecord["category"]) => recordList.filter((r) => r.category === category).length
  const vitals = recordList.filter((r) => r.category === "vitals").slice(0, 8)

  // The setup checklist is computed from what really exists, so the percentage is honest.
  const setup = [
    { text: "Create your account", done: true },
    { text: "Activate your OneHealth card", done: Boolean(card.data), href: "#card" },
    { text: "Add your first record", done: recordList.length > 0, href: "/records" },
    { text: "Share a record with hospitals", done: recordList.some((r) => r.visibility === "public"), href: "/records" },
  ]
  const percent = Math.round((setup.filter((s) => s.done).length / setup.length) * 100)

  return (
    <main className="mx-auto w-full max-w-[950px] px-5 py-7 lg:px-[22px] lg:py-8">
      <h1 className="font-display text-[36px] font-extrabold tracking-tight sm:text-[40px]">Welcome back, {firstName}!</h1>

      <div className="mt-6 flex flex-col gap-4">
        <PendingRequests />
      </div>

      <section className="mt-7 grid gap-4 xl:grid-cols-3">
        <SummaryCard
          filled
          title="Total records"
          value={records.data ? String(recordList.length) : "–"}
          label="Records"
          detail={`${count("clinical_report")} reports · ${count("medical_history")} histories · ${count("vitals")} vitals`}
          href="/records"
          icon={<FileText aria-hidden size={23} />}
        />
        <SummaryCard
          title="Active sessions"
          value={sessions.data ? String(activeCount) : "–"}
          label={activeCount === 1 ? "Provider" : "Providers"}
          detail={`${hospitalCount} ${hospitalCount === 1 ? "provider has" : "providers have"} had access`}
          href="/access"
          icon={<UserCircle aria-hidden size={23} />}
        />
        <SummaryCard
          title="Pending requests"
          value={pending.data ? String(pendingCount) : "–"}
          label={pendingCount > 0 ? "Action required" : "All clear"}
          detail={pendingCount > 0 ? "A hospital is waiting for you" : "Nothing needs your decision"}
          href="/access"
          icon={<ArrowRight aria-hidden size={22} />}
        />
      </section>

      <section id="card" className="mt-6 grid scroll-mt-24 gap-6 lg:grid-cols-2">
        {card.data === undefined ? (
          <div className="min-h-[220px] rounded-2xl border border-line bg-surface p-5 text-ink-subtle" aria-busy="true">
            Loading your card…
          </div>
        ) : card.data ? (
          <HealthCard name={name} personalId={user?.personalId ?? ""} card={card.data} />
        ) : (
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-display text-title font-extrabold">Activate your OneHealth card</h2>
            <p className="text-body text-ink-subtle">Enter the 16 digits printed on your card to link it to you.</p>
            <ActivateCard onActivated={() => card.refresh()} />
          </div>
        )}
        <Essentials records={recordList} />
      </section>

      <section id="vitals" className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-title font-extrabold">My health vitals</h2>
          <Link href="/vitals" className="flex shrink-0 items-center gap-1 text-body font-medium text-brand">
            View readings <CaretRight aria-hidden size={18} />
          </Link>
        </div>
        {vitals.length === 0 ? (
          <p className="mt-5 rounded-xl bg-field p-4 text-body text-ink-subtle">
            No vitals saved yet. <Link href="/records" className="font-medium text-brand">Add a reading</Link> such as blood pressure or weight.
          </p>
        ) : (
          <div className="mt-5 flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {vitals.map((record) => <VitalCard key={record.id} record={record} />)}
          </div>
        )}
      </section>

      <div className="mt-6">
        <ActiveSessions />
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
        <article className="min-h-[360px] rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-title font-extrabold">Recent sessions</h2>
            <Link href="/access" className="flex items-center gap-1 text-body font-medium text-brand">
              See all <CaretRight aria-hidden size={18} />
            </Link>
          </div>
          {sessionList.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-2 text-center">
              <ShieldCheck aria-hidden size={30} className="text-ink-subtle" />
              <p className="font-semibold">No hospital has accessed your records</p>
              <p className="text-body text-ink-subtle">When you approve a request it is listed here.</p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-line">
              {sessionList.slice(0, 6).map((session) => <SessionRow key={session.id} session={session} />)}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-display text-title font-extrabold">Complete your account setup</h2>
          <div
            role="img"
            aria-label={`${percent}% complete`}
            className="mx-auto mt-7 flex size-[112px] items-center justify-center rounded-full border-[10px] border-line border-r-brand border-t-brand text-title"
          >
            {percent}%
          </div>
          <div className="mt-7 divide-y divide-line">
            {setup.map((item) => {
              const row = (
                <>
                  {item.done ? (
                    <CheckCircle aria-hidden className="text-brand" size={19} weight="fill" />
                  ) : (
                    <Circle aria-hidden className="text-ink-subtle" size={19} />
                  )}
                  <span className="flex-1">{item.text}</span>
                  {!item.done && item.href ? <CaretRight aria-hidden size={17} className="text-ink-subtle" /> : null}
                </>
              )
              const cls = "flex min-h-[52px] items-center gap-2 py-2 text-body"
              return !item.done && item.href ? (
                <Link key={item.text} href={item.href} className={cls}>{row}</Link>
              ) : (
                <div key={item.text} className={cls}>{row}</div>
              )
            })}
          </div>
        </article>
      </section>
    </main>
  )
}
