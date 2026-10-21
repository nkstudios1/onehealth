"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { FlowCard } from "@workspace/ui/components/flow-card"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import { authApi, getErrorMessage } from "@/lib/api"
import { ROUTES } from "@/lib/routes"
import { useResetStore } from "@/lib/stores/reset-store"
import { resetRequestSchema, type ResetRequestValues } from "@/lib/validation/reset"

export default function ResetPasswordPage() {
  const router = useRouter()
  const begin = useResetStore((s) => s.begin)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetRequestValues>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: { identifier: "" },
  })

  async function onSubmit(values: ResetRequestValues) {
    setFormError(null)
    try {
      const result = await authApi.requestPasswordReset(values)
      begin({
        resetId: result.resetId,
        channel: result.channel,
        destination: result.destination,
        resendAfterSeconds: result.resendAfterSeconds,
      })
      router.push(ROUTES.resetPasswordVerify)
    } catch (error) {
      setFormError(getErrorMessage(error))
    }
  }

  return (
    <FlowCard className="gap-6 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        {/* text-heading = 32px ExtraBold (Figma), text-gradient-brand = teal gradient text */}
        <h1 className="w-full text-heading text-gradient-brand">Reset password</h1>
        <p className="text-body">Enter the phone or email associated with your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <Field data-invalid={!!errors.identifier} className="gap-2">
          <FieldLabel htmlFor="identifier" className="sr-only">Email or phone number</FieldLabel>
          <Input
            id="identifier"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Email or phone number"
            aria-invalid={!!errors.identifier}
            {...register("identifier")}
          />
          <FieldError errors={[errors.identifier]} />
        </Field>

        <div className="flex flex-col gap-3">
          {formError ? (
            <p role="alert" className="text-body text-danger">{formError}</p>
          ) : null}

          <Button type="submit" loading={isSubmitting}>
            Send OTP
          </Button>
          {/* A link that looks like an outline button */}
          <Link
            href={ROUTES.login}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Login instead
          </Link>
        </div>
      </form>
    </FlowCard>
  )
}