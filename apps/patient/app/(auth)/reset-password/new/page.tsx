"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { FlowCard, FlowHeader } from "@workspace/ui/components/flow-card"
import { IconBadge } from "@workspace/ui/components/icon-badge"
import { PasswordInput } from "@workspace/ui/components/password-input"

import { authApi, getErrorMessage } from "@/lib/api"
import { useStepGuard } from "@/lib/hooks/use-step-guard"
import { ROUTES } from "@/lib/routes"
import { useResetStore } from "@/lib/stores/reset-store"
import { passwordSchema, type PasswordValues } from "@/lib/validation/signup"

export default function ChangePasswordPage() {
  const router = useRouter()
  const resetToken = useResetStore((s) => s.resetToken)
  const markPasswordChanged = useResetStore((s) => s.markPasswordChanged)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  // Guard: needs the proof from step 2
  const allowed = useStepGuard(Boolean(resetToken), ROUTES.resetPassword)
  if (!allowed || !resetToken) return null

  async function onSubmit({ password }: PasswordValues) {
    setFormError(null)
    try {
      await authApi.resetPassword({ resetToken: resetToken!, password })
      markPasswordChanged()
      router.replace(ROUTES.login)
    } catch (error) {
      setFormError(getErrorMessage(error))
    }
  }

  return (
    <FlowCard>
      <FlowHeader title="Change password" onBack={() => router.back()} />

      <div className="flex flex-col items-center gap-4">
        <IconBadge icon={Lock} />
        <p className="text-center text-body">Create your new password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FieldGroup className="gap-4">
          <Field data-invalid={!!errors.password} className="gap-2">
            <FieldLabel htmlFor="new-password" className="sr-only">New password</FieldLabel>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              placeholder="New password"
              aria-invalid={!!errors.password}
              aria-describedby="new-password-hint"
              {...register("password")}
            />
            <FieldDescription id="new-password-hint" className="text-caption text-ink-subtle">
              At least 8 characters, with a letter and a number.
            </FieldDescription>
            <FieldError errors={[errors.password]} />
          </Field>

          <Field data-invalid={!!errors.confirmPassword} className="gap-2">
            <FieldLabel htmlFor="confirm-password" className="sr-only">Confirm password</FieldLabel>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              placeholder="Confirm password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
        </FieldGroup>

        {formError ? (
          <p role="alert" className="text-body text-danger">{formError}</p>
        ) : null}

        <Button type="submit" loading={isSubmitting}>
          Reset
        </Button>
      </form>
    </FlowCard>
  )
}