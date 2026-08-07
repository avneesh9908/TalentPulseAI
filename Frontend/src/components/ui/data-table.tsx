import * as React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

/**
 * Table shell for the job matches and interview history views.
 * Owns the horizontal-scroll container so a wide table never makes the page
 * itself scroll sideways.
 */
function TableWrap({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-canvas", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full min-w-[40rem] border-collapse text-left", className)} {...props} />
}

function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-border bg-surface px-4 py-3 text-overline font-semibold uppercase text-ink-subtle",
        className
      )}
      {...props}
    />
  )
}

/**
 * A sortable column header. `direction` is null when this column isn't the sort
 * key, so only one arrow is ever drawn — and aria-sort tells assistive tech what
 * that arrow means.
 */
function SortableTh({
  direction,
  onSort,
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  direction: "asc" | "desc" | null
  onSort: () => void
}) {
  return (
    <Th
      aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"}
      className={cn("p-0", className)}
      {...props}
    >
      <button
        type="button"
        onClick={onSort}
        className="flex w-full items-center gap-1.5 px-4 py-3 text-left uppercase transition-colors hover:text-ink"
      >
        {children}
        {direction === "asc" && <ArrowUp size={12} strokeWidth={2.5} aria-hidden="true" />}
        {direction === "desc" && <ArrowDown size={12} strokeWidth={2.5} aria-hidden="true" />}
      </button>
    </Th>
  )
}

function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-border px-4 py-3 align-middle text-body text-ink", className)} {...props} />
}

/**
 * Row states from the doc:
 *  - `selected` tints the row *and* marks it with an accent rail, so the state
 *    survives for a reader who can't distinguish the tint;
 *  - `busy` dims it and drops hover feedback while a request is in flight, and
 *    sets aria-busy so the change is announced rather than only faded.
 */
function Tr({
  className,
  selected = false,
  busy = false,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean; busy?: boolean }) {
  return (
    <tr
      aria-selected={selected || undefined}
      aria-busy={busy || undefined}
      className={cn(
        "transition-colors last:[&>td]:border-0",
        selected && "bg-accent-soft shadow-[inset_2px_0_0_rgb(var(--accent))]",
        !selected && !busy && "hover:bg-surface",
        busy && "opacity-60",
        className
      )}
      {...props}
    />
  )
}

/** The "Updating" cell that pairs with `<Tr busy>`. */
function TdBusy({ label = "Updating", className }: { label?: string; className?: string }) {
  return (
    <Td className={className}>
      <span className="inline-flex items-center gap-2 text-small text-ink-muted">
        <Spinner label={label} />
        {label}
      </span>
    </Td>
  )
}

export { TableWrap, Table, Th, SortableTh, Td, TdBusy, Tr }
