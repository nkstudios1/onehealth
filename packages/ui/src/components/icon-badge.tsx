"use client"

import { SealCheck, WarningCircle, type Icon } from "@phosphor-icons/react"

import { cn } from "@workspace/ui/lib/utils"

type IconBadgeProps =
  | { tone?: "brand"; icon: Icon; className?: string }
  | { tone: "success" | "error"; icon?: never; className?: string }

/**
 * The round illustration at the top of each sign-up screen (Figma: 80px
 * circle with 8px padding around the icon).
 *   brand   = pale teal circle + any Phosphor icon (64px)
 *   success = seal with a check (92px)
 *   error   = red warning circle on pale pink (92px)
 * Purely decorative (aria-hidden): the screen title carries the meaning.
 */
export function IconBadge(props: IconBadgeProps) {
  const { className } = props
  const shell = "grid place-items-center rounded-full p-2"

  if (props.tone === "success") {
    return (
      <div aria-hidden className={cn(shell, "bg-brand-weak", className)}>
        <SealCheck size={92} weight="fill" className="text-brand" />
      </div>
    )
  }

  if (props.tone === "error") {
    return (
      <div aria-hidden className={cn(shell, "bg-danger-weak", className)}>
        <WarningCircle size={92} weight="fill" className="text-danger" />
      </div>
    )
  }

  const Glyph = props.icon
  if (!Glyph) return null // TypeScript cannot narrow the union above; "brand" always has an icon
  return (
    <div aria-hidden className={cn(shell, "bg-brand-weak", className)}>
      <Glyph size={64} weight="regular" className="text-brand" />
    </div>
  )
}