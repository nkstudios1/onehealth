import { cn } from "@workspace/ui/lib/utils"

interface StepIndicatorProps {
  /** 1-based index of the current step. */
  current: number
  total: number
  className?: string
}

/**
 * The dots in the top-right of the sign-up screens (Figma "Progress").
 *   completed step = small orange dot (6px)
 *   current step   = tall orange pill (6 x 18px)
 *   upcoming step  = small grey dot
 * Screen readers get one sentence ("Step 2 of 3") instead of the dots.
 */
export function StepIndicator({ current, total, className }: StepIndicatorProps) {
  return (
    <div
      role="img"
      aria-label={`Step ${current} of ${total}`}
      className={cn("flex items-center gap-1", className)}
    >
      {Array.from({ length: total }, (_, index) => {
        const step = index + 1
        const isCurrent = step === current
        const isDone = step < current
        return (
          <span
            key={step}
            aria-hidden
            data-state={isCurrent ? "current" : isDone ? "done" : "todo"}
            className={cn(
              "w-1.5 shrink-0 rounded-full",
              isCurrent ? "h-4.5" : "h-1.5",
              isCurrent || isDone ? "bg-warning" : "bg-track"
            )}
          />
        )
      })}
    </div>
  )
}