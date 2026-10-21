import { z } from "zod"

import { PHONE_REGEX } from "@/lib/validation/signup"

/**
 * Step 1 accepts a phone number (11 digits starting with 0) or an email.
 * Anything else is rejected before we call the API.
 */
export const resetRequestSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your email or phone number")
    .refine(
      (value) => PHONE_REGEX.test(value) || z.string().email().safeParse(value).success,
      "Enter a valid email or an 11-digit phone number"
    ),
})
export type ResetRequestValues = z.infer<typeof resetRequestSchema>