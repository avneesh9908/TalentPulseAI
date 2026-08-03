import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Every "nothing here" and "couldn't load" moment in the product.
 * Keeping one component makes it hard to accidentally assert emptiness on a
 * failed fetch — callers pass the message that is actually true.
 */
type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  tone?: "neutral" | "danger"
  className?: string
}

function EmptyState({ icon, title, description, action, tone = "neutral", className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed px-6 py-10 text-center",
        tone === "danger" ? "border-danger/40 bg-danger-soft" : "border-border-strong bg-surface",
        className
      )}
    >
      {icon && (
        <span
          className={cn(
            "mb-3 flex h-10 w-10 items-center justify-center rounded-full",
            tone === "danger" ? "bg-danger/10 text-danger" : "bg-canvas text-ink-subtle"
          )}
        >
          {icon}
        </span>
      )}
      <p className={cn("text-h4 font-semibold", tone === "danger" ? "text-danger" : "text-ink")}>{title}</p>
      {description && <p className="mt-1.5 max-w-md text-small text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export { EmptyState }
