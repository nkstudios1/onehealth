"use client"

import { textLinkBoldClass } from "@workspace/ui/lib/link-classes"
import { cn } from "@workspace/ui/lib/utils"

import { formatCountdown } from "@/lib/format"

interface ResendCodeProps {
  /** Seconds until resending is allowed. 0 = allowed now. */
  secondsLeft: number
  resending?: boolean
  onResend: () => void
}

/** "Resend code" in bold teal, plus "after 5:59" while the countdown runs. */
export function ResendCode({ secondsLeft, resending = false, onResend }: ResendCodeProps) {
  const canResend = secondsLeft === 0 && !resending
  return (
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
  )
}