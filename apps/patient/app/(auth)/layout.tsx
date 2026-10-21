/** Centres every auth screen on the pale mint page (Figma: 24px page margin on mobile). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-page px-6 py-10">
      {children}
    </main>
  )
}