import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A read-only identifier with a Copy affordance — the doc's `tp_8fa31c` row.
 * Used for the public user id on the profile page.
 *
 * Falls back silently when the clipboard is unavailable (insecure origin, or
 * permission denied): the value stays selectable, which is the point of showing
 * it as monospace text rather than hiding it behind the button.
 */
function CopyField({
  value,
  label,
  className,
}: {
  value: string
  /** Announced by the button, e.g. "Copy user id". */
  label: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // No clipboard access — the value is still on screen and selectable.
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-canvas px-3 py-2",
        className
      )}
    >
      <span className="min-w-0 flex-1 truncate font-mono text-small text-ink">{value}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={label}
        className="shrink-0 rounded-sm text-small font-medium text-accent-text hover:underline"
      >
        {copied ? (
          <span className="inline-flex items-center gap-1">
            <Check size={13} strokeWidth={2.5} aria-hidden="true" />
            Copied
          </span>
        ) : (
          "Copy"
        )}
      </button>
    </div>
  )
}

export { CopyField }
