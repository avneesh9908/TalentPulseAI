/**
 * Public site footer — shared by the parent landing page and both product
 * pages. Product column links to the two sides so either page can reach the
 * other.
 */
import { Logo } from "@/components/brand/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Interview practice", href: "/practice" },
      { label: "Job search agent", href: "/find-jobs" },
      { label: "Try the demo", href: "/demo" },
      { label: "Create an account", href: "/auth/register" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Log in", href: "/auth/login" },
      { label: "Upload a resume", href: "/interview/select-role" },
      { label: "Find matching jobs", href: "/jobs" },
    ],
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="wrap py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="/" aria-label="TalentPulseAI home">
              <Logo />
            </a>
            <p className="mt-3 max-w-xs text-small text-ink-subtle">
              Rehearse the interview with questions built from your own resume, then let an
              agent surface the roles worth applying to.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="overline mb-3">{col.title}</h2>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-small text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-small text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TalentPulseAI</p>
          <p>Your resume is stripped of personal details before it is indexed.</p>
        </div>
      </div>
    </footer>
  );
}
