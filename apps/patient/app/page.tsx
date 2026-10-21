// app/page.tsx
import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/routes"

export default function Page() {
  redirect(ROUTES.signup)
}