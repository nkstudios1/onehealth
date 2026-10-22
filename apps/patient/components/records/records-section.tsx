"use client"

import { useState } from "react"
import { Eye, EyeSlash, Plus } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { NativeSelect } from "@workspace/ui/components/native-select"
import { cn } from "@workspace/ui/lib/utils"

import { accessApi } from "@/lib/api/access"
import type { PatientRecord, RecordCategory, RecordVisibility } from "@/lib/api/access-types"
import { ApiError } from "@/lib/api/errors"

/** Headings for the three record categories the backend knows. */
const CATEGORIES: { value: RecordCategory; label: string }[] = [
  { value: "medical_history", label: "Medical history" },
  { value: "vitals", label: "Vitals" },
  { value: "clinical_report", label: "Clinical reports" },
]

/** Suggestions only. The label is free text, as the data model decided. */
const TYPE_SUGGESTIONS = [
  "Blood group",
  "Genotype",
  "Allergies",
  "Medication",
  "Diagnosis",
  "Surgery",
  "Immunisation",
  "Blood pressure",
  "Weight",
  "Temperature",
]

/**
 * The patient's own file: every record grouped by category, each with a button that flips it
 * between "Shared" (a hospital the patient approves can see it) and "Private" (hospitals only
 * see that it exists). A new record starts Private: the patient chooses to share.
 */
export function RecordsSection({
  records,
  onChange,
}: {
  records: PatientRecord[]
  onChange: () => void
}) {
  const [adding, setAdding] = useState(false)

  return (
    <section className="flex w-full flex-col gap-4 rounded-lg bg-surface p-6 text-ink shadow-card dark:border dark:border-line">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-title">Your records</h2>
          <p className="text-caption text-ink-subtle">
            You decide which ones a hospital can see.
          </p>
        </div>
        {!adding ? (
          <Button variant="secondary" className="px-3" onClick={() => setAdding(true)}>
            <Plus aria-hidden size={16} /> Add record
          </Button>
        ) : null}
      </div>

      {adding ? (
        <AddRecordForm
          onCancel={() => setAdding(false)}
          onSaved={() => {
            setAdding(false)
            onChange()
          }}
        />
      ) : null}

      {records.length === 0 && !adding ? (
        <p className="rounded-md bg-field p-4 text-body text-ink-subtle">
          Nothing here yet. Add your blood group, allergies or medication so a hospital can act
          fast in an emergency.
        </p>
      ) : null}

      {CATEGORIES.map((cat) => {
        const rows = records.filter((r) => r.category === cat.value)
        if (rows.length === 0) return null
        return (
          <div key={cat.value} className="flex flex-col gap-2">
            <h3 className="text-caption font-medium text-ink-subtle uppercase">{cat.label}</h3>
            <ul className="flex flex-col gap-2">
              {rows.map((r) => (
                <RecordRow key={r.id} record={r} onChange={onChange} />
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

function RecordRow({ record, onChange }: { record: PatientRecord; onChange: () => void }) {
  const [busy, setBusy] = useState(false)
  const shared = record.visibility === "public"

  async function flip() {
    setBusy(true)
    try {
      await accessApi.setVisibility(record.id, shared ? "private" : "public")
      onChange()
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-md bg-field p-3">
      <div className="min-w-0">
        <p className="text-caption text-ink-subtle">{record.type}</p>
        <p className="text-body-lg break-words">{record.title}</p>
        {record.summary ? (
          <p className="mt-1 text-body break-words text-ink-subtle">{record.summary}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={flip}
        disabled={busy}
        aria-pressed={shared}
        aria-label={shared ? "Shared with approved hospitals. Make private." : "Private. Share with approved hospitals."}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-caption transition-colors disabled:opacity-50",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          shared ? "bg-brand-weak text-ink" : "border border-line-subtle text-ink-subtle",
        )}
      >
        {shared ? <Eye aria-hidden size={14} /> : <EyeSlash aria-hidden size={14} />}
        {shared ? "Shared" : "Private"}
      </button>
    </li>
  )
}

function AddRecordForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [category, setCategory] = useState<RecordCategory>("medical_history")
  const [type, setType] = useState("")
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [visibility, setVisibility] = useState<RecordVisibility>("private")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = type.trim() !== "" && title.trim() !== ""

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      await accessApi.addRecord({
        category,
        type: type.trim(),
        title: title.trim(),
        summary: summary.trim() || undefined,
        visibility,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't save that. Try again.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4 rounded-md border border-line p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="rec-category">Category</Label>
        <NativeSelect
          id="rec-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as RecordCategory)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="rec-type">What is it?</Label>
        <Input
          id="rec-type"
          list="rec-type-list"
          placeholder="e.g. Blood group"
          value={type}
          maxLength={100}
          onChange={(e) => setType(e.target.value)}
        />
        <datalist id="rec-type-list">
          {TYPE_SUGGESTIONS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="rec-title">Value</Label>
        <Input
          id="rec-title"
          placeholder="e.g. O positive"
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="rec-summary">Notes (optional)</Label>
        <textarea
          id="rec-summary"
          rows={3}
          value={summary}
          maxLength={10000}
          onChange={(e) => setSummary(e.target.value)}
          className="min-h-20 w-full rounded-md border border-line bg-field p-3 text-entry text-ink placeholder:text-ink-weak focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Who can see it?</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "private", label: "Only me", Icon: EyeSlash },
              { value: "public", label: "Hospitals I approve", Icon: Eye },
            ] as const
          ).map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={visibility === value}
              onClick={() => setVisibility(value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-body transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                visibility === value
                  ? "border-brand bg-brand-weak text-ink"
                  : "border-line text-ink-subtle",
              )}
            >
              <Icon aria-hidden size={16} /> {label}
            </button>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="text-body text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={saving} disabled={!canSave}>
          Save record
        </Button>
      </div>
    </form>
  )
}
