"use client"

import { use, useEffect, useState } from "react"
import { CheckCircle, Warning } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"
import { FlowCard } from "@workspace/ui/components/flow-card"

import { accessApi } from "@/lib/api/access"
import type { AccessRequestSummary } from "@/lib/api/access-types"
import { getErrorMessage } from "@/lib/api"

type View =
  | { kind: "loading" }
  | { kind: "ready"; request: AccessRequestSummary }
  | { kind: "done" }
  | { kind: "error"; message: string }

/**
 * The page an emergency contact opens from the SMS. PUBLIC: nobody is signed in, the token in
 * the URL is the proof. Opening the page only DESCRIBES the request; approving is a separate
 * button that sends a POST (link scanners open every link, so a plain visit must never approve).
 * In Next.js 16 `params` is a Promise, which `use()` unwraps.
 */
export default function ApprovePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [view, setView] = useState<View>({ kind: "loading" })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    accessApi
      .describeLink(token)
      .then((request) => alive && setView({ kind: "ready", request }))
      .catch((e) => alive && setView({ kind: "error", message: getErrorMessage(e) }))
    return () => {
      alive = false
    }
  }, [token])

  async function approve() {
    setBusy(true)
    try {
      await accessApi.approveLink(token)
      setView({ kind: "done" })
    } catch (e) {
      setView({ kind: "error", message: getErrorMessage(e) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-page px-6 py-10">
      <FlowCard className="gap-4">
        {view.kind === "loading" ? <p className="text-body text-ink-subtle">Loading…</p> : null}

        {view.kind === "ready" ? (
          <>
            <h1 className="flex items-center gap-2 text-title">
              <Warning aria-hidden size={20} /> {view.request.patientName} needs help
            </h1>
            <p className="text-body-lg">
              {view.request.organisationName} is asking to see {view.request.patientName}&apos;s medical
              information because they can&apos;t answer.
            </p>
            {view.request.frontDeskNumbers.length > 0 ? (
              <p className="text-caption text-ink-subtle">
                A genuine call from them comes from: {view.request.frontDeskNumbers.join(", ")}. If a
                different number is pressing you, do not approve.
              </p>
            ) : null}
            <Button loading={busy} onClick={approve}>
              Approve access
            </Button>
            <p className="text-caption text-ink-subtle">
              Not sure? Close this page. The request expires by itself.
            </p>
          </>
        ) : null}

        {view.kind === "done" ? (
          <p className="flex items-center gap-2 text-title">
            <CheckCircle aria-hidden size={24} /> Thank you. The hospital can now help.
          </p>
        ) : null}

        {view.kind === "error" ? <p role="alert" className="text-body text-danger">{view.message}</p> : null}
      </FlowCard>
    </main>
  )
}
