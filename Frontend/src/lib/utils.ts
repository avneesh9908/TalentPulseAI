import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge has to be told about our custom scales, or it guesses.
 * Without this it read `text-small` as a colour and silently dropped
 * `text-accent-fg` from every button — dark text on a violet fill.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "h1", "h2", "h3", "h4", "lead", "body", "small", "overline"] },
      ],
      shadow: [{ shadow: ["e1", "e2", "e3", "e4"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
