"use client"

import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { FlowCard, FlowHeader } from "@workspace/ui/components/flow-card"
import { IconBadge } from "@workspace/ui/components/icon-badge"
import { cn } from "@workspace/ui/lib/utils"

import { useStepGuard } from "@/lib/hooks/use-step-guard"
import { ROUTES } from "@/lib/routes"
import { useSignupStore } from "@/lib/stores/signup-store"

export default function RegistrationSuccessPage() {
  const result = useSignupStore((s) => s.result)
  const allowed = useStepGuard(Boolean(result))
  if (!allowed || !result) return null

  return (
    <FlowCard>
      <FlowHeader title="Registration successful!" />

      <div className="flex flex-col items-center gap-4">
        <IconBadge tone="success" />
        <p className="text-center text-caption text-ink-subtle">
          Your account is active. You can edit your profile later. Only share access with a
          trusted medical provider.
        </p>
      </div>

      <dl className="flex flex-col gap-2 rounded-lg border border-line bg-field p-4 text-center text-body">
        <div>
          <dt className="inline">Username: </dt>
          <dd className="inline font-bold">{result.username}</dd>
        </div>
        <div>
          <dt className="inline">Personal ID: </dt>
          <dd className="inline font-bold">{result.personalId}</dd>
        </div>
      </dl>

      {/* A link that looks like a button: buttonVariants gives it the same classes */}
      <Link href={ROUTES.home} className={cn(buttonVariants(), "w-full")}>
        Proceed to home
      </Link>
    </FlowCard>
  )
}