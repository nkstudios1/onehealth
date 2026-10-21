import type { Metadata, Viewport } from "next"
import { Inter, M_PLUS_Rounded_1c } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ServiceWorkerRegister } from "@/components/service-worker-register"

/**
 * Fonts (Figma): Inter for everything, Rounded Mplus 1c for titles and the
 * logo wordmark. Each app loads them itself (next/font must run inside the
 * app). The `variable` names must match globals.css (--font-inter, --font-rounded).
 * apps/portal needs these exact same lines.
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const rounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "800"], // 800 = the ExtraBold used for screen titles
  variable: "--font-rounded",
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "OneHealth", template: "%s | OneHealth" },
  description: "Your health record, always ready, always yours.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5FCFA" }, // token-check: allow
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" }, // token-check: allow
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: next-themes sets the `dark` class before React loads
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${rounded.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}