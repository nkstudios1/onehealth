import { create } from "zustand"

import type { ResetChannel } from "@/lib/api/types"

/**
 * Data carried between the three reset screens. In memory only.
 * The reset token is proof the code was entered correctly, so it must never
 * be written to localStorage or logged.
 */
interface ResetState {
  resetId: string | null
  channel: ResetChannel
  /** Partly hidden destination, safe to show on screen. */
  destination: string
  resendAvailableAt: number | null
  resetToken: string | null
  /** True after a successful reset: the login screen shows a notice. */
  passwordChanged: boolean

  begin: (input: {
    resetId: string
    channel: ResetChannel
    destination: string
    resendAfterSeconds: number
  }) => void
  scheduleResend: (resendAfterSeconds: number) => void
  setVerified: (resetToken: string) => void
  markPasswordChanged: () => void
  dismissNotice: () => void
}

export const useResetStore = create<ResetState>()((set) => ({
  resetId: null,
  channel: "sms",
  destination: "",
  resendAvailableAt: null,
  resetToken: null,
  passwordChanged: false,

  // Starting a new reset wipes any previous attempt
  begin: ({ resetId, channel, destination, resendAfterSeconds }) =>
    set({
      resetId,
      channel,
      destination,
      resendAvailableAt: Date.now() + resendAfterSeconds * 1000,
      resetToken: null,
      passwordChanged: false,
    }),
  scheduleResend: (resendAfterSeconds) =>
    set({ resendAvailableAt: Date.now() + resendAfterSeconds * 1000 }),
  setVerified: (resetToken) => set({ resetToken }),
  // Only sets the flag. Clearing the token here would trip the step guard on
  // the page we are leaving and fight the redirect to /login.
  markPasswordChanged: () => set({ passwordChanged: true }),
  dismissNotice: () => set({ passwordChanged: false }),
}))