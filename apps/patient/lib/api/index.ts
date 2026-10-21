// lib/api/index.ts
import { env } from "@/lib/env"
import { httpAuthApi } from "./auth.http"
import { mockAuthApi } from "./auth.mock"
import type { AuthApi } from "./types"

/** The one switch between fake and real. Screens import `authApi` from here. */
export const authApi: AuthApi = env.useMocks ? mockAuthApi : httpAuthApi

export { ApiError, getErrorMessage } from "./errors"