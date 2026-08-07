import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * One number with its label. Used for the profile strip, dashboard tiles and
 * marketing proof rows so a metric looks identical everywhere it appears.
 */
type StatProps = {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ReactNode
  /**
   * Change since the last period, e.g. "+3 this month". Toned rather than
   * inferred from a leading "+", because for some metrics down is the good news.
   */
  delta?: React.ReactNode
  deltaTone?: "success" | "danger" | "neutral"
  className?: string
}

const deltaClass = {
  success: "text-success",
  danger: "text-danger",
  neutral: "text-ink-subtle",
} as const

function Stat({ label, value, hint, icon, delta, deltaTone = "neutral", className }: StatProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-canvas p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="overline">{label}</p>
        {icon && <span className="text-ink-subtle">{icon}</span>}
      </div>
      <p className="mt-2 text-h2 font-semibold tabular-nums text-ink">{value}</p>
      {delta && <p className={cn("mt-1 text-small", deltaClass[deltaTone])}>{delta}</p>}
      {hint && <p className="mt-1 text-small text-ink-subtle">{hint}</p>}
    </div>
  )
}

export { Stat }
