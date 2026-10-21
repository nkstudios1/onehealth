"use client"

import { ActiveSessions } from "@/components/access/active-sessions"
import { PendingRequests } from "@/components/access/pending-requests"
import { ActivateCard } from "@/components/card/activate-card"
import { HealthCard } from "@/components/card/health-card"
import { Essentials } from "@/components/home/essentials"
import { accessApi } from "@/lib/api/access"
import { usePoll } from "@/lib/hooks/use-poll"
import { useSessionStore } from "@/lib/stores/session-store"

/**
 * Patient home. One responsive layout (the patient app is a PWA used on phones and desktops):
 * one column on a phone, two columns from the `lg` breakpoint. The request alert spans the
 * full width on top so an urgent request is the first thing seen.
 */
export default function HomePage() {
  const user = useSessionStore((s) => s.user)

  // The card rarely changes: a slow poll. Records change when the patient edits them.
  const card = usePoll(accessApi.getCard, 60_000)
  const records = usePoll(accessApi.getRecords, 15_000)

  return (
    <main className="mx-auto grid w-full max-w-5xl content-start gap-4 px-4 py-6 lg:grid-cols-[400px_1fr] lg:items-start lg:gap-6">
      <PendingRequests />

      <div className="flex flex-col gap-4">
        {card.data ? (
          <HealthCard
            name={user?.username ?? user?.fullName ?? ""}
            personalId={user?.personalId ?? ""}
            card={card.data}
          />
        ) : card.data === null ? (
          // null = the server answered "no card". undefined = still loading.
          <ActivateCard onActivated={() => card.refresh()} />
        ) : null}
      </div>

      <div className="flex flex-col gap-4">
        {records.data ? <Essentials records={records.data} /> : null}
        <ActiveSessions />
      </div>
    </main>
  )
}
