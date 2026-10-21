"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { FlowCard } from "@workspace/ui/components/flow-card"
import { Input } from "@workspace/ui/components/input"
import { textLinkBoldClass, textLinkClass } from "@workspace/ui/lib/link-classes"

import { Logo } from "@/components/brand/logo"
import { ApiError, authApi, getErrorMessage } from "@/lib/api"
import { env } from "@/lib/env"
import { ROUTES } from "@/lib/routes"
import { useSignupStore } from "@/lib/stores/signup-store"
import { signupSchema, type SignupValues } from "@/lib/validation/signup"

export default function SignupPage() {
  const router = useRouter()
  const begin = useSignupStore((s) => s.begin)
  const savedPhone = useSignupStore((s) => s.phone) // prefilled after "No, change NIN"
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { phone: savedPhone, nin: "", consent: false },
  })

  async function onSubmit(values: SignupValues) {
    setFormError(null)
    try {
      const result = await authApi.startRegistration(values)
      begin({ registrationId: result.registrationId, phone: values.phone, identity: result.identity })
      router.push(ROUTES.signupConfirm)
    } catch (error) {
      // Put field-specific problems next to the field, everything else under the button
      if (error instanceof ApiError && error.code === "NIN_NOT_FOUND") {
        setError("nin", { message: error.message })
      } else if (error instanceof ApiError && error.code === "PHONE_ALREADY_REGISTERED") {
        setError("phone", { message: error.message })
      } else {
        setFormError(getErrorMessage(error))
      }
    }
  }

  return (
    <FlowCard className="gap-6 py-10">
      <div className="flex flex-col items-center gap-2">
        <Logo />
        <p className="text-center text-body">Create your personal records account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <FieldGroup className="gap-4">
          <Field data-invalid={!!errors.phone} className="gap-2">
            <FieldLabel htmlFor="phone" className="sr-only">Phone number</FieldLabel>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={11}
              placeholder="Phone number"
              aria-invalid={!!errors.phone}
              aria-describedby="phone-hint"
              {...register("phone")}
            />
            <FieldDescription id="phone-hint" className="text-caption text-ink-subtle">
              This will serve as your permanent personal ID
            </FieldDescription>
            <FieldError errors={[errors.phone]} />
          </Field>

          <Field data-invalid={!!errors.nin} className="gap-2">
            <FieldLabel htmlFor="nin" className="sr-only">11 digit NIN</FieldLabel>
            <Input
              id="nin"
              inputMode="numeric"
              autoComplete="off"
              maxLength={11}
              placeholder="11 digit NIN"
              aria-invalid={!!errors.nin}
              {...register("nin")}
            />
            <FieldError errors={[errors.nin]} />
          </Field>

          <Controller
            control={control}
            name="consent"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consent"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                    className="mt-0.5 border-line-medium"
                  />
                  {/* Plain <label>, not shadcn's: that one is `display:flex`
                      and would break the inline links apart. */}
                  <label htmlFor="consent" className="text-body">
                    I consent to OneHealth&apos;s{" "}
                    <Link href={env.termsUrl} className={textLinkClass}>Terms of Service</Link>{" "}
                    and{" "}
                    <Link href={env.privacyUrl} className={textLinkClass}>Privacy Policy</Link>
                  </label>
                </div>
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
        </FieldGroup>

        <div className="flex flex-col gap-3">
          {formError ? (
            <p role="alert" className="text-body text-danger">{formError}</p>
          ) : null}

          <Button type="submit" loading={isSubmitting}>
            Proceed
            <ArrowRight aria-hidden size={16} />
          </Button>

          <p className="text-center text-body">
            Already registered?{" "}
            <Link href={ROUTES.login} className={textLinkBoldClass}>Log in</Link>
          </p>
          <p className="text-center text-body">
            Sign up as a{" "}
            {/* Different app (portal), so a plain link */}
            <a href={env.portalSignupUrl} className={textLinkBoldClass}>Health Provider</a>
          </p>
        </div>
      </form>
    </FlowCard>
  )
}