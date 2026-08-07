import { cn } from "@/lib/utils"

/**
 * Underline tabs (Overview · Interviews · Resumes). The indicator is an inset
 * box-shadow rather than a border so switching tabs doesn't move the label by a
 * pixel, and the row scrolls rather than wraps on a narrow screen.
 *
 * These are in-page view switches. Navigating between *sections* of the product
 * is AppNav's job.
 */
export type Tab = { id: string; label: string; count?: number }

type TabNavProps = {
  tabs: readonly Tab[]
  current: string
  onChange: (id: string) => void
  className?: string
  /** Names the tab set for screen readers, e.g. "Profile views". */
  label: string
}

function TabNav({ tabs, current, onChange, className, label }: TabNavProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "flex gap-5 overflow-x-auto border-b border-border",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === current
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "-mb-px shrink-0 whitespace-nowrap pb-2.5 text-small font-medium transition-colors",
              active
                ? "text-ink shadow-[inset_0_-2px_0_rgb(var(--accent))]"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 tabular-nums text-ink-subtle">{tab.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { TabNav }
