/**
 * Single place that reads environment variables.
 * NEXT_PUBLIC_* values must be written out in full (no dynamic keys),
 * otherwise Next.js cannot inline them into the browser bundle.
 */
export const env = {
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === "true",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  portalSignupUrl: process.env.NEXT_PUBLIC_PORTAL_SIGNUP_URL ?? "http://localhost:3000/signup",
  termsUrl: process.env.NEXT_PUBLIC_TERMS_URL ?? "/terms",
  privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL ?? "/privacy",
} as const

if (process.env.NODE_ENV === "production" && env.useMocks) {
  console.warn("[OneHealth] Mock API is enabled in a production build. Turn off NEXT_PUBLIC_USE_MOCKS.")
}