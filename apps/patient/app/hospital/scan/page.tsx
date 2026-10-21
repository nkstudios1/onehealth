"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { getErrorMessage } from "@/lib/api"
import { providerApi } from "@/lib/api/provider"
import { hospitalRoutes } from "@/lib/routes"

/**
 * Two ways in, both create the same access request:
 *  - QR: the card's QR holds a token. Camera scanning comes later; for now this field accepts
 *    the token typed or pasted (a USB barcode scanner "types" it, so it already works with one).
 *  - Card number + the patient's date of birth, for a damaged QR. The date of birth is a second
 *    check, so a found card number alone is useless.
 */
export default function ScanPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"qr" | "number">("qr")
  const [qrToken, setQrToken] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [dob, setDob] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const req = await providerApi.scan(
        mode === "qr"
          ? { qrToken: qrToken.trim() }
          : { cardNumber: cardNumber.replace(/\s/g, ""), dateOfBirth: dob }
      )
      router.push(hospitalRoutes.request(req.requestId))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const canSend = mode === "qr" ? qrToken.trim().length > 0 : cardNumber.replace(/\s/g, "").length >= 16 && dob !== ""

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-lg bg-surface p-6 shadow-card dark:border dark:border-line"
    >
      <h1 className="text-title">Request a patient&apos;s records</h1>

      <div className="grid grid-cols-2 gap-2">
        <Button variant={mode === "qr" ? "default" : "outline"} onClick={() => setMode("qr")}>
          Scan QR
        </Button>
        <Button variant={mode === "number" ? "default" : "outline"} onClick={() => setMode("number")}>
          Card number
        </Button>
      </div>

      {mode === "qr" ? (
        <label className="flex flex-col gap-1 text-caption text-ink-subtle">
          Card code (what the QR holds)
          <Input value={qrToken} onChange={(e) => setQrToken(e.target.value)} autoFocus autoComplete="off" />
        </label>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-caption text-ink-subtle">
            16-digit card number
            <Input
              inputMode="numeric"
              maxLength={19}
              autoComplete="off"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-caption text-ink-subtle">
            Patient&apos;s date of birth
            <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </label>
        </>
      )}

      {error ? <p role="alert" className="text-body text-danger">{error}</p> : null}

      <Button type="submit" loading={busy} disabled={!canSend}>
        Send request
      </Button>
    </form>
  )
}
