import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * Teaches tailwind-merge our custom font-size names (see globals.css), so
 * cn("text-sm", "text-caption") correctly keeps only text-caption.
 * If you add a --text-* token, add its name here too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["heading", "title", "body", "body-lg", "label", "entry", "caption", "otp", "micro"] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}