import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Marketing section rhythm, borrowed from the reference teardown:
 * eyebrow → heading → one-or-two-line subhead. Repeated verbatim everywhere so
 * the page reads as one document instead of a stack of unrelated designs.
 */
type SectionProps = React.HTMLAttributes<HTMLElement> & {
  /** `muted` paints the recessed surface band. */
  tone?: "canvas" | "muted"
  tight?: boolean
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, tone = "canvas", tight = false, children, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        tight ? "section-tight" : "section",
        tone === "muted" && "border-y border-border bg-surface",
        className
      )}
      {...props}
    >
      <div className="wrap">{children}</div>
    </section>
  )
)
Section.displayName = "Section"

type SectionHeadingProps = {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: "left" | "center"
  className?: string
  as?: "h1" | "h2"
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && <p className="overline mb-3">{eyebrow}</p>}
      <Tag className={cn(Tag === "h1" ? "text-h1" : "text-h2", "text-balance font-semibold text-ink")}>
        {title}
      </Tag>
      {subtitle && <p className="mt-3 text-pretty text-lead text-ink-muted">{subtitle}</p>}
    </div>
  )
}

export { Section, SectionHeading }
