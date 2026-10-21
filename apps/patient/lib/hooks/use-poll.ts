"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Calls `fn` now, then again every `everyMs`, until `enabled` is false or the screen closes.
 *
 * Why polling: the browser cannot be "told" by the server that something changed (that needs
 * websockets or push). So the screen simply asks again every few seconds.
 *
 * - `data`: the latest result (undefined until the first one arrives).
 * - `error`: the latest failure (cleared by the next success).
 * - `refresh()`: ask right now, e.g. after the user pressed a button.
 */
export function usePoll<T>(fn: () => Promise<T>, everyMs: number, enabled = true) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<unknown>(null)

  // Keep the newest `fn` without restarting the timer on every render.
  const fnRef = useRef(fn)
  useEffect(() => {
    fnRef.current = fn
  })

  const run = useCallback(async () => {
    try {
      setData(await fnRef.current())
      setError(null)
    } catch (e) {
      setError(e)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    void run()
    const id = setInterval(() => void run(), everyMs)
    return () => clearInterval(id)
  }, [enabled, everyMs, run])

  return { data, error, refresh: run }
}
