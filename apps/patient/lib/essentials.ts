// lib/essentials.ts
import type { PatientRecord } from "@/lib/api/access-types"

/**
 * The four things an emergency team asks first. The backend stores medical content as free
 * text (`type` = label, `title` = value), so we pick them out by label. Nothing is computed.
 */
const ESSENTIALS = [
  { key: "blood", label: "Blood group", match: /blood/i },
  { key: "genotype", label: "Genotype", match: /genotype/i },
  { key: "allergy", label: "Allergies", match: /allerg/i },
  { key: "medication", label: "Medication", match: /medic/i },
] as const

export interface EssentialRow {
  key: string
  label: string
  /** Several allergies are several records. Empty = "Not recorded". */
  values: string[]
}

export function pickEssentials(records: PatientRecord[]): EssentialRow[] {
  return ESSENTIALS.map(({ key, label, match }) => ({
    key,
    label,
    values: records.filter((r) => match.test(r.type)).map((r) => r.title),
  }))
}
