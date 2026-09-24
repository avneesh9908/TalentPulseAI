/**
 * Public site footer on the phosphor-terminal design (2026-09-24).
 *
 * Same three columns, links and copy as the retired `stitch-site-footer.tsx` — skin only.
 * The privacy line keeps its own wording; it is a real product behaviour, not a
 * decorative badge.
 */
import { PH_BODY_SM, PH_MONO, PH_MONO_RAW } from "@/components/phos/tokens";

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

export default function PhosSiteFooter() {
  return (
    <footer className="relative border-t border-ph-line bg-black font-st-body">
      <div className="ph-wrap py-14">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <a href="/" aria-label="TalentPulseAI home" className="mb-5 flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ph-green shadow-[0_0_10px_#00ff41]" />
              <span className="font-st-display text-[17px] font-semibold text-ph-ink">
                talentpulse<span className="text-ph-green">.ai</span>
              </span>
            </a>
            <p className={`${PH_BODY_SM} mb-5 max-w-sm`}>
              Rehearse the interview with questions built from your own resume, then let an
              agent surface the roles worth applying to.
            </p>
            <div className="flex max-w-sm items-start gap-2.5 rounded-[12px] border border-ph-line bg-ph-surface px-3.5 py-3">
              <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-ph-green" />
              <span className={`${PH_MONO_RAW} leading-[1.6] text-ph-ink-muted`}>
                Your resume is stripped of personal details before it is indexed.
              </span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className={`${PH_MONO} mb-5 text-ph-green`}>{col.title}</h2>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className={`${PH_BODY_SM} transition-colors hover:text-ph-ink`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-ph-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className={`${PH_MONO_RAW} text-ph-ink-soft`}>
            © {new Date().getFullYear()} TalentPulseAI. All rights reserved.
          </p>
          <p className={`${PH_MONO} text-ph-ink-soft`}>
            <span className="text-ph-green">●</span> Free while in beta
          </p>
        </div>
      </div>
    </footer>
  );
}
