import * as React from "react"
import { CaretDown } from "@phosphor-icons/react"

import { cn } from "@workspace/ui/lib/utils"
import { fieldBase } from "@workspace/ui/lib/field-classes"

/**
 * A real <select> styled like Input (Figma "Relationship" field). Native on
 * purpose: on a phone it opens the OS picker, which is the best experience for
 * a PWA, and it works with react-hook-form's register() with no glue code.
 * Same export names as shadcn's native-select, so `shadcn add` stays compatible.
 */
function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative w-full" data-slot="native-select-wrapper">
      <select
        data-slot="native-select"
        className={cn(
          fieldBase,
          "appearance-none pr-10",
          // The empty placeholder option shows in the placeholder colour
          "[&:has(option[value='']:checked)]:text-ink-weak [&>option]:text-ink",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <CaretDown
        aria-hidden
        size={20}
        className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-ink"
      />
    </div>
  )
}

function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup(props: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-optgroup" {...props} />
}

export { NativeSelect, NativeSelectOption, NativeSelectOptGroup }