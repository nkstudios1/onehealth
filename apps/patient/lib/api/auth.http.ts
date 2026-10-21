// lib/api/auth.http.ts
import { request } from "./client"
import type { AuthApi } from "./types"

/**
 * The REAL implementation. Endpoint paths are invented placeholders; rename
 * them (and reshape the bodies) to match the Django API when it is ready.
 * This is the only file that should change.
 */
export const httpAuthApi: AuthApi = {
  startRegistration: (input) => request("/auth/register/start", input),
  confirmIdentity: (input) => request("/auth/register/confirm-identity", input),
  resendPhoneOtp: (input) => request("/auth/register/resend-otp", input),
  verifyPhoneOtp: (input) => request("/auth/register/verify-otp", input),
  saveEmergencyContacts: (input) => request("/auth/register/emergency-contacts", input),
  completeRegistration: (input) => request("/auth/register/complete", input),
    login: (input) => request("/auth/login", input),
  // A real Google sign-in is normally a redirect flow (OAuth), not one POST.
  // This is a placeholder: agree the flow with the backend before relying on it.
  loginWithGoogle: () => request("/auth/login/google"),
    requestPasswordReset: (input) => request("/auth/password-reset/request", input),
  resendResetOtp: (input) => request("/auth/password-reset/resend-otp", input),
  verifyResetOtp: (input) => request("/auth/password-reset/verify-otp", input),
  resetPassword: (input) => request("/auth/password-reset/confirm", input),
  
}