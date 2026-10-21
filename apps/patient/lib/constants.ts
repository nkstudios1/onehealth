// lib/constants.ts

/** Step numbers shown by <StepIndicator> (inferred from the designs). */
export const SIGNUP_STEPS = { total: 3, verify: 1, emergencyContact: 2, password: 3 } as const

/** Digits in the phone verification code (the design shows 4). */
export const OTP_LENGTH = 4

/** Guide deviation #5: invented limits, confirm with product. PRD allows up to 3. */
export const MIN_EMERGENCY_CONTACTS = 1
export const MAX_EMERGENCY_CONTACTS = 3

/** From the Figma annotation on the Emergency contact screen. */
export const RELATIONSHIPS = [
  "Parent",
  "Sibling",
  "Relative",
  "Colleague",
  "Friend",
  "Others",
] as const