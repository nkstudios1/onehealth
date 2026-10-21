"use client"

import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp"

import { cn } from "@workspace/ui/lib/utils"

interface OtpFieldProps {
  /** Number of digit boxes. The design uses 4. */
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  autoFocus?: boolean
  className?: string
  "aria-label"?: string
}

/**
 * Verification code boxes. Source: Figma "OTP" (40 x 56 boxes, 16px gap,
 * radius 8, digits 20px, "-" placeholder).
 *
 * One real (invisible) <input> receives typing, paste and SMS autofill
 * (autoComplete="one-time-code"); the boxes are only drawn from its state.
 * That is why the boxes are aria-hidden and the input carries the label.
 */
export function OtpField({
  length = 4,
  value,
  onChange,
  disabled,
  invalid,
  autoFocus,
  className,
  "aria-label": ariaLabel = "Verification code",
}: OtpFieldProps) {
  return (
    <OTPInput
      maxLength={length}
      value={value}
      onChange={onChange}
      disabled={disabled}
      pattern={REGEXP_ONLY_DIGITS}
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      containerClassName={cn("flex items-center justify-center gap-4", className)}
      render={({ slots }) => (
        <>
          {slots.map((slot, index) => (
            <div
              key={index}
              aria-hidden
              data-active={slot.isActive ? "true" : undefined}
              data-invalid={invalid ? "true" : undefined}
              className="relative flex h-14 w-10 items-center justify-center rounded-md border border-line bg-field text-otp text-ink data-[active=true]:outline-2 data-[active=true]:outline-focus data-[invalid=true]:border-danger"
            >
              {slot.char ?? (slot.hasFakeCaret ? null : <span className="text-ink-weak">-</span>)}
              {slot.hasFakeCaret ? (
                <span className="absolute h-6 w-px animate-pulse bg-ink motion-reduce:animate-none" />
              ) : null}
            </div>
          ))}
        </>
      )}
    />
  )
}