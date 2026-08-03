import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * The top of every logged-in screen: what page am I on, what is it for, and
 * what is the one thing I can do here. Replaces the per-page hero blocks.
 */
type PageHeaderProps = {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="overline mb-2">{eyebrow}</p>}
        <h1 className="text-h1 font-semibold text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-body text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export { PageHeader }
