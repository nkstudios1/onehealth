"use client"

import { useState } from "react"
import { Warning } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"

import { accessApi } from "@/lib/api/access"
import type { AccessRequestSummary } from "@/lib/api/access-types"
import { getErrorMessage } from "@/lib/api"
import { usePoll } from "@/lib/hooks/use-poll"

/**
 * Requests waiting for an answer. One list serves two people with the same card UI:
 *  - the patient (the request is about them), and
 *  - an emergency contact who has the app (the request is about someone else).
 * Both lists are polled every 4 seconds, so a new request appears without a refresh.
 */
export function PendingRequests() {
  const mine = usePoll(accessApi.pendingRequests, 4000)
  const forOthers = usePoll(accessApi.contactRequests, 4000)

  const own = mine.data ?? []
  const others = forOthers.data ?? []
  if (own.length === 0 && others.length === 0) return null

  return (
    <div className="flex w-full flex-col gap-3 lg:col-span-2">
      {own.map((r) => (
        <RequestCard
          key={r.requestId}
          request={r}
          title="A hospital wants to see your records"
          onApprove={() => accessApi.approve(r.requestId)}
          onDeny={() => accessApi.deny(r.requestId)}
          onDone={mine.refresh}
        />
      ))}
      {others.map((r) => (
        <RequestCard
          key={r.requestId}
          request={r}
          title={`${r.patientName} may need help`}
          note="They couldn't answer. Only approve if you know they are at this hospital."
          onApprove={() => accessApi.contactApprove(r.requestId)}
          onDone={forOthers.refresh}
        />
      ))}
    </div>
  )
}

interface RequestCardProps {
  request: AccessRequestSummary
  title: string
  note?: string
  onApprove: () => Promise<unknown>
  /** A contact cannot deny: ignoring it lets it expire. Leave out to hide the button. */
  onDeny?: () => Promise<unknown>
  onDone: () => void
}

function RequestCard({ request, title, note, onApprove, onDeny, onDone }: RequestCardProps) {
  const [busy, setBusy] = useState<"approve" | "deny" | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(kind: "approve" | "deny", action: () => Promise<unknown>) {
    setBusy(kind)
    setError(null)
    try {
      await action()
      onDone() // the request leaves the list on the next load
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <section
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-brand bg-brand-weak p-4 text-ink shadow-card"
    >
      <h2 className="flex items-center gap-2 text-title">
        <Warning aria-hidden size={20} /> {title}
      </h2>
      <p className="text-body-lg">{request.organisationName}</p>
      {request.frontDeskNumbers.length > 0 ? (
        <p className="text-caption text-ink-subtle">
          Genuine calls from this hospital come from: {request.frontDeskNumbers.join(", ")}
        </p>
      ) : null}
      {note ? <p className="text-caption text-ink-subtle">{note}</p> : null}
      {error ? <p className="text-caption text-danger">{error}</p> : null}

      <div className="flex gap-3">
        <Button
          className="px-4"
          loading={busy === "approve"}
          disabled={busy !== null}
          onClick={() => run("approve", onApprove)}
        >
          Approve
        </Button>
        {onDeny ? (
          <Button
            variant="outline"
            className="px-4"
            loading={busy === "deny"}
            disabled={busy !== null}
            onClick={() => run("deny", onDeny)}
          >
            Deny
          </Button>
        ) : null}
      </div>
    </section>
  )
}
