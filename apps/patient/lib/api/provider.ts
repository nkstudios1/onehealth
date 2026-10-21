// lib/api/provider.ts
import { request } from "./client"
import type { Essentials, ProviderRequest, ScanInput, VisitNoteInput } from "./access-types"

const get = <T>(path: string) => request<T>(path, undefined, "GET")

/** Hospital (organisation staff) calls. */
export const providerApi = {
  /** Creates the access request and returns it so the screen can start waiting. */
  scan: (input: ScanInput) => request<ProviderRequest>("/provider/access-requests", input),

  /** Poll this. Each call also advances the request (patient wait over -> contacts are asked). */
  getRequest: (id: string) => get<ProviderRequest>(`/provider/access-requests/${id}`),

  /** A contact read the code out over the phone and the nurse typed it. 5 wrong codes cancel the request. */
  submitCode: (id: string, code: string) =>
    request<{ sessionId: string }>(`/provider/access-requests/${id}/code`, { code }),

  essentials: (sessionId: string) => get<Essentials>(`/provider/sessions/${sessionId}/essentials`),

  /** Hospital notes are always private to the patient until the patient shares them. */
  writeNote: (sessionId: string, note: VisitNoteInput) =>
    request<unknown>(`/provider/sessions/${sessionId}/records`, note),

  checkOut: (sessionId: string) => request<unknown>(`/provider/sessions/${sessionId}/checkout`, {}),
}
