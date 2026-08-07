import type { ReactNode } from "react"
import toast, { type ToastOptions } from "react-hot-toast"
import { ToastPill, type ToastKind } from "@/components/ui/toast-pill"

/**
 * Toasts, in the doc's inverted-pill form: a status dot, the message, an
 * optional action and a dismiss ×.
 *
 * A toast reports the outcome of something the user just did. A standing
 * condition of the session belongs in StatusStrip, and the reason a fetch failed
 * belongs in an Alert beside the thing that failed — a message that disappears
 * on a timer is the wrong home for anything the reader may need twice.
 */
type NotifyOptions = ToastOptions & {
  action?: { label: string; onClick: () => void }
}

const make =
  (kind: ToastKind) =>
  (message: ReactNode, { action, ...options }: NotifyOptions = {}) =>
    toast.custom((t) => <ToastPill t={t} kind={kind} message={message} action={action} />, {
      // A spinner that timed out would claim the work had finished.
      duration: kind === "pending" ? Infinity : undefined,
      ...options,
    })

/** `notify.pending` returns its id — pass it to `notify.dismiss` when the work ends. */
export const notify = {
  success: make("success"),
  error: make("error"),
  pending: make("pending"),
  dismiss: (id?: string) => toast.dismiss(id),
}
