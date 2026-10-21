// lib/api/errors.ts
export type ApiErrorCode =
  | "NETWORK" | "UNKNOWN"
  | "NIN_NOT_FOUND" | "PHONE_ALREADY_REGISTERED"
  | "OTP_INVALID" | "OTP_EXPIRED"
  | "REGISTRATION_NOT_FOUND" | "REGISTRATION_FAILED"
  // already in the login / reset guides:
  | "INVALID_CREDENTIALS" | "RESET_NOT_FOUND"
  // NEW with this backend:
  | "NIN_ALREADY_REGISTERED" | "NIN_SERVICE_UNAVAILABLE"
  | "REGISTRATION_STEP_INVALID" | "OTP_DELIVERY_FAILED"
  | "ACCOUNT_SUSPENDED" | "TOO_MANY_ATTEMPTS" | "REQUEST_FORGERY"
  | "VALIDATION_FAILED" | "UNAUTHENTICATED" | "SERVER_ERROR"
  
/** Every failure from the API layer is an ApiError, so screens handle one type. */
export class ApiError extends Error {
  code: ApiErrorCode
  status?: number

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.status = status
  }
}

export function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again."
}