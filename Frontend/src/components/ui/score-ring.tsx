import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * The out-of-100 score dial from the doc: a conic-gradient ring with the number
 * punched out of the middle. Drawn with the CSS custom properties directly
 * because a conic-gradient can't be expressed as Tailwind utilities.
 *
 * The band word and advice line are the caller's — this component never invents
 * a verdict, since the wording has to match whatever the scorer actually said.
 */
type Tone = "accent" | "success" | "warning" | "danger"

const arcVar: Record<Tone, string> = {
  accent: "--accent",
  success: "--success",
  warning: "--warning",
  danger: "--danger",
}

const sizeClass = {
  sm: { ring: "size-10", hole: "size-[31px]", text: "text-small" },
  md: { ring: "size-14", hole: "size-[42px]", text: "text-h4" },
  lg: { ring: "size-16", hole: "size-12", text: "text-h4" },
  /** The result page's headline dial — ring thickness stays ~10px as it scales. */
  xl: { ring: "size-28", hole: "size-[92px]", text: "text-h2" },
} as const

type ScoreRingProps = {
  /** 0–100. Clamped so an out-of-range score can't wrap the arc. */
  value: number
  size?: keyof typeof sizeClass
  tone?: Tone
  /** Reader-facing description, e.g. "Overall score 72 out of 100". */
  label?: string
  className?: string
}

function ScoreRing({ value, size = "md", tone = "accent", label, className }: ScoreRingProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const s = sizeClass[size]
  return (
    <div
      role="img"
      aria-label={label ?? `Score ${pct} out of 100`}
      className={cn("relative flex shrink-0 items-center justify-center rounded-full", s.ring, className)}
      style={{
        background: `conic-gradient(rgb(var(${arcVar[tone]})) 0 ${pct}%, rgb(var(--surface-strong)) ${pct}% 100%)`,
      }}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-canvas font-semibold tabular-nums text-ink",
          s.hole,
          s.text
        )}
      >
        {pct}
      </span>
    </div>
  )
}

/** Ring + band word + one line of advice, as the doc pairs them. */
function ScoreSummary({
  value,
  band,
  note,
  tone,
  className,
}: {
  value: number
  band: string
  note?: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <ScoreRing value={value} tone={tone} label={`${band} — ${value} out of 100`} />
      <div className="min-w-0">
        <p className="text-small font-semibold text-ink">{band}</p>
        {note && <p className="mt-0.5 text-small text-ink-muted">{note}</p>}
      </div>
    </div>
  )
}

export { ScoreRing, ScoreSummary }
