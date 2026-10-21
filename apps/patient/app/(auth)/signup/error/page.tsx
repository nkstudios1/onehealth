"use client"

import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { FlowCard, FlowHeader } from "@workspace/ui/components/flow-card"
import { IconBadge } from "@workspace/ui/components/icon-badge"
import { cn } from "@workspace/ui/lib/utils"

import { ROUTES } from "@/lib/routes"

/**
 * "Try again" returns to the password screen, where the step guard sends the
 * user to /signup if the session is gone. This is a client component because
 * the shared components use Phosphor icons, which need the client.
 */
export default function RegistrationErrorPage() {
  return (
    <FlowCard>
      <FlowHeader title="Something went wrong" />

      <div className="flex flex-col items-center gap-4">
        <IconBadge tone="error" />
        <p role="alert" className="text-center text-body-lg">
          We were unable to complete your registration. Please try again.
        </p>
      </div>

      <Link href={ROUTES.signupPassword} className={cn(buttonVariants(), "w-full")}>
        Try again
      </Link>
    </FlowCard>
  )
}