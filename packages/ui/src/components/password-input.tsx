"use client"

import * as React from "react"
import { Eye, EyeSlash } from "@phosphor-icons/react"

import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

/**
 * Password field with a show/hide eye (Figma "Create password").
 * The toggle is a real button with aria-label + aria-pressed.
 * Works with react-hook-form: <PasswordInput {...register("password")} />
 */
function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = React.useState(false)
  const Icon = visible ? EyeSlash : Eye

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md text-ink-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <Icon aria-hidden size={16} />
      </button>
    </div>
  )
}

export { PasswordInput }