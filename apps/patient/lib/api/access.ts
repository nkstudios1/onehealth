// lib/api/access.ts
import { request } from "./client"
import type {
  AccessRequestSummary,
  HealthCard,
  NewRecordInput,
  PatientRecord,
  PatientSession,
  RecordVisibility,
} from "./access-types"

/** `request(path, body, method)`: a GET passes `undefined` as the body. */
const get = <T>(path: string) => request<T>(path, undefined, "GET")

/** Patient and emergency-contact calls. Hospital calls live in provider.ts. */
export const accessApi = {
  // ---- patient ----
  getCard: () => get<{ card: HealthCard | null }>("/cards/me").then((r) => r.card),
  activateCard: (cardNumber: string) =>
    request<{ card: HealthCard }>("/cards/activate", { cardNumber }).then((r) => r.card),

  getRecords: () => get<{ records: PatientRecord[] }>("/records").then((r) => r.records),
  addRecord: (input: NewRecordInput) =>
    request<{ record: PatientRecord }>("/records", input).then((r) => r.record),
  /** PATCH: only the patient can change who may see a record. */
  setVisibility: (id: string, visibility: RecordVisibility) =>
    request<{ record: PatientRecord }>(`/records/${id}/visibility`, { visibility }, "PATCH").then(
      (r) => r.record,
    ),

  pendingRequests: () =>
    get<{ requests: AccessRequestSummary[] }>("/access/requests/pending").then((r) => r.requests),
  approve: (id: string) => request<unknown>(`/access/requests/${id}/approve`, {}),
  deny: (id: string) => request<unknown>(`/access/requests/${id}/deny`, {}),

  activeSessions: () =>
    get<{ sessions: PatientSession[] }>("/access/sessions?status=active").then((r) => r.sessions),
  /** Every hospital that ever had access, newest first. Active and ended. */
  sessionHistory: () =>
    get<{ sessions: PatientSession[] }>("/access/sessions").then((r) => r.sessions),
  revoke: (id: string) => request<unknown>(`/access/sessions/${id}/revoke`, {}),

  // ---- emergency contact who has the app ----
  contactRequests: () =>
    get<{ requests: AccessRequestSummary[] }>("/access/contact-requests").then((r) => r.requests),
  contactApprove: (id: string) => request<unknown>(`/access/contact-requests/${id}/approve`, {}),

  // ---- emergency contact opening the SMS link (no account) ----
  /** GET only DESCRIBES the request. It never approves (link scanners open every link). */
  describeLink: (token: string) => get<AccessRequestSummary>(`/access/approvals/${token}`),
  approveLink: (token: string) => request<unknown>(`/access/approvals/${token}/approve`, {}),
}
