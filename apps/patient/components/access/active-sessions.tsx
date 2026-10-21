"use client"

import { useState } from "react"

import { Button } from "@workspace/ui/components/button"

import { accessApi } from "@/lib/api/access"
import { usePoll } from "@/lib/hooks/use-poll"

/** Who can see the patient's records right now, with a button to end each hospital's access. */
export function ActiveSessions() {
  const sessions = usePoll(accessApi.activeSessions, 8000)
  const [revoking, setRevoking] = useState<string | null>(null)

  const list = sessions.data ?? []
  if (list.length === 0) return null

  async function revoke(id: string) {
    setRevoking(id)
    try {
      await accessApi.revoke(id)
      sessions.refresh()
    } finally {
      setRevoking(null)
    }
  }

  return (
    <section className="flex w-full flex-col gap-3 rounded-lg bg-surface p-6 text-ink shadow-card dark:border dark:border-line">
      <h2 className="text-title">Who can see your records now</h2>
      <ul className="flex flex-col gap-3">
        {list.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-body-lg">{s.organisationName}</p>
              <p className="text-caption text-ink-subtle">
                Since {new Date(s.startedAt).toLocaleTimeString()}
              </p>
            </div>
            <Button variant="outline" className="px-4" loading={revoking === s.id} onClick={() => revoke(s.id)}>
              End access
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
