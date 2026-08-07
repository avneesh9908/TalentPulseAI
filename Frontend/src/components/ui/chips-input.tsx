import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The skills field from the doc: chips inside the input box, "12 max" beside the
 * label, an × on each chip, and a bare text input that commits on Enter.
 *
 * Also the shape the job-search setup needs for target designations, so the
 * `max` and duplicate handling live here rather than in each page.
 */
type ChipsInputProps = {
  values: readonly string[]
  onChange: (values: string[]) => void
  /** Refuses to add past this count and hides the input when full. */
  max?: number
  placeholder?: string
  id?: string
  invalid?: boolean
  className?: string
  /** Names the group for screen readers, e.g. "Selected skills". */
  label: string
}

function ChipsInput({
  values,
  onChange,
  max,
  placeholder = "Add a skill",
  id,
  invalid,
  className,
  label,
}: ChipsInputProps) {
  const [draft, setDraft] = React.useState("")
  const full = max !== undefined && values.length >= max

  const add = (raw: string) => {
    const next = raw.trim()
    if (!next || full) return
    // Case-insensitive dedupe: "React" and "react" are the same skill.
    if (values.some((v) => v.toLowerCase() === next.toLowerCase())) {
      setDraft("")
      return
    }
    onChange([...values, next])
    setDraft("")
  }

  const remove = (value: string) => onChange(values.filter((v) => v !== value))

  return (
    <div
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-canvas p-2",
        "focus-within:border-accent",
        invalid ? "border-danger" : "border-border-strong",
        className
      )}
    >
      <ul aria-label={label} className="contents">
        {values.map((value) => (
          <li key={value}>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-surface-strong px-2 py-1 text-small font-medium text-ink">
              {value}
              <button
                type="button"
                onClick={() => remove(value)}
                aria-label={`Remove ${value}`}
                className="rounded-sm text-ink-subtle hover:text-ink"
              >
                <X size={12} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </span>
          </li>
        ))}
      </ul>
      {!full && (
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => add(draft)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              // Enter here means "commit this chip", not "submit the form".
              e.preventDefault()
              add(draft)
            } else if (e.key === "Backspace" && !draft && values.length) {
              onChange(values.slice(0, -1))
            }
          }}
          placeholder={placeholder}
          className="min-w-24 flex-1 bg-transparent px-1 py-1 text-body text-ink outline-none placeholder:text-ink-subtle"
        />
      )}
    </div>
  )
}

export { ChipsInput }
