import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * The one container in the product. Every card, tile and boxed region is a
 * Panel — one border, one radius, one surface, three elevation levels.
 */
type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  /** `flat` sits on canvas, `raised` lifts off it, `muted` recedes into it. */
  tone?: "flat" | "raised" | "muted"
  /** Adds hover elevation + accent border. Use only when the whole panel is clickable. */
  interactive?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

const toneClass = {
  flat: "bg-canvas border-border",
  raised: "bg-canvas border-border shadow-e2",
  muted: "bg-surface border-border",
} as const

const padClass = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
} as const

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, tone = "flat", interactive = false, padding = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border",
        toneClass[tone],
        padClass[padding],
        interactive &&
          "transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-e3",
        className
      )}
      {...props}
    />
  )
)
Panel.displayName = "Panel"

const PanelHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4 flex items-start justify-between gap-4", className)} {...props} />
  )
)
PanelHeader.displayName = "PanelHeader"

const PanelTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-h4 font-semibold text-ink", className)} {...props} />
  )
)
PanelTitle.displayName = "PanelTitle"

const PanelDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-small text-ink-subtle", className)} {...props} />
  )
)
PanelDescription.displayName = "PanelDescription"

export { Panel, PanelHeader, PanelTitle, PanelDescription }
