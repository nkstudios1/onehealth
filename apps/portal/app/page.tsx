export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <section className="w-full max-w-lg space-y-3 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          OneHealth Hospital Portal
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Hospital portal setup</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          The staff portal is being prepared. Hospital staff workflows and secure record
          management will be added here.
        </p>
      </section>
    </main>
  )
}
