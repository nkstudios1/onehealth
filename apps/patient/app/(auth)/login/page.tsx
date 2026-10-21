"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@workspace/ui/components/button"
import { Divider } from "@workspace/ui/components/divider"
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field"
import { FlowCard } from "@workspace/ui/components/flow-card"
import { Input } from "@workspace/ui/components/input"
import { PasswordInput } from "@workspace/ui/components/password-input"
import { textLinkBoldClass } from "@workspace/ui/lib/link-classes"

import { Logo } from "@/components/brand/logo"
import { GoogleIcon } from "@/components/brand/google-icon"
import { authApi, getErrorMessage } from "@/lib/api"
import { ROUTES } from "@/lib/routes"
import { useSessionStore } from "@/lib/stores/session-store"
import { loginSchema, type LoginValues } from "@/lib/validation/login"
import { useResetStore } from "@/lib/stores/reset-store"

export default function LoginPage() {
  const router = useRouter()
  const setUser = useSessionStore((s) => s.setUser)

  const [formError, setFormError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const passwordChanged = useResetStore((s) => s.passwordChanged)
  const dismissNotice = useResetStore((s) => s.dismissNotice)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
        dismissNotice()
        setFormError(null)
    try {
      const { user } = await authApi.login(values)
      setUser(user)
      router.replace(ROUTES.home)
    } catch (error) {
      // One message under the button for every failure. We deliberately do NOT
      // say which of the two fields was wrong (that would help attackers guess IDs).
      setFormError(getErrorMessage(error))
    }
  }

  async function onGoogle() {
    setFormError(null)
    setGoogleLoading(true)
    try {
      const { user } = await authApi.loginWithGoogle()
      setUser(user)
      router.replace(ROUTES.home)
    } catch (error) {
      setFormError(getErrorMessage(error))
      setGoogleLoading(false)
    }
  }

  const busy = isSubmitting || googleLoading

  return (
    <FlowCard className="gap-6 py-10">
      <div className="flex flex-col items-center gap-2">
        <Logo />
        <p className="text-center text-body">Welcome back! Login to access your account</p>
      </div>
        {passwordChanged ? (
            <p role="status" className="text-center text-body text-brand">
                Your password has been changed. Log in with your new password.
            </p>
        ) : null}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.identifier} className="gap-2">
              <FieldLabel htmlFor="identifier" className="sr-only">Personal ID or email</FieldLabel>
              <Input
                id="identifier"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Personal ID or email"
                aria-invalid={!!errors.identifier}
                {...register("identifier")}
              />
              <FieldError errors={[errors.identifier]} />
            </Field>

            <Field data-invalid={!!errors.password} className="gap-2">
              <FieldLabel htmlFor="password" className="sr-only">Password</FieldLabel>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="Password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
          </FieldGroup>

          <p className="text-body">
            Forgot password?{" "}
            <Link href={ROUTES.resetPassword} className={textLinkBoldClass}>Reset</Link>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {formError ? (
            <p role="alert" className="text-body text-danger">{formError}</p>
          ) : null}

          <Button type="submit" loading={isSubmitting} disabled={googleLoading}>
            Login
          </Button>

          {/* Remove from here ... */}
          <Divider>OR</Divider>
          <Button
            variant="outline"
            className="px-4"
            loading={googleLoading}
            disabled={isSubmitting}
            onClick={onGoogle}
          >
            {googleLoading ? null : <GoogleIcon />}
            Continue with Google
          </Button>
          {/* ... to here if the backend has no Google login */}

          <p className="text-center text-body">
            Don&apos;t have an account?{" "}
            <Link href={ROUTES.signup} className={textLinkBoldClass}>Create one</Link>
          </p>
        </div>
      </form>
    </FlowCard>
  )
}