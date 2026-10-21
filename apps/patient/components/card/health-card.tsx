"use client"

import { QRCodeSVG } from "qrcode.react"

import type { HealthCard as HealthCardData } from "@/lib/api/access-types"

/** A QR must be dark on light for scanners to read it, in dark mode too, so these two are fixed. */
const QR_DARK = "#000000" // token-check: allow
const QR_LIGHT = "#FFFFFF" // token-check: allow

interface HealthCardProps {
  name: string
  personalId: string
  card: HealthCardData
}

/**
 * The card the patient carries. The QR holds `qrToken`, a random string the hospital's scanner
 * sends to the API. It is NOT the card number, and it can be replaced if the card is lost.
 */
export function HealthCard({ name, personalId, card }: HealthCardProps) {
  return (
    <section
      aria-label="Your OneHealth card"
      className="flex w-full max-w-100 flex-col gap-4 rounded-lg bg-(image:--gradient-brand) p-6 text-on-brand shadow-card"
    >
      <header className="flex items-center justify-between">
        <span className="text-title">OneHealth</span>
        <span className="rounded-full bg-scrim-40 px-3 py-1 text-caption capitalize">{card.status}</span>
      </header>

      <div className="flex items-center gap-4">
        <div className="rounded-md bg-surface p-2">
          <QRCodeSVG value={card.qrToken} size={112} level="M" fgColor={QR_DARK} bgColor={QR_LIGHT} />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-title">{name}</p>
          <p className="text-caption">ID {personalId}</p>
          <p className="text-caption">Card •••• {card.last4}</p>
          <p className="text-caption">Valid until {card.expiresAt}</p>
        </div>
      </div>

      <p className="text-caption">
        Show this card at any hospital. They scan it and you approve on your phone.
      </p>
    </section>
  )
}
