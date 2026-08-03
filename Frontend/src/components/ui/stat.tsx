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
  className?: string
}

function Stat({ label, value, hint, icon, className }: StatProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-canvas p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="overline">{label}</p>
        {icon && <span className="text-ink-subtle">{icon}</span>}
      </div>
      <p className="mt-2 text-h2 font-semibold tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-1 text-small text-ink-subtle">{hint}</p>}
    </div>
  )
}

export { Stat }
