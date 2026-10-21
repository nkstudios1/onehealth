import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CircleNotch } from "@phosphor-icons/react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * Source: Figma "Button" (40px tall, radius 8, label 16px medium).
 *   default     = primary: brand gradient, white text
 *   secondary   = teal outline ("Add to contact")
 *   outline     = grey outline ("Change my phone number", back button)
 *   ghost       = no border, no fill
 *   destructive = danger fill
 * Hover (Figma): a black overlay. 40% over filled buttons, 10% over outlined.
 * Icon sizes are set on the icon itself: <ArrowRight size={16} />.
 *
 * Plain <button>: no Radix or Base UI dependency, so it works with any shadcn
 * style. For a link that looks like a button use:
 *   <Link className={cn(buttonVariants(), "w-full")}>...</Link>
 */
export const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-label",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "disabled:pointer-events-none disabled:opacity-50 data-[loading=true]:disabled:opacity-100",
    // The hover overlay is a pseudo-element, so it works on top of gradients
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0",
    "after:transition-opacity after:duration-150 hover:after:opacity-100 motion-reduce:after:transition-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "bg-(image:--gradient-brand) text-on-brand after:bg-scrim-40",
        secondary: "border border-brand-light bg-transparent text-ink after:bg-scrim-10",
        outline: "border border-line-subtle bg-transparent text-ink after:bg-scrim-10",
        ghost: "bg-transparent text-ink after:bg-scrim-10",
        destructive: "bg-danger text-on-brand after:bg-scrim-40",
      },
      size: {
        default: "h-10 px-2",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean
}

function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  type = "button", // safer default; forms must pass type="submit" explicitly
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      data-loading={loading}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? (
        <CircleNotch aria-hidden size={16} weight="bold" className="animate-spin motion-reduce:animate-none" />
      ) : null}
      {children}
    </button>
  )
}

export { Button }