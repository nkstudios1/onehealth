// lib/api/auth.mock.ts
import { toTitleCase } from "@/lib/format"
import { ApiError } from "./errors"
import type { AuthApi, IdentityPreview, ResetChannel } from "./types"

/**
 * FAKE API for development. Disposable data, lives only in browser memory
 * (resets on page reload). Replace by setting NEXT_PUBLIC_USE_MOCKS=false.
 *
 * MAGIC VALUES for testing the unhappy paths:
 *   NIN   00000000000   -> NIN_NOT_FOUND
 *   Phone 08000000001   -> PHONE_ALREADY_REGISTERED
 *   Code  0000          -> OTP_INVALID
 *   Code  9999          -> OTP_EXPIRED
 *   Phone 08000000002   -> registration FAILS at the last step (error screen)
 *   anything else       -> success
 *  *   Identifier "locked"   -> TOO_MANY_ATTEMPTS
 *   Password "wrongpass"  -> INVALID_CREDENTIALS
 */
const MAGIC = {
  unknownNin: "00000000000",
  duplicatePhone: "08000000001",
  invalidCode: "0000",
  expiredCode: "9999",
  failingPhone: "08000000002",
    lockedIdentifier: "locked",
  wrongPassword: "wrongpass",
    rateLimitedPhone: "08000000003",
} as const

const RESEND_AFTER_SECONDS = 300

const FAKE_PEOPLE: Omit<IdentityPreview, "photoUrl">[] = [
  { fullName: "CHIDINMA GRACE OKAFOR", dateOfBirth: "1992-03-21", gender: "Female" },
  { fullName: "EMEKA DAVID NWOSU", dateOfBirth: "1988-11-02", gender: "Male" },
  { fullName: "AMINA ZAINAB BELLO", dateOfBirth: "1995-07-14", gender: "Female" },
  { fullName: "OSAZEE PETER IGBINEDION", dateOfBirth: "1985-01-30", gender: "Male" },
]

interface MockRegistration { phone: string; identity: IdentityPreview }
const registrations = new Map<string, MockRegistration>()

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
/** Fake network delay so loading states are visible while developing. */
const latency = () => wait(500 + Math.random() * 500)

function getRegistration(id: string) {
  const registration = registrations.get(id)
  if (!registration) {
    throw new ApiError("REGISTRATION_NOT_FOUND", "Your sign-up session expired. Please start again.", 404)
  }
  return registration
}

/** Password-reset sessions and tokens, kept in memory like the registrations. */
const resets = new Map<string, { channel: ResetChannel }>()
const resetTokens = new Set<string>()

function getReset(id: string) {
  const reset = resets.get(id)
  if (!reset) {
    throw new ApiError("RESET_NOT_FOUND", "Your reset session expired. Please start again.", 404)
  }
  return reset
}

/** "08012345678" -> "080****5678", "chidi@mail.com" -> "ch***@mail.com" */
function maskDestination(identifier: string) {
  if (identifier.includes("@")) {
    const [name = "", domain = ""] = identifier.split("@")
    return `${name.slice(0, 2)}***@${domain}`
  }
  return `${identifier.slice(0, 3)}****${identifier.slice(-4)}`
}

export const mockAuthApi: AuthApi = {
  async startRegistration({ phone, nin }) {
    await latency()
    if (nin === MAGIC.unknownNin) {
      throw new ApiError("NIN_NOT_FOUND", "We couldn't find this NIN. Check the number and try again.", 404)
    }
    if (phone === MAGIC.duplicatePhone) {
      throw new ApiError("PHONE_ALREADY_REGISTERED", "This phone number is already registered. Try logging in.", 409)
    }
    const person = FAKE_PEOPLE[Number(nin.slice(-1)) % FAKE_PEOPLE.length]!
    const identity: IdentityPreview = { ...person, photoUrl: null }
    const registrationId = crypto.randomUUID()
    registrations.set(registrationId, { phone, identity })
    return { registrationId, identity }
  },

  async confirmIdentity({ registrationId }) {
    await latency()
    getRegistration(registrationId)
    return { resendAfterSeconds: RESEND_AFTER_SECONDS }
  },

  async resendPhoneOtp({ registrationId }) {
    await latency()
    getRegistration(registrationId)
    return { resendAfterSeconds: RESEND_AFTER_SECONDS }
  },

  async verifyPhoneOtp({ registrationId, code }) {
    await latency()
    getRegistration(registrationId)
    if (code === MAGIC.invalidCode) {
      throw new ApiError("OTP_INVALID", "That code isn't correct. Check it and try again.", 400)
    }
    if (code === MAGIC.expiredCode) {
      throw new ApiError("OTP_EXPIRED", "That code has expired. Request a new one.", 400)
    }
  },

  async saveEmergencyContacts({ registrationId }) {
    await latency()
    getRegistration(registrationId)
  },

  async completeRegistration({ registrationId }) {
    await latency()
    const { phone, identity } = getRegistration(registrationId)
    if (phone === MAGIC.failingPhone) {
      throw new ApiError("REGISTRATION_FAILED", "We couldn't complete your registration.", 500)
    }
    return {
      username: toTitleCase(identity.fullName),
      // Personal ID = the phone number without its leading 0 (as in the design)
      personalId: phone.replace(/^0/, ""),
    }
  },

    async login({ identifier, password }) {
    await latency()
    if (identifier.trim().toLowerCase() === MAGIC.lockedIdentifier) {
      throw new ApiError("TOO_MANY_ATTEMPTS", "Too many attempts. Try again in a few minutes.", 429)
    }
    if (password === MAGIC.wrongPassword) {
      throw new ApiError("INVALID_CREDENTIALS", "Your personal ID, email or password is incorrect.", 401)
    }
    return {
      user: {
        id: crypto.randomUUID(),
        type: "patient",
        fullName: "Test Patient",
        username: "Test Patient",
        organisation: null,
        personalId: identifier.includes("@") ? "8012345678" : identifier.trim(),
      },
    }
  },

  async loginWithGoogle() {
    await latency()
    return {
      user: {
        id: crypto.randomUUID(),
        type: "patient",
        fullName: "Test Patient",
        username: "Test Patient",
        organisation: null,
        personalId: "8012345678",
      },
    }
  },

    async requestPasswordReset({ identifier }) {
    await latency()
    // Magic value (a phone number, so it passes the format check): TOO_MANY_ATTEMPTS
    if (identifier.trim() === MAGIC.rateLimitedPhone) {
      throw new ApiError("TOO_MANY_ATTEMPTS", "Too many attempts. Try again in a few minutes.", 429)
    }
    // Note: no "account not found" error. The real API must not reveal that either.
    const resetId = crypto.randomUUID()
    const channel: ResetChannel = identifier.includes("@") ? "email" : "sms"
    resets.set(resetId, { channel })
    return {
      resetId,
      channel,
      destination: maskDestination(identifier.trim()),
      resendAfterSeconds: RESEND_AFTER_SECONDS,
    }
  },

  async resendResetOtp({ resetId }) {
    await latency()
    getReset(resetId)
    return { resendAfterSeconds: RESEND_AFTER_SECONDS }
  },

  async verifyResetOtp({ resetId, code }) {
    await latency()
    getReset(resetId)
    if (code === MAGIC.invalidCode) {
      throw new ApiError("OTP_INVALID", "That code isn't correct. Check it and try again.", 400)
    }
    if (code === MAGIC.expiredCode) {
      throw new ApiError("OTP_EXPIRED", "That code has expired. Request a new one.", 400)
    }
    const resetToken = crypto.randomUUID()
    resetTokens.add(resetToken)
    return { resetToken }
  },

  async resetPassword({ resetToken }) {
    await latency()
    if (!resetTokens.has(resetToken)) {
      throw new ApiError("RESET_NOT_FOUND", "Your reset session expired. Please start again.", 404)
    }
    resetTokens.delete(resetToken) // a token works once
  },
}