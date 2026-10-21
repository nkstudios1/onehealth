/**
 * The look shared by every text-like field: Input and NativeSelect.
 * One string, one place to restyle all fields. Source: Figma "FieldInput".
 *
 * - 1px border `line`, radius 8, fill `field`, 12px side padding
 * - Text 16px medium (text-input). 16px also stops iOS zooming on focus.
 * - py-2.75 (11px) + 1px border = the 12px padding Figma shows, so the field
 *   is about 43px tall like the design
 * - Focus: 2px `focus` outline, offset 2px
 * - Errors: set aria-invalid on the field; do not add red classes yourself
 */
export const fieldBase = [
  "min-h-10 w-full min-w-0 rounded-md border border-line bg-field px-3 py-2.75",
  "text-input text-ink placeholder:text-ink-weak",
  "transition-colors duration-150",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
  "aria-invalid:border-danger aria-invalid:outline-danger",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ")