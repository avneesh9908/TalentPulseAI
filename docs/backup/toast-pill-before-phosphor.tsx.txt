import type { ReactNode } from "react"
import toast, { type Toast } from "react-hot-toast"
import { X } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

/**
 * The visual half of the toast system — see `toast.tsx` for the `notify` API
 * callers actually use. Split out so each file exports one kind of thing and
 * fast refresh keeps working.
 *
 * Inverted surface: `ink` background with `ink-inverse` text, so it is a dark
 * slab in light mode and a light one in dark mode either way standing off the
 * page behind it.
 */
export type ToastKind = "success" | "error" | "pending"

const dotClass: Record<Exclude<ToastKind, "pending">, string> = {
  success: "bg-success",
  error: "bg-danger",
}

export function ToastPill({
  t,
  kind,
  message,
  action,
}: {
  t: Toast
  kind: ToastKind
  message: ReactNode
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-[19rem] max-w-[calc(100vw-2rem)] items-start gap-2.5",
        "rounded-lg bg-ink px-3.5 py-3 text-small text-ink-inverse shadow-e4",
        t.visible
          ? "animate-in fade-in slide-in-from-top-2"
          : "animate-out fade-out slide-out-to-top-2",
        "motion-reduce:animate-none"
      )}
    >
      {kind === "pending" ? (
        <Spinner className="mt-0.5" />
      ) : (
        <span aria-hidden="true" className={cn("mt-1 size-3 shrink-0 rounded-full", dotClass[kind])} />
      )}

      <div className="min-w-0 flex-1">
        {message}
        {action && (
          <>
            {" "}
            <button
              type="button"
              onClick={() => {
                action.onClick()
                toast.dismiss(t.id)
              }}
              className="rounded-sm font-medium underline underline-offset-2"
            >
              {action.label}
            </button>
          </>
        )}
      </div>

      {/* A pending toast has no dismiss: the work is still running, and hiding
          the indicator would suggest otherwise. */}
      {kind !== "pending" && (
        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          aria-label="Dismiss"
          className="-mr-1 shrink-0 rounded-sm opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
