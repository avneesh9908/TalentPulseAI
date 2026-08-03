import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Progress rail shared by the interview wizard and the job-search setup.
 * Purely presentational — the owning page decides which step is current.
 */
type Step = { id: string; label: string }

function Stepper({
  steps,
  current,
  className,
}: {
  steps: readonly Step[]
  current: number
  className?: string
}) {
  return (
    <ol className={cn("flex w-full items-center gap-2", className)} aria-label="Progress">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-overline font-semibold transition-colors",
                done && "border-accent bg-accent text-accent-fg",
                active && "border-accent bg-accent-soft text-accent-text",
                !done && !active && "border-border-strong bg-canvas text-ink-subtle"
              )}
            >
              {done ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "truncate text-small",
                active ? "font-medium text-ink" : "text-ink-subtle"
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn("hidden h-px flex-1 sm:block", done ? "bg-accent/50" : "bg-border")}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { Stepper }
