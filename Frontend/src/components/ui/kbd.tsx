import * as React from "react"
import { cn } from "@/lib/utils"

/** A keycap. The thicker bottom border is what makes it read as physical. */
function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-sm border border-b-2 border-border-strong",
        "bg-surface px-1.5 py-0.5 font-mono text-overline font-medium tracking-normal text-ink",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
