"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LockSimple } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"

import { getErrorMessage } from "@/lib/api"
import type { Essentials } from "@/lib/api/access-types"
import { providerApi } from "@/lib/api/provider"
import { pickEssentials } from "@/lib/essentials"
import { formatDateOfBirth, toTitleCase } from "@/lib/format"
import { hospitalRoutes } from "@/lib/routes"

/** An approved session: the patient's public essentials, a visit note, and check-out. */
export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [data, setData] = useState<Essentials | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let alive = true
    providerApi
      .essentials(id)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(getErrorMessage(e)))
    return () => {
      alive = false
    }
  }, [id])

  async function saveNote(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      // Hospital notes are ALWAYS private to the patient until the patient shares them.
      await providerApi.writeNote(id, { category: "clinical_report", type: "Visit note", title: note.trim() })
      setNote("")
      setSaved(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function checkOut() {
    setLeaving(true)
    try {
      await providerApi.checkOut(id)
      router.replace(hospitalRoutes.scan)
    } catch (err) {
      setError(getErrorMessage(err))
      setLeaving(false)
    }
  }

  if (!data) {
    return error ? (
      <p role="alert" className="text-body text-danger">{error}</p>
    ) : (
      <p className="text-body text-ink-subtle">Loading…</p>
    )
  }

  const rows = pickEssentials(data.records)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <section className="flex flex-col gap-3 rounded-lg bg-surface p-6 shadow-card dark:border dark:border-line">
        <h1 className="text-title">{toTitleCase(data.patient.fullName)}</h1>
        <p className="text-caption text-ink-subtle">
          ID {data.patient.personalId} · Born {formatDateOfBirth(data.patient.dateOfBirth)}
          {data.patient.gender ? ` · ${data.patient.gender}` : ""}
        </p>

        <dl className="grid grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.key} className="flex flex-col gap-1 rounded-md bg-field p-3">
              <dt className="text-caption text-ink-subtle">{row.label}</dt>
              <dd className="text-body-lg">
                {row.values.length > 0 ? (
                  row.values.join(", ")
                ) : (
                  <span className="text-ink-subtle">Not recorded</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        {data.privateRecordCount > 0 ? (
          <p className="flex items-center gap-2 text-caption text-ink-subtle">
            <LockSimple aria-hidden size={16} /> {data.privateRecordCount} more{" "}
            {data.privateRecordCount === 1 ? "record is" : "records are"} private to the patient.
          </p>
        ) : null}
      </section>

      <div className="flex flex-col gap-4">
        <form
          onSubmit={saveNote}
          className="flex flex-col gap-3 rounded-lg bg-surface p-6 shadow-card dark:border dark:border-line"
        >
          <h2 className="text-title">Add a visit note</h2>
          <textarea
            className="min-h-24 w-full rounded-md border border-line bg-field p-3 text-input text-ink placeholder:text-ink-weak focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Admitted with a broken wrist. X-ray done."
            aria-label="Visit note"
          />
          {saved ? <p role="status" className="text-caption text-brand-deep">Saved. Only the patient can see it.</p> : null}
          {error ? <p role="alert" className="text-caption text-danger">{error}</p> : null}
          <Button type="submit" loading={saving} disabled={!note.trim()}>
            Save note
          </Button>
        </form>

        <Button variant="outline" loading={leaving} onClick={checkOut}>
          Check patient out (ends access)
        </Button>
      </div>
    </div>
  )
}
