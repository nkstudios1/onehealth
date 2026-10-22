"use client"

// app/page.tsx
// The public front page: explains what OneHealth is before anyone signs up.
// It is a client component only because the shared Button file imports client-only icons.
// It has no state, and Next still renders the HTML on the server first, so it loads instantly.
import Link from "next/link"
import {
  Bell,
  Buildings,
  CheckCircle,
  DeviceMobile,
  HandPalm,
  LinkSimple,
  ListChecks,
  Lock,
  PhoneCall,
  QrCode,
  SealCheck,
  Stethoscope,
} from "@phosphor-icons/react/dist/ssr"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Logo } from "@/components/brand/logo"
import { HealthCard } from "@/components/card/health-card"
import { ROUTES } from "@/lib/routes"

/** A made-up card so visitors can see what the real one looks like. It belongs to nobody. */
const SAMPLE_CARD = {
  last4: "0000",
  status: "Activated",
  expiresAt: "2030-01-01",
  qrToken: "onehealth-sample-card",
}

const STEPS = [
  { Icon: QrCode, title: "Scan", text: "The hospital scans the QR code on your card." },
  { Icon: Bell, title: "Request", text: "You get a request on your phone, with the hospital's name." },
  { Icon: CheckCircle, title: "Approve", text: "You approve or deny. Nothing opens without you." },
  { Icon: Stethoscope, title: "Access", text: "The hospital sees only what you chose to share." },
]

const BACKUPS = [
  {
    Icon: DeviceMobile,
    title: "In the app",
    text: "A contact who has OneHealth sees the request and approves it in one tap.",
  },
  {
    Icon: LinkSimple,
    title: "By SMS link",
    text: "A contact without the app gets a text, sees which hospital is asking, and approves.",
  },
  {
    Icon: PhoneCall,
    title: "By code on a phone call",
    text: "A contact with a button phone reads a 6-digit code to the nurse. The hospital types it in.",
  },
]

const TRUST = [
  { Icon: Lock, title: "Private by default", text: "A new record is hidden until you decide to share it." },
  { Icon: HandPalm, title: "End access any time", text: "One tap closes a hospital's access, even in the middle of a visit." },
  { Icon: ListChecks, title: "Every access is logged", text: "You can always see which hospital looked, when, and who allowed it." },
  { Icon: SealCheck, title: "Verified hospitals only", text: "Only registered hospitals can send a request. Real calls come from numbers you can check." },
]

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("mx-auto w-full max-w-5xl px-4 py-12 sm:py-16", className)} {...props} />
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{children}</h2>
}

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-page text-ink">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <Logo className="h-10" />
        <nav className="flex items-center gap-2">
          <Link href={ROUTES.login} className={cn(buttonVariants({ variant: "ghost" }), "px-4")}>
            Log in
          </Link>
          <Link href={ROUTES.signup} className={cn(buttonVariants(), "px-4")}>
            Sign up
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <Section className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-5">
          <p className="text-caption font-medium text-ink-subtle uppercase">
            Patient-owned medical records for Nigeria
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Your medical essentials, in your hands.
          </h1>
          <p className="text-body-lg max-w-prose text-ink-subtle">
            OneHealth is a medical card you carry. It holds what a hospital needs first: blood
            group, genotype, allergies and medication. A hospital sees nothing until you approve.
            If you can&apos;t answer, the people you trust can.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.signup} className={cn(buttonVariants(), "px-6")}>
              Create my card
            </Link>
            <Link href={ROUTES.login} className={cn(buttonVariants({ variant: "outline" }), "px-6")}>
              Log in
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 lg:items-end">
          <HealthCard name="Your name here" personalId="0000000000" card={SAMPLE_CARD} />
          <p className="text-caption text-ink-subtle">A sample card. The QR on yours is unique to you.</p>
        </div>
      </Section>

      {/* Problem */}
      <Section>
        <div className="flex flex-col gap-6 rounded-lg bg-surface p-6 shadow-card sm:p-10 dark:border dark:border-line">
          <Heading>In an emergency, every minute counts.</Heading>
          <ul className="flex flex-wrap gap-3">
            {["Blood group?", "Allergies?", "Medication?"].map((q) => (
              <li key={q} className="rounded-full bg-brand-weak px-5 py-2 font-display text-title">
                {q}
              </li>
            ))}
          </ul>
          <p className="text-body-lg max-w-prose text-ink-subtle">
            Most people can&apos;t answer these. So the hospital runs tests to find out what you
            already know, and that is time you did not have. OneHealth puts those answers in a
            card you carry.
          </p>
        </div>
      </Section>

      {/* How it works */}
      <Section>
        <div className="flex flex-col gap-8">
          <Heading>How it works</Heading>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ Icon, title, text }, i) => (
              <li key={title} className="flex flex-col gap-3 rounded-lg bg-surface p-5 shadow-card dark:border dark:border-line">
                <span className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-(image:--gradient-brand) text-on-brand">
                    <Icon aria-hidden size={20} />
                  </span>
                  <span className="text-caption text-ink-subtle">Step {i + 1}</span>
                </span>
                <h3 className="text-title">{title}</h3>
                <p className="text-body text-ink-subtle">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Backup approval */}
      <Section>
        <div className="flex flex-col gap-3">
          <Heading>And if you can&apos;t answer?</Heading>
          <p className="text-body-lg max-w-prose text-ink-subtle">
            If you are unconscious or hurt, the emergency contacts you chose can approve for you.
            The first one to approve opens access, and it works on any phone.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {BACKUPS.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-3 rounded-lg bg-surface p-5 shadow-card dark:border dark:border-line">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-weak">
                <Icon aria-hidden size={20} />
              </span>
              <h3 className="text-title">{title}</h3>
              <p className="text-body text-ink-subtle">{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Trust */}
      <Section>
        <div className="flex flex-col gap-8">
          <Heading>Built to be trusted</Heading>
          <ul className="grid gap-4 sm:grid-cols-2">
            {TRUST.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-lg bg-surface p-5 shadow-card dark:border dark:border-line">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-weak">
                  <Icon aria-hidden size={20} />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-title">{title}</h3>
                  <p className="text-body text-ink-subtle">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Hospitals */}
      <Section>
        <div className="flex flex-col items-start gap-4 rounded-lg bg-(image:--gradient-brand) p-6 text-on-brand shadow-card sm:p-10">
          <span className="flex size-10 items-center justify-center rounded-full bg-scrim-40">
            <Buildings aria-hidden size={20} />
          </span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">For hospitals</h2>
          <p className="text-body-lg max-w-prose">
            Scan the card, send a request, see the patient&apos;s essentials the moment they
            approve, add your visit note, and check out. No paperwork and no waiting for tests.
          </p>
          <Link href={ROUTES.login} className={cn(buttonVariants({ variant: "outline" }), "bg-surface px-6 text-ink")}>
            Hospital sign in
          </Link>
        </div>
      </Section>

      <footer className="mx-auto w-full max-w-5xl px-4 py-8 text-center text-caption text-ink-subtle">
        OneHealth. Built for Hackaholics 7.0.
      </footer>
    </div>
  )
}
