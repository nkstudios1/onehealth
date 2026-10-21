// lib/api/types.ts
/**
 * INVENTED API CONTRACT. These shapes are our proposal, not the backend's.
 * When the real endpoints exist, change the types here and the adapter in
 * auth.http.ts. Screens keep working as long as AuthApi stays the same.
 */
export type Gender = "Male" | "Female"

export interface IdentityPreview {
  fullName: string
  /** ISO date, e.g. "1990-06-11" */
  dateOfBirth: string
  gender: Gender
  /** null until the real NIN photo is available; the UI falls back to initials */
  photoUrl: string | null
}

export interface StartRegistrationInput { phone: string; nin: string; consent: boolean }
export interface StartRegistrationResult { registrationId: string; identity: IdentityPreview }

export interface OtpSentResult { resendAfterSeconds: number }
export interface VerifyOtpInput { registrationId: string; code: string }

export interface EmergencyContactInput {
  name: string
  relationship: string
  phone: string
  email?: string
}
export interface SaveEmergencyContactsInput {
  registrationId: string
  contacts: EmergencyContactInput[]
}

export interface CompleteRegistrationInput { registrationId: string; password: string }
export interface CompleteRegistrationResult {
  username: string
  /** The permanent personal ID shown on the success screen */
  personalId: string
}

/** The signed-in person, as the login endpoints return them. */
export interface SessionUser {
  id: string
  fullName: string
  personalId: string
}

export interface LoginInput {
  /** The patient's personal ID (phone number without the leading 0) or their email. */
  identifier: string
  password: string
}
export interface LoginResult {
  user: SessionUser
}


export type ResetChannel = "sms" | "email"

export interface RequestPasswordResetInput {
  /** What the person typed: their phone number or their email. */
  identifier: string
}
export interface RequestPasswordResetResult {
  resetId: string
  /** Where the code was sent. Decides the wording on the verify screen. */
  channel: ResetChannel
  /** Partly hidden, safe to show, e.g. "080****5678" or "ch***@mail.com". */
  destination: string
  resendAfterSeconds: number
}

export interface VerifyResetOtpInput { resetId: string; code: string }
export interface VerifyResetOtpResult {
  /** Proof that the code was correct. Needed for the final step. */
  resetToken: string
}

export interface ResetPasswordInput { resetToken: string; password: string }

export interface AuthApi {
  /** Screen: Sign up -> "Proceed". Looks up the NIN and returns who it belongs to. */
  startRegistration(input: StartRegistrationInput): Promise<StartRegistrationResult>
  /** Screen: Confirm details -> "Yes, this is me". Sends the SMS code. */
  confirmIdentity(input: { registrationId: string }): Promise<OtpSentResult>
  /** Screen: Verify phone -> "Resend code". */
  resendPhoneOtp(input: { registrationId: string }): Promise<OtpSentResult>
  /** Screen: Verify phone -> "Verify". */
  verifyPhoneOtp(input: VerifyOtpInput): Promise<void>
  /** Screen: Emergency contact -> "Next". */
  saveEmergencyContacts(input: SaveEmergencyContactsInput): Promise<void>
  /** Screen: Setup password -> "Continue". Creates the account. */
  completeRegistration(input: CompleteRegistrationInput): Promise<CompleteRegistrationResult>

    /** Screen: Login -> "Login". */
  login(input: LoginInput): Promise<LoginResult>
  /** Screen: Login -> "Continue with Google". Confirm with the backend that this exists. */
  loginWithGoogle(): Promise<LoginResult>

    /** Reset step 1: "Send OTP". Never reveals whether the account exists. */
  requestPasswordReset(input: RequestPasswordResetInput): Promise<RequestPasswordResetResult>
  /** Reset step 2: "Resend code". */
  resendResetOtp(input: { resetId: string }): Promise<OtpSentResult>
  /** Reset step 2: "Verify". */
  verifyResetOtp(input: VerifyResetOtpInput): Promise<VerifyResetOtpResult>
  /** Reset step 3: "Reset". */
  resetPassword(input: ResetPasswordInput): Promise<void>
}