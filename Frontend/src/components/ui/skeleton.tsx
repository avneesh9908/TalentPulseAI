import { cn } from "@/lib/utils"

/**
 * Loading placeholder. The point of these, per the doc, is that they *reserve
 * the height* the real content will take — so nothing shifts when data lands.
 * Callers therefore always give a concrete size.
 *
 * The sweep is a 200%-wide gradient scrolled by the `shimmer` keyframe, which
 * `motion-reduce` freezes into a plain block.
 */
type SkeletonProps = {
  className?: string
  /** Pill for text-like runs, rect for tiles and numbers. */
  shape?: "pill" | "rect"
}

function Skeleton({ className, shape = "pill" }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block animate-shimmer bg-[length:200%_100%] motion-reduce:animate-none",
        "bg-gradient-to-r from-surface-strong via-surface to-surface-strong",
        shape === "pill" ? "rounded-full" : "rounded-sm",
        className
      )}
    />
  )
}

/**
 * A paragraph's worth of skeleton lines. Widths taper so it reads as prose
 * rather than a block, matching the doc's three-line example.
 */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  const widths = ["w-full", "w-[82%]", "w-[64%]", "w-[74%]", "w-[58%]"]
  return (
    <div className={cn("space-y-2.5", className)} role="status" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-2.5", widths[i % widths.length])} />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonText }
