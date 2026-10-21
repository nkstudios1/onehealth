// components/brand/logo.tsx
import Image from "next/image"

import { cn } from "@workspace/ui/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/onehealth-logo.svg"
      alt="OneHealth"
      width={177}
      height={48}
      priority
      className={cn("h-12 w-auto", className)}
    />
  )
}