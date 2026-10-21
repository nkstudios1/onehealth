// lib/hooks/use-countdown.ts
"use client"

import { useEffect, useState } from "react"

/**
 * Seconds remaining until `deadline` (epoch ms). Returns 0 when there is no
 * deadline or it has passed. Computed from the clock each second, so it does
 * not drift and survives navigating away and back.
 */
export function useCountdown(deadline: number | null) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (deadline === null) return
    setNow(Date.now()) // refresh immediately when the deadline changes
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [deadline])

  if (deadline === null) return 0
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}