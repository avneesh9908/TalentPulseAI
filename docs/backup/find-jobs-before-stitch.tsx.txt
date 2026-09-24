/**
 * Job Search product page — the parallel of practice.tsx (the interview
 * product page). Same shell, same design language, job-side content.
 *
 * The status table below is clearly labelled as an example: it is the only
 * fabricated data left on the marketing site, and it is marked as such.
 */
import {
  ArrowRight, Sparkles, Briefcase, Building2, Radar, ListChecks,
  ShieldCheck, Clock, Layers,
} from "lucide-react";
import SiteHeader from "@/components/landing/site-header";
import SiteFooter from "@/components/landing/site-footer";
import { ProductFrame } from "@/components/landing/product-frame";
import { ProductStack } from "@/components/landing/product-stack";
import { JOBS_PLANES } from "@/components/landing/product-planes";
import { Section, SectionHeading } from "@/components/ui/section";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableWrap, Table, Th, Td, Tr } from "@/components/ui/data-table";
import { Reveal } from "@/components/motion/reveal";
import tourDashboard from "@/assets/landing/tour-dashboard.svg";

const NAV_ITEMS = [
  { id: "how", label: "How it works", href: "#how" },
  { id: "features", label: "Features", href: "#features" },
  { id: "status", label: "Tracking", href: "#status" },
  { id: "practice", label: "Interview practice", href: "/practice" },
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

export default function FindJobsPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteHeader navItems={NAV_ITEMS} activeId="jobs" />

      {/* ── Hero (design doc 4b) ── */}
      <section className="border-b border-border">
        <div className="wrap grid items-center gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-12">
          <Reveal y={16}>
            <p className="overline">Job agent</p>
            <h1 className="mt-4 max-w-lg text-h1 font-semibold text-ink">
              It finds the openings. You decide what to send.
            </h1>
            <p className="mt-5 max-w-md text-lead text-ink-muted">
              Give it your resume and the roles you want. It scans company boards and ranks what it
              finds against your actual experience, with the reason for every score.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/jobs">
                  <Briefcase /> Run a search
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="/practice">Want to practise first?</a>
              </Button>
            </div>
            <p className="mt-5 text-small text-ink-subtle">
              Free while in beta · Nothing is ever submitted without you
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ProductStack
              planes={JOBS_PLANES}
              label="A matches panel that has scanned six companies and found three new roles: a frontend engineer at Northwind scoring 86, and a platform engineer at Ravel scoring 61 with a note that it needs Kubernetes, which isn't on the resume."
            />
          </Reveal>
        </div>
      </section>

      {/* ── What a run gives you ── */}
      <Section tone="muted">
        <Reveal>
          <SectionHeading eyebrow="What a run gives you" title="Ranked matches with a stated reason." />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {OUTCOMES.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="border-t-2 border-ink pt-4">
                <h3 className="text-h4 font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-small text-ink-muted">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* The two limits, on the page rather than discovered later. */}
        <Reveal>
          <Panel tone="muted" padding="lg" className="mt-10 grid gap-8 lg:grid-cols-2">
            <div>
              <p className="overline">What it does not do</p>
              <p className="mt-3 text-body text-ink">
                The agent never submits an application, never contacts a company, and never sends
                your resume to an employer. It reads public listings and ranks them.
              </p>
            </div>
            <div>
              <p className="overline">Coverage is partial</p>
              <p className="mt-3 text-body text-ink">
                It scans the company boards on your target list, not the whole market, and it
                reports how many it checked on every run.
              </p>
            </div>
          </Panel>
        </Reveal>
      </Section>

      {/* ── How it works ── */}
      <Section id="how">
        <Reveal>
          <SectionHeading
            eyebrow="How the agent works"
            title="Three steps to your first shortlist"
            align="center"
          />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={i * 0.07}>
                <Panel className="h-full">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent-text">
                      <Icon size={17} />
                    </span>
                    <span className="text-overline font-semibold text-ink-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-h4 font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-small text-ink-muted">{step.desc}</p>
                </Panel>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ── Features ── */}
      <Section id="features">
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title="Built for real hunting"
            subtitle="Signal over noise on every run."
            align="center"
          />
        </Reveal>
        <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={(i % 3) * 0.06}>
                <div className="flex gap-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-ink-muted">
                    <Icon size={16} />
                  </span>
                  <div>
                    <h3 className="text-h4 font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-small text-ink-muted">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ── Status tracking ── */}
      <Section id="status" tone="muted">
        <Reveal>
          <SectionHeading
            eyebrow="Tracking"
            title="Every application, tracked"
            subtitle="When the agent can't finish an application safely, it says why and hands you the link."
            align="center"
          />
        </Reveal>

        <Reveal className="mt-10">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Badge tone="outline" size="sm">Example</Badge>
            <span className="text-small text-ink-subtle">
              Illustrative rows — your table is filled by your own resume.
            </span>
          </div>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Company</Th>
                  <Th>Role</Th>
                  <Th className="hidden sm:table-cell">Location</Th>
                  <Th>Match</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLE_ROWS.map((row) => (
                  <Tr key={row.company}>
                    <Td className="font-medium">{row.company}</Td>
                    <Td>{row.role}</Td>
                    <Td className="hidden text-ink-muted sm:table-cell">{row.location}</Td>
                    <Td className="tabular-nums font-medium">{row.match}%</Td>
                    <Td>
                      <Badge tone={row.tone} size="sm">{row.status}</Badge>
                      {row.reason && (
                        <p className="mt-1 text-small text-ink-subtle">{row.reason}</p>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </Reveal>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "No account bans", desc: "Nothing is submitted behind your back." },
            { icon: Clock, title: "Runs between visits", desc: "New matches are waiting the next time you open it." },
            { icon: Building2, title: "Straight from the source", desc: "Company hiring APIs, not scrapers." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.06}>
                <Panel className="h-full">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent-text">
                    <Icon size={17} />
                  </span>
                  <h3 className="mt-4 text-h4 font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-small text-ink-muted">{item.desc}</p>
                </Panel>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ── Product view ── */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Inside the product"
              title="One table for the whole hunt"
              subtitle="Filter by status, open the real application page, and mark what you have done. The agent keeps the list current."
            />
            <Button asChild className="mt-6">
              <a href="/jobs">
                Open the job agent <ArrowRight />
              </a>
            </Button>
          </Reveal>
          <Reveal delay={0.08}>
            <ProductFrame
              src={tourDashboard}
              alt="The job matches table inside the product"
              caption="talentpulse.ai / jobs"
            />
          </Reveal>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section tone="muted">
        <Reveal>
          <Panel tone="raised" padding="lg" className="text-center">
            <h2 className="mx-auto max-w-xl text-h1 font-semibold text-ink">
              Your next role is already posted
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-lead text-ink-muted">
              Point the agent at it — then rehearse that exact interview on the other side.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/jobs">
                  Start job search <ArrowRight />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="/practice">Practice an interview</a>
              </Button>
            </div>
          </Panel>
        </Reveal>
      </Section>

      <SiteFooter />
    </div>
  );
}
