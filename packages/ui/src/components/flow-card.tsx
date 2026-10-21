"use client"

import * as React from "react"
import { ArrowLeft } from "@phosphor-icons/react"

import { Button } from "@workspace/ui/components/button"
import { StepIndicator } from "@workspace/ui/components/step-indicator"
import { cn } from "@workspace/ui/lib/utils"

/**
 * The white card every onboarding screen sits in (Figma: 400px wide, radius
 * 16, 24px side padding, 24px top, 40px bottom, 16px gap between blocks).
 * Light mode: soft shadow. Dark mode: a thin border instead (see --elevation-card).
 * The sign-up screen uses className="gap-6 py-10" (Figma gives it more air).
 */
function FlowCard({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="flow-card"
      className={cn(
        "flex w-full max-w-100 flex-col gap-4 rounded-lg border border-transparent bg-surface px-6 pt-6 pb-10 text-ink shadow-card dark:border-line",
        className
      )}
      {...props}
    />
  )
}

interface FlowHeaderProps {
  title: string
  /** Shows the round back button when provided. */
  onBack?: () => void
  /** Shows the step dots when provided. */
  step?: { current: number; total: number }
}

/** Header row: [back button] [title] [step dots]. Both sides are optional. */
function FlowHeader({ title, onBack, step }: FlowHeaderProps) {
  return (
    <header className="flex items-center justify-center gap-4">
      {onBack ? (
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-line"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft aria-hidden size={24} />
        </Button>
      ) : null}
      <h1 className="min-w-0 flex-1 text-center text-title">{title}</h1>
      {step ? <StepIndicator current={step.current} total={step.total} /> : null}
    </header>
  )
}

export { FlowCard, FlowHeader }