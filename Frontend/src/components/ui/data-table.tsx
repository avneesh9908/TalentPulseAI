import * as React from "react"
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

function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-border px-4 py-3 align-middle text-body text-ink", className)} {...props} />
}

function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors last:[&>td]:border-0 hover:bg-surface", className)} {...props} />
}

export { TableWrap, Table, Th, Td, Tr }
