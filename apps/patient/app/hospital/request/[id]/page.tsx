"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CircleNotch } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"
import { OtpField } from "@workspace/ui/components/otp-field"

import { getErrorMessage } from "@/lib/api"
import { providerApi } from "@/lib/api/provider"
import { usePoll } from "@/lib/hooks/use-poll"
import { hospitalRoutes } from "@/lib/routes"

const CODE_LENGTH = 6

/**
 * Waiting for approval. Polls every 3 seconds; each poll also advances the request on the server
 * (after the patient's wait, the emergency contacts are asked). When the status becomes
 * "approved" it moves on to the patient's records.
 */
export default function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [code, setCode] = useState("")
  const [codeError, setCodeError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const { data: req, error, refresh } = usePoll(() => providerApi.getRequest(id), 3000)

  // Approved (by the patient, a contact in the app, or a contact's link): go and see the data.
  useEffect(() => {
    if (req?.status === "approved" && req.sessionId) router.replace(hospitalRoutes.session(req.sessionId))
  }, [req, router])

  async function submitCode(e: React.FormEvent) {
    e.preventDefault()
    setCodeError(null)
    setBusy(true)
    try {
      const { sessionId } = await providerApi.submitCode(id, code)
      router.replace(hospitalRoutes.session(sessionId))
    } catch (err) {
      setCodeError(getErrorMessage(err))
      setCode("")
      void refresh() // the number of tries left changed
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-lg bg-surface p-6 shadow-card dark:border dark:border-line">
      {!req && !error ? <p className="text-body text-ink-subtle">Loading…</p> : null}
      {error && !req ? <p role="alert" className="text-body text-danger">{getErrorMessage(error)}</p> : null}

      {req?.status === "pending" ? (
        <>
          <h1 className="flex items-center gap-2 text-title">
            <CircleNotch aria-hidden size={20} className="animate-spin motion-reduce:animate-none" />
            {req.stage === "patient" ? "Waiting for the patient to approve" : "Asking the emergency contacts"}
          </h1>
          <p className="text-body text-ink-subtle">
            {req.stage === "patient"
              ? "The patient has been notified. If they don't answer in a short while, we contact their emergency contacts."
              : "Their emergency contacts have a code and an Approve link. If one of them reads you the code on a call, type it below."}
          </p>

          {req.stage === "contacts" ? (
            <form onSubmit={submitCode} className="flex flex-col gap-3">
              <p className="text-caption text-ink-subtle">
                {CODE_LENGTH}-digit code from the contact ({req.attemptsLeft} tries left)
              </p>
              <OtpField length={CODE_LENGTH} value={code} onChange={setCode} invalid={!!codeError} />
              {codeError ? <p role="alert" className="text-body text-danger">{codeError}</p> : null}
              <Button type="submit" loading={busy} disabled={code.length !== CODE_LENGTH}>
                Confirm code
              </Button>
            </form>
          ) : null}
        </>
      ) : null}

      {req && req.status !== "pending" && req.status !== "approved" ? (
        <>
          <h1 className="text-title">
            {req.status === "denied" && "The patient declined"}
            {req.status === "expired" && "The request expired"}
            {req.status === "cancelled" && "The request was cancelled"}
          </h1>
          <Button onClick={() => router.replace(hospitalRoutes.scan)}>Back to scan</Button>
        </>
      ) : null}
    </section>
  )
}
