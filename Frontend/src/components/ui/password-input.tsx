import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Password field with the two affordances the doc draws: a Show/Hide toggle and
 * the "Caps lock is on" hint.
 *
 * The caps-lock state comes from KeyboardEvent.getModifierState, which is only
 * readable while the field has focus — so the hint appears on the first keypress
 * rather than on mount, and clears on blur so it can't go stale.
 */
type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  invalid?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, invalid, onKeyUp, onKeyDown, onBlur, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const [capsLock, setCapsLock] = React.useState(false)

    const readCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (typeof e.getModifierState === "function") {
        setCapsLock(e.getModifierState("CapsLock"))
      }
    }

    return (
      <div className="space-y-1.5">
        <div
          className={cn(
            "flex h-10 items-center rounded-md border bg-canvas pl-3 pr-1 transition-colors",
            "focus-within:border-accent",
            invalid ? "border-danger" : "border-border-strong",
            className
          )}
        >
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            aria-invalid={invalid || undefined}
            onKeyDown={(e) => {
              readCaps(e)
              onKeyDown?.(e)
            }}
            onKeyUp={(e) => {
              readCaps(e)
              onKeyUp?.(e)
            }}
            onBlur={(e) => {
              setCapsLock(false)
              onBlur?.(e)
            }}
            className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-subtle disabled:cursor-not-allowed disabled:opacity-60"
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            className="shrink-0 rounded-sm px-2 py-1 text-small font-medium text-ink-muted hover:text-ink"
          >
            {visible ? "Hide" : "Show"}
          </button>
        </div>
        {capsLock && (
          <p role="status" className="rounded-sm bg-warning-soft px-2.5 py-1.5 text-small text-warning">
            Caps lock is on
          </p>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
