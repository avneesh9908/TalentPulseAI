/**
 * Job Search product page — the parallel of practice.tsx (the interview
 * product page). Same shell, same design language, job-side content.
 *
 * The status table below is clearly labelled as an example: it is the only
 * fabricated data left on the marketing site, and it is marked as such.
 *
 * UI: the phosphor-terminal design (2026-09-24) — restyle only; every word is
 * the page's own copy (docs/backup/find-jobs-before-phosphor.tsx.txt).
 */
import {
  ArrowRight, Sparkles, Briefcase, Building2, Radar, ListChecks,
  ShieldCheck, Clock, Layers, Mic, Target,
} from "lucide-react";
import PhosSiteHeader from "@/components/landing/phos-site-header";
import PhosSiteFooter from "@/components/landing/phos-site-footer";
import {
  CtaBanner, CtaLink, Eyebrow, FeatureCard, LimitPanel, PhosHero, PhosPage, PhosSection, SectionIntro, StepTrack, WindowFrame,
} from "@/components/landing/phos-marketing";
import { GlyphBand } from "@/components/phos";
import { PH_BODY, PH_BODY_SM, PH_LINK_MONO, PH_MONO, PH_MONO_RAW } from "@/components/phos/tokens";
import { Reveal } from "@/components/motion/reveal";
import tourDashboard from "@/assets/landing/tour-dashboard.svg";

const NAV_ITEMS = [
  { id: "how", label: "How it works", href: "#how" },
  { id: "features", label: "Features", href: "#features" },
  { id: "status", label: "Tracking", href: "#status" },
  { id: "practice", label: "Interview practice", href: "/practice" },
];

/** Top strip — every line is a fragment of a claim made further down the page. */
const TICKER = [
  "Straight from career pages",
  "Ranked against your resume",
  "Why it fits — and doesn't",
  "Nothing is submitted for you",
  "One status table",
  "Many roles, one resume",
  "Runs take up to two minutes",
  "Free while in beta",
];

const STEPS = [
  { icon: Sparkles, title: "Set your targets", desc: "We read your resume and suggest the roles you qualify for — edit them, or add a role you're switching into." },
  { icon: Radar, title: "The agent scans", desc: "It reads company career pages directly through their hiring APIs — the source, not a stale aggregator." },
  { icon: ListChecks, title: "You review and apply", desc: "Every match is ranked against your resume with the reasons why. Open the real application, and track the rest." },
];

/**
 * What one run actually hands back, per design doc 4b. The doc's third card
 * promised per-company progress and that you could leave the page; a run is a
 * single synchronous request, so both are corrected here. Its "closed" status is
 * also renamed to `dismissed`, which is the status the API really writes.
 */
const OUTCOMES = [
  {
    title: "A score you can argue with",
    desc: "Each match names the skills it matched and the ones it could not find.",
  },
  {
    title: "Status you control",
    desc: "Mark anything reviewed, applied or dismissed. Nothing changes on its own.",
  },
  {
    title: "Runs take up to two minutes",
    desc: "A run reports how many company boards it checked. Keep the page open while it works.",
  },
];

const FEATURES = [
  { icon: Layers, title: "Resume-ranked matching", desc: "Each opening is scored against your indexed experience, not against keyword overlap." },
  { icon: Building2, title: "Straight from career pages", desc: "Roles come from company job boards through their own APIs, so you see them first-hand." },
  { icon: ListChecks, title: "Why it fits — and doesn't", desc: "Matches carry the specific strengths and the gaps you would need to cover." },
  { icon: ShieldCheck, title: "Assisted, never reckless", desc: "Nothing is ever submitted on your behalf. The agent prepares; you press submit." },
  { icon: Briefcase, title: "One status table", desc: "New, reviewed, pending, applied, dismissed — the whole hunt in a single view." },
  { icon: Clock, title: "Many roles, one resume", desc: "Target backend and frontend at the same time and see matches for each side by side." },
];

/** Illustrative only — labelled in the UI so it can't be read as real traction. */
const EXAMPLE_ROWS = [
  { company: "Acme Corp", role: "Senior Python Developer", location: "Remote", match: 92, status: "Applied", tone: "success" as const },
  { company: "Northwind", role: "Backend Engineer", location: "Bengaluru", match: 87, status: "Pending", tone: "warning" as const, reason: "Login wall — finish this one manually" },
  { company: "Globex", role: "Full-stack Developer", location: "Hybrid · Pune", match: 81, status: "New", tone: "accent" as const },
];

/* Two colours only, so status is carried by weight and fill rather than hue. */
const STATUS_TONE = {
  success: "border-ph-green/50 bg-ph-green/10 text-ph-green",
  warning: "border-ph-ink/30 bg-ph-ink/[0.06] text-ph-ink",
  accent: "border-ph-line-bright bg-ph-surface text-ph-ink-muted",
} as const;

export default function FindJobsPage() {
  return (
    <PhosPage>
      <PhosSiteHeader navItems={NAV_ITEMS} activeId="jobs" tickerItems={TICKER} />

      <main className="relative w-full overflow-hidden">
        {/* ── Hero ── */}
        <PhosHero
          eyebrow="Job agent"
          title={
            <>
              It finds the openings.{" "}
              <span className="ph-glow text-ph-green">You decide what to send.</span>
            </>
          }
          lead="Give it your resume and the roles you want. It scans company boards and ranks what it finds against your actual experience, with the reason for every score."
          actions={
            <>
              <CtaLink href="/jobs" icon={Briefcase}>
                Run a search
              </CtaLink>
              <CtaLink href="/practice" variant="glass" icon={Mic}>
                Want to practise first?
              </CtaLink>
            </>
          }
          note="Free while in beta · Nothing is ever submitted without you"
        />

        {/* ── What a run gives you ── */}
        <PhosSection grid>
          <SectionIntro index="01" eyebrow="What a run gives you" title="Ranked matches with a stated reason." />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {OUTCOMES.map((item, i) => (
              <FeatureCard key={item.title} icon={[Target, ListChecks, Clock][i]} title={item.title} desc={item.desc} index={i} />
            ))}
          </div>

          {/* The two limits, on the page rather than discovered later. */}
          <Reveal className="mt-14 grid gap-6 lg:grid-cols-2">
            <LimitPanel icon={ShieldCheck} label="What it does not do">
              <p>
                The agent never submits an application, never contacts a company, and never sends
                your resume to an employer. It reads public listings and ranks them.
              </p>
            </LimitPanel>
            <LimitPanel icon={Radar} label="Coverage is partial">
              <p>
                It scans the company boards on your target list, not the whole market, and it
                reports how many it checked on every run.
              </p>
            </LimitPanel>
          </Reveal>
        </PhosSection>

        {/* ── How it works ── */}
        <PhosSection id="how">
          <SectionIntro index="02" eyebrow="How the agent works" title="Three steps to your first shortlist" />
          <StepTrack steps={STEPS} columns={3} />
        </PhosSection>

        <GlyphBand rows={2} />

        {/* ── Features ── */}
        <PhosSection id="features" grid>
          <SectionIntro index="03" eyebrow="Features" title="Built for real hunting" subtitle="Signal over noise on every run." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((item, i) => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} index={i} />
            ))}
          </div>
        </PhosSection>

        {/* ── Status tracking ── */}
        <PhosSection id="status">
          <SectionIntro
            index="04"
            eyebrow="Tracking"
            title="Every application, tracked"
            subtitle="When the agent can't finish an application safely, it says why and hands you the link."
          />

          <Reveal>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className={`${PH_MONO} rounded-full border border-ph-green/45 px-2.5 py-1 text-ph-green`}>
                Example
              </span>
              <span className={PH_BODY_SM}>Illustrative rows — your table is filled by your own resume.</span>
            </div>
            <div className="overflow-x-auto rounded-[16px] border border-ph-line-strong bg-ph-surface">
              <table className="w-full text-left text-[13px]">
                <thead className={`${PH_MONO} border-b border-ph-line text-ph-ink-soft`}>
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Company</th>
                    <th className="px-5 py-3.5 font-medium">Role</th>
                    <th className="hidden px-5 py-3.5 font-medium sm:table-cell">Location</th>
                    <th className="px-5 py-3.5 font-medium">Match</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ph-line">
                  {EXAMPLE_ROWS.map((row) => (
                    <tr key={row.company} className="align-top">
                      <td className="px-5 py-4 font-medium text-ph-ink">{row.company}</td>
                      <td className="px-5 py-4 text-ph-ink-muted">{row.role}</td>
                      <td className={`${PH_MONO_RAW} hidden px-5 py-4 text-ph-ink-soft sm:table-cell`}>{row.location}</td>
                      <td className="tnum px-5 py-4 font-st-display text-[16px] font-semibold text-ph-green">{row.match}%</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-ph-mono text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[row.tone]}`}
                        >
                          {row.status}
                        </span>
                        {row.reason && <p className={`${PH_MONO_RAW} mt-1.5 text-ph-ink-soft`}>{row.reason}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "No account bans", desc: "Nothing is submitted behind your back." },
              { icon: Clock, title: "Runs between visits", desc: "New matches are waiting the next time you open it." },
              { icon: Building2, title: "Straight from the source", desc: "Company hiring APIs, not scrapers." },
            ].map((item, i) => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} index={i} />
            ))}
          </div>
        </PhosSection>

        {/* ── Product view ── */}
        <PhosSection grid>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <Eyebrow>Inside the product</Eyebrow>
              <h2 className="mt-2 font-st-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.028em] text-ph-ink">
                One table for the whole hunt
              </h2>
              <p className={`${PH_BODY} mt-4 max-w-[52ch]`}>
                Filter by status, open the real application page, and mark what you have done. The agent keeps the list current.
              </p>
              <a href="/jobs" className={`${PH_LINK_MONO} mt-7`}>
                Open the job agent <ArrowRight size={14} />
              </a>
            </Reveal>
            <Reveal delay={0.08}>
              <WindowFrame src={tourDashboard} alt="The job matches table inside the product" caption="talentpulse.ai / jobs" />
            </Reveal>
          </div>
        </PhosSection>

        {/* ── CTA ── */}
        <CtaBanner
          title="Your next role is already posted"
          text="Point the agent at it — then rehearse that exact interview on the other side."
          actions={
            <>
              <CtaLink href="/jobs">Start job search</CtaLink>
              <CtaLink href="/practice" variant="glass">
                Practice an interview
              </CtaLink>
            </>
          }
        />
      </main>

      <PhosSiteFooter />
    </PhosPage>
  );
}
