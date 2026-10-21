/** "ISOKEN CLARA" -> "Isoken Clara" */
export function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\p{L}/gu, (char) => char.toUpperCase())
}

/** "Isoken Clara Oghenemaro" -> "IO" (first + last name initials) */
export function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
  return (first + last).toUpperCase()
}

/**
 * "1990-06-11" -> "Jun 11, 1990".
 * Parsed and formatted as UTC so the day never shifts by a timezone.
 */
export function formatDateOfBirth(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`))
}

/** 359 -> "5:59" */
export function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}