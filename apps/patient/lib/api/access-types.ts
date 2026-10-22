// lib/api/access-types.ts
/**
 * Shapes the backend returns for cards, access requests, sessions and records.
 * They mirror the Laravel API (see its docs/BACKEND-GUIDE.md, section 11). Keys are camelCase.
 */
export type RecordVisibility = "public" | "private"
export type RecordCategory = "clinical_report" | "vitals" | "medical_history"

export interface HealthCard {
  /** Only the last 4 digits of the card number ever reach the browser. */
  last4: string
  status: string
  /** yyyy-mm-dd */
  expiresAt: string
  /** What the QR encodes: a random token, NOT the card number. It can be replaced. */
  qrToken: string
}

export interface PatientRecord {
  id: string
  category: RecordCategory
  /** Free-text label, e.g. "Blood group". */
  type: string
  /** The value, e.g. "O positive". */
  title: string
  summary: string | null
  payload: unknown
  visibility: RecordVisibility
  eventAt: string | null
  createdAt: string
}

/** What the patient types when adding a record to their own file. */
export interface NewRecordInput {
  category: RecordCategory
  /** Free-text label, e.g. "Blood group". */
  type: string
  /** The value, e.g. "O positive". */
  title: string
  summary?: string
  /** Records are private unless the patient chooses to share them. */
  visibility: RecordVisibility
}

/** A hospital asking to see a patient's records. Same shape for the patient and for a contact. */
export interface AccessRequestSummary {
  requestId: string
  organisationName: string
  /** Numbers a genuine call from this hospital comes from. */
  frontDeskNumbers: string[]
  patientName: string
  requestedAt: string
  expiresAt: string
  /** Present on the patient's list only. */
  stage?: "patient" | "contacts"
}

export interface PatientSession {
  id: string
  organisationName: string
  accessLevel: string
  method: string
  status: string
  startedAt: string
  endedAt: string | null
}

// ---- hospital side ----

export type RequestStatus = "pending" | "approved" | "denied" | "expired" | "cancelled"

export interface ProviderRequest {
  requestId: string
  status: RequestStatus
  stage: "patient" | "contacts"
  expiresAt: string
  /** Set once approved. */
  sessionId: string | null
  attemptsLeft: number
}

export interface ScanInput {
  qrToken?: string
  cardNumber?: string
  /** yyyy-mm-dd. Required together with cardNumber. */
  dateOfBirth?: string
}

export interface Essentials {
  sessionId: string
  accessLevel: string
  startedAt: string
  patient: { fullName: string; personalId: string; dateOfBirth: string; gender: string | null }
  /** Only the records the patient made public. */
  records: PatientRecord[]
  /** How many exist but are hidden. The hospital sees the count, never the content. */
  privateRecordCount: number
}

export interface VisitNoteInput {
  category: RecordCategory
  type: string
  title: string
  summary?: string
}
