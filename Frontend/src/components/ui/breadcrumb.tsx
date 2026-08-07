import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

/**
 * "Interviews / Set up". The last crumb is the current page: it is plain text
 * with aria-current, never a link back to where you already are.
 */
export type Crumb = { label: string; to?: string }

function Breadcrumb({ items, className }: { items: readonly Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-small text-ink-muted", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.to && !last ? (
                <Link to={item.to} className="rounded-sm hover:text-ink hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "font-medium text-ink" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-border-strong">
                  /
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { Breadcrumb }
