import { create } from "zustand"

import type { SessionUser } from "@/lib/api/types"

/**
 * Who is signed in. In memory only for now.
 * TODO (with the backend): the real session should live in an httpOnly cookie,
 * and the app should load the user from a "who am I" endpoint on startup.
 * Until then, a page refresh signs you out in mock mode.
 */
interface SessionState {
  user: SessionUser | null
  setUser: (user: SessionUser) => void
  clear: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}))