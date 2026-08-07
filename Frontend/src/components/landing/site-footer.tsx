/**
 * Public site footer — shared by the parent landing page and both product
 * pages. Product column links to the two sides so either page can reach the
 * other.
 */
import { Logo } from "@/components/brand/logo";

/*
 * Three link columns beside the brand, matching the Stitch reference's footer
 * band. Its Resources and Company columns (blog, guides, careers, contact) are
 * left out — none of those pages exist, and a dead link is worse than a column
 * fewer.
 */
const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Interview practice", href: "/practice" },
      { label: "Job search agent", href: "/find-jobs" },
      { label: "Try the demo", href: "/demo" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Create an account", href: "/auth/register" },
      { label: "Log in", href: "/auth/login" },
      { label: "Upload a resume", href: "/interview/select-role" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Your profile", href: "/profile" },
      { label: "Matching jobs", href: "/jobs" },
    ],
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-strong">
      <div className="wrap py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="/" aria-label="TalentPulseAI home">
              <Logo />
            </a>
            <p className="mt-4 max-w-xs text-small text-ink-subtle">
              Rehearse the interview with questions built from your own resume, then let an
              agent surface the roles worth applying to.
            </p>
            <p className="mt-4 text-small text-ink-subtle">
              © {new Date().getFullYear()} TalentPulseAI. All rights reserved.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="overline mb-3">{col.title}</h2>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-small text-ink-muted transition-colors hover:text-accent-text"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6 text-small text-ink-subtle">
          <p>Your resume is stripped of personal details before it is indexed.</p>
        </div>
      </div>
    </footer>
  );
}
