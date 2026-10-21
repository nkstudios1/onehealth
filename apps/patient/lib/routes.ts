// lib/routes.ts
/** Every URL in the app. Never write a path string inside a component. */
export const ROUTES = {
  home: "/home", // not built yet
  login: "/login", // not built yet
  signup: "/signup",
  signupConfirm: "/signup/confirm",
  signupVerify: "/signup/verify",
  signupEmergencyContact: "/signup/emergency-contact",
  signupPassword: "/signup/password",
  signupSuccess: "/signup/success",
  signupError: "/signup/error",
    resetPassword: "/reset-password", // not built yet
      resetPasswordVerify: "/reset-password/verify",
  resetPasswordNew: "/reset-password/new",
} as const

/** Pages with a changing part in the URL are functions, so a typo is a compile error. */
export const hospitalRoutes = {
  scan: "/hospital/scan",
  request: (id: string) => `/hospital/request/${id}`,
  session: (id: string) => `/hospital/session/${id}`,
} as const
