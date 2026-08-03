import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/** Status and metadata chips. Colour here always carries meaning. */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "border-border bg-surface text-ink-muted",
        accent: "border-accent/25 bg-accent-soft text-accent-text",
        success: "border-success/25 bg-success-soft text-success",
        warning: "border-warning/25 bg-warning-soft text-warning",
        danger: "border-danger/25 bg-danger-soft text-danger",
        outline: "border-border-strong bg-transparent text-ink-muted",
      },
      size: {
        sm: "px-2 py-0.5 text-overline uppercase",
        md: "px-2.5 py-1 text-small",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  }
)

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>

function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />
}

export { Badge }
