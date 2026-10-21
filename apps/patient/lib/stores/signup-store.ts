// lib/stores/signup-store.ts
import { create } from "zustand"

import type {
  CompleteRegistrationResult,
  EmergencyContactInput,
  IdentityPreview,
} from "@/lib/api/types"

/**
 * Data carried between the sign-up screens. In memory only (no localStorage):
 * a refresh sends the user back to /signup, which is the safe default for
 * identity data.
 *
 * What is deliberately NOT stored: the NIN (only sent to the API once) and
 * the password (it lives in the form state of one screen only).
 */
interface SignupState {
  registrationId: string | null
  phone: string
  identity: IdentityPreview | null
  identityConfirmed: boolean
  phoneVerified: boolean
  /** Epoch ms when the "Resend code" button unlocks. */
  resendAvailableAt: number | null
  contacts: EmergencyContactInput[]
  result: CompleteRegistrationResult | null

  begin: (input: { registrationId: string; phone: string; identity: IdentityPreview }) => void
  confirmIdentity: (resendAfterSeconds: number) => void
  scheduleResend: (resendAfterSeconds: number) => void
  markPhoneVerified: () => void
  addContact: (contact: EmergencyContactInput) => void
  removeContact: (phone: string) => void
  complete: (result: CompleteRegistrationResult) => void
}

export const useSignupStore = create<SignupState>()((set) => ({
  registrationId: null,
  phone: "",
  identity: null,
  identityConfirmed: false,
  phoneVerified: false,
  resendAvailableAt: null,
  contacts: [],
  result: null,

  // Starting (or restarting) registration wipes everything from a previous attempt
  begin: ({ registrationId, phone, identity }) =>
    set({
      registrationId,
      phone,
      identity,
      identityConfirmed: false,
      phoneVerified: false,
      resendAvailableAt: null,
      contacts: [],
      result: null,
    }),
  confirmIdentity: (resendAfterSeconds) =>
    set({ identityConfirmed: true, resendAvailableAt: Date.now() + resendAfterSeconds * 1000 }),
  scheduleResend: (resendAfterSeconds) =>
    set({ resendAvailableAt: Date.now() + resendAfterSeconds * 1000 }),
  markPhoneVerified: () => set({ phoneVerified: true }),
  addContact: (contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
  removeContact: (phone) =>
    set((state) => ({ contacts: state.contacts.filter((c) => c.phone !== phone) })),
  complete: (result) => set({ result }),
}))