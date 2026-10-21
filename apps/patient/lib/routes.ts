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