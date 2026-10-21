"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { FlowCard, FlowHeader } from "@workspace/ui/components/flow-card"
import { IconBadge } from "@workspace/ui/components/icon-badge"
import { PasswordInput } from "@workspace/ui/components/password-input"

import { authApi } from "@/lib/api"
import { MIN_EMERGENCY_CONTACTS, SIGNUP_STEPS } from "@/lib/constants"
import { useStepGuard } from "@/lib/hooks/use-step-guard"
import { ROUTES } from "@/lib/routes"
import { useSignupStore } from "@/lib/stores/signup-store"
import { passwordSchema, type PasswordValues } from "@/lib/validation/signup"

export default function SetupPasswordPage() {
  const router = useRouter()
  const registrationId = useSignupStore((s) => s.registrationId)
  const phoneVerified = useSignupStore((s) => s.phoneVerified)
  const contactCount = useSignupStore((s) => s.contacts.length)
  const complete = useSignupStore((s) => s.complete)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const allowed = useStepGuard(
    Boolean(registrationId && phoneVerified && contactCount >= MIN_EMERGENCY_CONTACTS)
  )
  if (!allowed || !registrationId) return null

  async function onSubmit({ password }: PasswordValues) {
    try {
      const result = await authApi.completeRegistration({ registrationId: registrationId!, password })
      complete(result)
      router.replace(ROUTES.signupSuccess)
    } catch {
      // Any failure at the last step goes to the dedicated error screen ("Try again" comes back here)
      router.replace(ROUTES.signupError)
    }
  }

  return (
    <FlowCard>
      <FlowHeader
        title="Setup password"
        onBack={() => router.back()}
        step={{ current: SIGNUP_STEPS.password, total: SIGNUP_STEPS.total }}
      />

      <div className="flex flex-col items-center gap-4">
        <IconBadge icon={Lock} />
        <p className="text-center text-body">
          Create your password for logging in and other account actions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FieldGroup className="gap-4">
          <Field data-invalid={!!errors.password} className="gap-2">
            <FieldLabel htmlFor="password" className="sr-only">Create password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Create password"
              aria-invalid={!!errors.password}
              aria-describedby="password-hint"
              {...register("password")}
            />
            {/* Not in Figma (guide deviation #2): delete if the team disagrees */}
            <FieldDescription id="password-hint" className="text-caption text-ink-subtle">
              At least 8 characters, with a letter and a number.
            </FieldDescription>
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={!!errors.confirmPassword} className="gap-2">
            <FieldLabel htmlFor="confirmPassword" className="sr-only">Confirm password</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
        </FieldGroup>

        <Button type="submit" loading={isSubmitting}>
          Continue
        </Button>
      </form>
    </FlowCard>
  )
}