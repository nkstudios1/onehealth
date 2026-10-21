"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Hash } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"
import { FlowCard, FlowHeader } from "@workspace/ui/components/flow-card"
import { IconBadge } from "@workspace/ui/components/icon-badge"
import { OtpField } from "@workspace/ui/components/otp-field"

import { ResendCode } from "@/components/auth/resend-code"
import { authApi, getErrorMessage } from "@/lib/api"
import { OTP_LENGTH } from "@/lib/constants"
import { useCountdown } from "@/lib/hooks/use-countdown"
import { useStepGuard } from "@/lib/hooks/use-step-guard"
import { ROUTES } from "@/lib/routes"
import { useResetStore } from "@/lib/stores/reset-store"

export default function ResetVerifyPage() {
  const router = useRouter()
  const resetId = useResetStore((s) => s.resetId)
  const channel = useResetStore((s) => s.channel)
  const destination = useResetStore((s) => s.destination)
  const resendAvailableAt = useResetStore((s) => s.resendAvailableAt)
  const scheduleResend = useResetStore((s) => s.scheduleResend)
  const setVerified = useResetStore((s) => s.setVerified)

  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const secondsLeft = useCountdown(resendAvailableAt)
  // Guard: this screen only makes sense after step 1. Sends people back to /signup
  // by default, so we point it at the reset start instead (see note below).
  const allowed = useStepGuard(Boolean(resetId), ROUTES.resetPassword)
  if (!allowed || !resetId) return null

  async function onVerify() {
    setVerifying(true)
    setError(null)
    try {
      const { resetToken } = await authApi.verifyResetOtp({ resetId: resetId!, code })
      setVerified(resetToken)
      router.push(ROUTES.resetPasswordNew)
    } catch (err) {
      setError(getErrorMessage(err))
      setCode("")
      setVerifying(false)
    }
  }

  async function onResend() {
    setResending(true)
    setError(null)
    try {
      const { resendAfterSeconds } = await authApi.resendResetOtp({ resetId: resetId! })
      scheduleResend(resendAfterSeconds)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setResending(false)
    }
  }

  return (
    <FlowCard>
      <FlowHeader
        title={channel === "email" ? "Verify your email" : "Verify your phone"}
        onBack={() => router.back()}
      />

      <div className="flex flex-col items-center gap-4">
        <IconBadge icon={Hash} />
        <p className="text-center text-body">
          Enter the {OTP_LENGTH} digit code sent to
          <br />
          <strong className="font-bold">{destination}</strong>
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

      <ResendCode secondsLeft={secondsLeft} resending={resending} onResend={onResend} />

      <Button loading={verifying} disabled={code.length < OTP_LENGTH} onClick={onVerify}>
        Verify
      </Button>
    </FlowCard>
  )
}