import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * A horizontal line with a centred label, e.g. "OR" (Figma "Divider/text-center").
 * The lines are decorative; the label is normal text, so screen readers read "OR".
 * Usage: <Divider>OR</Divider>
 */
function Divider({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div data-slot="divider" className={cn("flex w-full items-center gap-4", className)}>
      <span aria-hidden className="h-px flex-1 bg-line-subtle" />
      <span className="text-micro text-ink-subtle">{children}</span>
      <span aria-hidden className="h-px flex-1 bg-line-subtle" />
    </div>
  )
}

export { Divider }