// lib/validation/signup.ts
import { z } from "zod"

/** Nigerian mobile format: 11 digits starting with 0, e.g. 08012345678 */
export const PHONE_REGEX = /^0\d{10}$/
export const NIN_REGEX = /^\d{11}$/

const phoneRule = z.string().regex(PHONE_REGEX, "Enter an 11-digit phone number, e.g. 08012345678")

export const signupSchema = z.object({
  phone: phoneRule,
  nin: z.string().regex(NIN_REGEX, "NIN must be exactly 11 digits"),
  consent: z.boolean().refine((value) => value === true, "Accept the Terms and Privacy Policy to continue"),
})
export type SignupValues = z.infer<typeof signupSchema>

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(2, "Enter the contact's name"),
  relationship: z.string().min(1, "Select a relationship"),
  phone: phoneRule,
  /** Optional: an empty string is allowed. */
  email: z.union([z.literal(""), z.string().email("Enter a valid email address")]),
})
export type EmergencyContactValues = z.infer<typeof emergencyContactSchema>

/** Invented rules (guide deviation #4). Change them here and the form follows. */
export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
export type PasswordValues = z.infer<typeof passwordSchema>