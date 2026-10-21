/**
 * Inline text links. Figma gives them teal gradient text:
 * medium weight for legal links, bold for "Log in" / "Health Provider".
 * Usage: <Link href="/login" className={textLinkBoldClass}>Log in</Link>
 *
 * Note: gradient text has weak contrast at its light end (see Known issues).
 * To switch to a solid colour, replace `text-gradient-brand` with `text-brand`.
 */
const base =
  "text-gradient-brand rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"

export const textLinkClass = `${base} font-medium`
export const textLinkBoldClass = `${base} font-bold`