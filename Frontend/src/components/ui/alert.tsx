import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * The inline message block: soft tinted panel, a colour rail down the left edge,
 * a title and a body. Used for "the server is waking up", "resume parsed",
 * "speech recognition isn't available", "couldn't load your interviews".
 *
 * The rail carries the tone redundantly with the tint so the meaning doesn't
 * rest on background colour alone.
 */
const alertVariants = cva("flex gap-3 rounded-md border p-3.5", {
  variants: {
    tone: {
      info: "border-accent/25 bg-accent-soft",
      success: "border-success/25 bg-success-soft",
      warning: "border-warning/25 bg-warning-soft",
      danger: "border-danger/25 bg-danger-soft",
    },
  },
  defaultVariants: { tone: "info" },
})

const railClass = {
  info: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
} as const

const titleClass = {
  info: "text-accent-text",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    title?: React.ReactNode
    /** Rendered under the body — a Retry button, usually. */
    action?: React.ReactNode
    icon?: React.ReactNode
  }

function Alert({ className, tone = "info", title, action, icon, children, ...props }: AlertProps) {
  const key = tone ?? "info"
  return (
    <div
      // A danger alert interrupts; the rest are announced when convenient.
      role={key === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      <span aria-hidden="true" className={cn("w-1.5 shrink-0 self-stretch rounded-full", railClass[key])} />
      <div className="min-w-0 flex-1 space-y-1.5">
        {title && <p className={cn("text-small font-semibold", titleClass[key])}>{title}</p>}
        {/* Body stays neutral ink. The doc tints it too, but a tinted body at
            small size lands under 4.5:1 on the warning tint — the rail and title
            already carry the tone. */}
        {children && <div className="text-small text-ink-muted">{children}</div>}
        {action && <div className="pt-1">{action}</div>}
      </div>
      {icon && <span className={cn("shrink-0", titleClass[key])}>{icon}</span>}
    </div>
  )
}

export { Alert }
