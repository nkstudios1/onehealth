"use client"

import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { accessApi } from "@/lib/api/access"
import type { HealthCard } from "@/lib/api/access-types"
import { getErrorMessage } from "@/lib/api"

/** Shown when the patient has no active card yet: type the 16 digits printed on the card. */
export function ActivateCard({ onActivated }: { onActivated: (card: HealthCard) => void }) {
  const [number, setNumber] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      onActivated(await accessApi.activateCard(number.replace(/\s/g, "")))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-100 flex-col gap-3 rounded-lg bg-surface p-6 text-ink shadow-card dark:border dark:border-line"
    >
      <h2 className="text-title">Activate your card</h2>
      <p className="text-body text-ink-subtle">Enter the 16-digit number printed on your OneHealth card.</p>
      <Input
        inputMode="numeric"
        autoComplete="off"
        maxLength={19}
        placeholder="0000 0000 0000 0000"
        aria-label="Card number"
        aria-invalid={!!error}
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />
      {error ? <p role="alert" className="text-body text-danger">{error}</p> : null}
      <Button type="submit" loading={busy} disabled={number.replace(/\s/g, "").length < 16}>
        Activate card
      </Button>
    </form>
  )
}
