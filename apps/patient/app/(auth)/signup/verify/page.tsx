"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DeviceMobile } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"
import { FlowCard, FlowHeader } from "@workspace/ui/components/flow-card"
import { IconBadge } from "@workspace/ui/components/icon-badge"
import { OtpField } from "@workspace/ui/components/otp-field"
import { textLinkBoldClass } from "@workspace/ui/lib/link-classes"
import { cn } from "@workspace/ui/lib/utils"

import { authApi, getErrorMessage } from "@/lib/api"
import { OTP_LENGTH, SIGNUP_STEPS } from "@/lib/constants"
import { formatCountdown } from "@/lib/format"
import { useCountdown } from "@/lib/hooks/use-countdown"
import { useStepGuard } from "@/lib/hooks/use-step-guard"
import { ROUTES } from "@/lib/routes"
import { useSignupStore } from "@/lib/stores/signup-store"

export default function VerifyPhonePage() {
  const router = useRouter()
  const registrationId = useSignupStore((s) => s.registrationId)
  const phone = useSignupStore((s) => s.phone)
  const identityConfirmed = useSignupStore((s) => s.identityConfirmed)
  const resendAvailableAt = useSignupStore((s) => s.resendAvailableAt)
  const scheduleResend = useSignupStore((s) => s.scheduleResend)
  const markPhoneVerified = useSignupStore((s) => s.markPhoneVerified)

  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const secondsLeft = useCountdown(resendAvailableAt)
  const allowed = useStepGuard(Boolean(registrationId && identityConfirmed))
  if (!allowed || !registrationId) return null

  async function onVerify() {
    setVerifying(true)
    setError(null)
    try {
      await authApi.verifyPhoneOtp({ registrationId: registrationId!, code })
      markPhoneVerified()
      router.push(ROUTES.signupEmergencyContact)
    } catch (err) {
      setError(getErrorMessage(err))
      setCode("") // let the user retype straight away
      setVerifying(false)
    }
  }

  async function onResend() {
    setResending(true)
    setError(null)
    try {
      const { resendAfterSeconds } = await authApi.resendPhoneOtp({ registrationId: registrationId! })
      scheduleResend(resendAfterSeconds)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setResending(false)
    }
  }

  const canResend = secondsLeft === 0 && !resending

  return (
    <FlowCard>
      <FlowHeader
        title="Verify your phone"
        onBack={() => router.back()}
        step={{ current: SIGNUP_STEPS.verify, total: SIGNUP_STEPS.total }}
      />

      <div className="flex flex-col items-center gap-4">
        <IconBadge icon={DeviceMobile} />
        <p className="text-center text-body">
          Enter the {OTP_LENGTH} digit code sent to
          <br />
          <strong className="font-bold">{phone}</strong>
        </p>
      </div>

      <OtpField
        length={OTP_LENGTH}
        value={code}
        onChange={(value) => {
          setCode(value)
          setError(null)
        }}
        invalid={Boolean(error)}
        disabled={verifying}
        autoFocus
      />

      {error ? <p role="alert" className="text-center text-body text-danger">{error}</p> : null}

      <p className="text-center text-body">
        <button
          type="button"
          onClick={onResend}
          disabled={!canResend}
          className={cn(textLinkBoldClass, "disabled:cursor-not-allowed")}
        >
          Resend code
        </button>
        {secondsLeft > 0 ? (
          <span className="text-ink-subtle"> after {formatCountdown(secondsLeft)}</span>
        ) : null}
      </p>

      <Button loading={verifying} disabled={code.length < OTP_LENGTH} onClick={onVerify}>
        Verify
      </Button>
      <Button variant="outline" disabled={verifying} onClick={() => router.push(ROUTES.signup)}>
        Change my phone number
      </Button>
    </FlowCard>
  )
}