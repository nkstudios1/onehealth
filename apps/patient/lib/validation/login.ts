import { z } from "zod"

/**
 * Login only checks that something was typed. The password RULES (length,
 * letter + number) apply when creating a password, not here, so people
 * with older passwords are never blocked on the client.
 * The server decides whether the credentials are correct.
 */
export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your personal ID or email"),
  password: z.string().min(1, "Enter your password"),
})
export type LoginValues = z.infer<typeof loginSchema>