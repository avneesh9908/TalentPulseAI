import { cn } from "@/lib/utils"

/**
 * Determinate progress with the label the doc pairs it with
 * ("Indexing your resume · 38%"). The number is tabular so the line doesn't
 * jitter as it counts up.
 *
 * Indeterminate work uses Spinner instead — a bar that can't report a fraction
 * is worse than no bar.
 */
type ProgressProps = {
  /** 0–100. Clamped, so a bad server number can't overflow the track. */
  value: number
  label?: string
  className?: string
}

function Progress({ value, label, className }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-1.5 overflow-hidden rounded-full bg-surface-strong"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      {label && (
        <p className="text-small tabular-nums text-ink-muted">
          {label} · {pct}%
        </p>
      )}
    </div>
  )
}

export { Progress }
