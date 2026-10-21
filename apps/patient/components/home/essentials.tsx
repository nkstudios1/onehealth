"use client"

import { Eye, EyeSlash } from "@phosphor-icons/react"

import type { PatientRecord } from "@/lib/api/access-types"
import { pickEssentials } from "@/lib/essentials"

/** The four emergency facts, plus a hint about what the patient keeps private. */
export function Essentials({ records }: { records: PatientRecord[] }) {
  const rows = pickEssentials(records)
  const privateCount = records.filter((r) => r.visibility === "private").length

  return (
    <section className="flex w-full flex-col gap-3 rounded-lg bg-surface p-6 text-ink shadow-card dark:border dark:border-line">
      <h2 className="text-title">Medical essentials</h2>

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

      <p className="flex items-center gap-2 text-caption text-ink-subtle">
        <Eye aria-hidden size={16} /> Hospitals you approve can see these.
      </p>
      <p className="flex items-center gap-2 text-caption text-ink-subtle">
        <EyeSlash aria-hidden size={16} /> {privateCount} other{" "}
        {privateCount === 1 ? "record is" : "records are"} private.
      </p>
    </section>
  )
}
