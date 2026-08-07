import { cn } from "@/lib/utils"

/**
 * The one busy indicator. Drawn in SVG rather than a bordered box so the faint
 * track and the solid head can both be currentColor at different opacities —
 * Tailwind can't put an alpha on `currentColor`. Inheriting the colour means it
 * works on a filled button, a secondary one and a dark toast with no variant.
 */
type SpinnerProps = {
  size?: "sm" | "md"
  className?: string
  /** Announce to assistive tech. Omit when a sibling already says "Saving…". */
  label?: string
}

function Spinner({ size = "sm", className, label }: SpinnerProps) {
  return (
    <span
      role={label ? "status" : undefined}
      className={cn("inline-flex shrink-0", size === "sm" ? "size-3.5" : "size-5", className)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="size-full animate-spin motion-reduce:animate-none"
      >
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path
          d="M21.5 12A9.5 9.5 0 0 0 12 2.5"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </span>
  )
}

export { Spinner }
