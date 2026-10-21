"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { FlowCard, FlowHeader } from "@workspace/ui/components/flow-card"

import { authApi, getErrorMessage } from "@/lib/api"
import { formatDateOfBirth, getInitials } from "@/lib/format"
import { useStepGuard } from "@/lib/hooks/use-step-guard"
import { ROUTES } from "@/lib/routes"
import { useSignupStore } from "@/lib/stores/signup-store"

export default function ConfirmDetailsPage() {
  const router = useRouter()
  const registrationId = useSignupStore((s) => s.registrationId)
  const identity = useSignupStore((s) => s.identity)
  const confirmIdentity = useSignupStore((s) => s.confirmIdentity)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allowed = useStepGuard(Boolean(registrationId && identity))
  if (!allowed || !registrationId || !identity) return null

  async function onConfirm() {
    setLoading(true)
    setError(null)
    try {
      // Backend sends the SMS code as a side effect of this call
      const { resendAfterSeconds } = await authApi.confirmIdentity({ registrationId: registrationId! })
      confirmIdentity(resendAfterSeconds)
      router.push(ROUTES.signupVerify)
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <FlowCard>
      <FlowHeader title="Confirm your details" />

      <div className="flex flex-col items-center gap-4">
        {/* `size-20!` (important) because shadcn's Avatar sets its own size.
            Figma: 80px circle. */}
        <Avatar className="size-20!">
          <AvatarImage src={identity.photoUrl ?? undefined} alt={`Photo of ${identity.fullName}`} />
          <AvatarFallback className="bg-chip text-title">{getInitials(identity.fullName)}</AvatarFallback>
        </Avatar>
        <p className="text-center text-body">
          Confirm if the photo and information below belongs to you
        </p>
      </div>

      <dl className="flex flex-col gap-2 rounded-lg border border-line bg-field p-4 text-body">
        <div>
          <dt className="inline">Name: </dt>
          <dd className="inline font-bold">{identity.fullName}</dd>
        </div>
        <div>
          <dt className="inline">DOB: </dt>
          <dd className="inline font-bold">{formatDateOfBirth(identity.dateOfBirth)}</dd>
        </div>
        <div>
          <dt className="inline">Gender: </dt>
          <dd className="inline font-bold">{identity.gender}</dd>
        </div>
      </dl>

      {error ? <p role="alert" className="text-body text-danger">{error}</p> : null}

      <Button loading={loading} onClick={onConfirm}>
        Yes, this is me
      </Button>
      {/* Back to the form: the phone number is kept, the NIN is not */}
      <Button variant="outline" disabled={loading} onClick={() => router.push(ROUTES.signup)}>
        No, change NIN
      </Button>
    </FlowCard>
  )
}