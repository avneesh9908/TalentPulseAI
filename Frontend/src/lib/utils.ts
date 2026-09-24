import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * Plain tailwind-merge. It used to be extended with our custom `text-*` scale
 * and `shadow-e*` ramp so it would not mistake `text-small` for a colour; both
 * scales were removed with the legacy token system (2026-09-24), and the
 * phosphor screens use arbitrary values (`text-[13px]`) instead.
 */
const twMerge = extendTailwindMerge({})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
