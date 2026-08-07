import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * The single-line connection notices from the doc: "Offline — changes will send
 * when you reconnect", "Session expired — sign in to continue where you were".
 *
 * Deliberately quieter than Alert: one line, a dot, no title. It reports a
 * condition of the session rather than the outcome of something you just did.
 */
type StatusStripProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "neutral" | "warning" | "danger"
  action?: React.ReactNode
}

const toneClass = {
  neutral: "border-border bg-surface text-ink-muted",
  warning: "border-warning/25 bg-warning-soft text-ink-muted",
  danger: "border-danger/25 bg-danger-soft text-danger",
} as const

const dotClass = {
  neutral: "bg-ink-subtle",
  warning: "bg-warning",
  danger: "bg-danger",
} as const

function StatusStrip({ className, tone = "neutral", action, children, ...props }: StatusStripProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2.5 rounded-md border px-3 py-2 text-small",
        toneClass[tone],
        className
      )}
      {...props}
    >
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", dotClass[tone])} />
      <span className="min-w-0 flex-1">{children}</span>
      {action}
    </div>
  )
}

export { StatusStrip }
