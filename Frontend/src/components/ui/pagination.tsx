import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Table footer: "1–4 of 23" and Previous / Next.
 *
 * The range is computed here from page/size/total so a caller can't print a
 * range that disagrees with the rows on screen, and the last page's range is
 * clamped to the true total rather than page × size.
 */
type PaginationProps = {
  /** 1-based. */
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
  /** Noun for the range, e.g. "matches". Omitted by default to match the doc. */
  unit?: string
}

function Pagination({ page, pageSize, total, onPageChange, className, unit }: PaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), lastPage)
  const first = total === 0 ? 0 : (current - 1) * pageSize + 1
  const last = Math.min(current * pageSize, total)

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3",
        className
      )}
    >
      <p className="text-small tabular-nums text-ink-muted">
        {total === 0 ? "Nothing to show" : `${first}–${last} of ${total}`}
        {unit && total > 0 && ` ${unit}`}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={current >= lastPage}
          onClick={() => onPageChange(current + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export { Pagination }
