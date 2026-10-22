"use client"

import { Buildings } from "@phosphor-icons/react"

import { cn } from "@workspace/ui/lib/utils"

import { accessApi } from "@/lib/api/access"
import { usePoll } from "@/lib/hooks/use-poll"

/** How the hospital got in, in words a patient understands. */
function describeMethod(method: string) {
  if (method === "card_qr") return "You approved a card scan"
  if (method === "emergency_contact") return "An emergency contact approved"
  return "Approved"
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}

/**
 * Every hospital that has had access, newest first. This is the audit trail: the patient can
 * always see who looked, when, and who allowed it.
 */
export function AccessHistory() {
  const history = usePoll(accessApi.sessionHistory, 15_000)
  const list = history.data ?? []

  return (
    <section className="flex w-full flex-col gap-3 rounded-lg bg-surface p-6 text-ink shadow-card dark:border dark:border-line">
      <div>
        <h2 className="text-title">Access history</h2>
        <p className="text-caption text-ink-subtle">Every hospital that has had access.</p>
      </div>

      {history.data && list.length === 0 ? (
        <p className="rounded-md bg-field p-4 text-body text-ink-subtle">
          No hospital has accessed your records yet.
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {list.map((s) => {
          const active = s.status === "active"
          return (
            <li key={s.id} className="flex items-start gap-3 rounded-md bg-field p-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-weak">
                <Buildings aria-hidden size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-lg">{s.organisationName}</p>
                <p className="text-caption text-ink-subtle">{describeMethod(s.method)}</p>
                <p className="text-caption text-ink-subtle">
                  {formatWhen(s.startedAt)}
                  {s.endedAt ? ` to ${formatWhen(s.endedAt)}` : ""}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-caption",
                  active ? "bg-brand-weak text-ink" : "border border-line-subtle text-ink-subtle",
                )}
              >
                {active ? "Active" : "Ended"}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
