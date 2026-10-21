import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { fieldBase } from "@workspace/ui/lib/field-classes"

/**
 * Text input. All styling lives in `fieldBase`. To show an error, pass
 * aria-invalid={true}; do not add red classes yourself.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(fieldBase, className)}
      {...props}
    />
  )
}

export { Input }