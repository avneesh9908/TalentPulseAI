/**
 * Parent landing page — the entry point for the whole product.
 *
 * Its job is to advertise BOTH sides (interview practice + job search), let a
 * visitor sign in / sign up, and then DIVIDE them into the side they came for.
 *
 * Claims on this page must be things the product actually does. The previous
 * version advertised invented traction numbers and testimonials; those are
 * gone until there is real data to cite.
 */
import {
  ArrowRight, Mic, Briefcase, FileText, Target, BarChart3, Building2,
  ShieldCheck, Video, ListChecks, Sparkles, Gauge, PlayCircle, ChevronDown,
} from "lucide-react";
import SiteHeader from "@/components/landing/site-header";
import SiteFooter from "@/components/landing/site-footer";
import { ProductFrame } from "@/components/landing/product-frame";
import { ProductStack } from "@/components/landing/product-stack";
import { HERO_PLANES } from "@/components/landing/product-planes";
import { Section, SectionHeading } from "@/components/ui/section";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import tourInterview from "@/assets/landing/tour-interview.svg";
import tourResults from "@/assets/landing/tour-results.svg";

const NAV_ITEMS = [
  { id: "practice", label: "Practice", href: "/practice" },
  { id: "jobs", label: "Find jobs", href: "/find-jobs" },
  { id: "how", label: "How it works", href: "#how" },
  { id: "faq", label: "FAQ", href: "#faq" },
];

/**
 * The row under the hero. Each line is a claim the rest of the page has to keep,
 * which is why the third one is a limit rather than a feature.
 */
const HERO_POINTS = [
  {
    title: "Scored against the role",
    desc: "Questions come from your resume and the role you pick, not a generic bank.",
  },
  {
    title: "A report you can act on",
    desc: "Every answer gets the signals expected and what was missing.",
  },
  {
    title: "The agent never applies for you",
    desc: "It finds and ranks openings. You decide what to send.",
  },
];

/** The two sides of the product — the whole page funnels into these. */
const SIDES = [
  {
    id: "interview",
    eyebrow: "Side one",
    title: "Practice interviews",
    tagline: "Rehearse under real pressure, and get scored in seconds.",
    href: "/practice",
    cta: "See interview practice",
    icon: Mic,
    art: tourInterview,
    caption: "Live interview",
    points: [
      "Questions generated from your own resume",
      "Answer by voice or video, like the real thing",
      "A score, your strengths, and what to fix",
    ],
  },
  {
    id: "jobs",
    eyebrow: "Side two",
    title: "Find matching jobs",
    tagline: "An agent watches company career pages so you don't have to.",
    href: "/find-jobs",
    cta: "See the job agent",
    icon: Briefcase,
    art: tourResults,
    caption: "Job matches",
    points: [
      "Reads openings straight from company job boards",
      "Ranks every role against your resume",
      "One table: what fits, what's pending, what you applied to",
    ],
  },
] as const;

/** How the two sides share one resume and feed each other. */
const FLOW = [
  { icon: FileText, title: "Upload once", desc: "Your resume is parsed, stripped of personal details, and indexed." },
  { icon: Target, title: "Pick your lane", desc: "Practice an interview, hunt for jobs — or run both together." },
  { icon: BarChart3, title: "Get scored", desc: "Answers judged against real signals; jobs ranked by real fit." },
  { icon: Building2, title: "Walk in ready", desc: "Interview for the role you found, having already rehearsed it." },
];

/**
 * Replaces the old invented traction stats. Every line here is something the
 * product does today, not a number we cannot back up.
 */
const CAPABILITIES = [
  { icon: Sparkles, title: "Resume-aware questions", desc: "Your projects, your stack, your companies — not a generic question bank." },
  { icon: Gauge, title: "A warm-up before the hard part", desc: "Interviews open on fundamentals, then ramp to the tricky follow-ups." },
  { icon: Video, title: "Voice and video answers", desc: "Speak your answer with live transcription while the camera records." },
  { icon: ListChecks, title: "Per-question feedback", desc: "Every answer scored against the signals an interviewer looks for." },
  { icon: Briefcase, title: "Career pages, not job boards", desc: "The agent reads company hiring APIs directly, so listings are first-hand." },
  { icon: ShieldCheck, title: "Personal details stripped", desc: "Name, contact and location are removed before anything is embedded." },
];

const FAQ = [
  {
    q: "What does it cost?",
    a: "Nothing right now. TalentPulseAI is free while it is in beta — there is no billing, no card and no sales call.",
  },
  {
    q: "What happens to my resume?",
    a: "It is parsed into sections, and personal details — name, email, phone, address and location — are removed before the text is indexed for question generation. Only the professional content is used.",
  },
  {
    q: "Where do the interview questions come from?",
    a: "They are generated from the sections of your own resume, blended with what is commonly asked for your role and experience level. If generation is unavailable, you still get a structured question set rather than an error.",
  },
  {
    q: "Does the job agent apply for me?",
    a: "No. It finds and ranks openings and takes you to the real application page. Anything it cannot safely fill in is marked pending with the reason, so you finish it yourself.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Announcement bar — the one place a claim about price lives. */}
      <div className="border-b border-border bg-surface">
        <div className="wrap flex items-center justify-center gap-2 py-2 text-small text-ink-muted">
          <Badge tone="accent" size="sm">Beta</Badge>
          <span className="truncate">Free while in beta — no card, no sales call.</span>
        </div>
      </div>

      <SiteHeader navItems={NAV_ITEMS} />

      {/* ── Hero (design doc 3a) ── */}
      <section className="border-b border-border">
        <div className="wrap grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
          <Reveal y={16}>
            <h1 className="max-w-xl text-balance text-display font-semibold text-ink">
              Transform your career profile into high-fidelity signal.
            </h1>
            <p className="mt-6 max-w-md text-pretty text-lead text-ink-muted">
              Mock interviews built from your own resume and scored against the role you're
              targeting, plus a job agent that ranks real openings. Personal details are stripped
              before anything is indexed.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/auth/register">Get started for free</a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="/demo">
                  <PlayCircle /> Try the demo
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ProductStack
              variant="layered"
              planes={HERO_PLANES}
              label="Three layered panels of the product: a report scoring an answer 88 out of 100 in front, a dark live-interview session with a question and a running transcript behind it, and the parsed sections of a resume behind that."
            />
          </Reveal>
        </div>

        {/* The three claims the hero makes, stated plainly. */}
        <div className="wrap pb-16 md:pb-20">
          <dl className="grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
            {HERO_POINTS.map((point) => (
              <div key={point.title}>
                {/* A 2px accent rule per claim — the row was three paragraphs with
                    nothing marking where one ended and the next began. */}
                <span aria-hidden="true" className="mb-4 block h-0.5 w-6 rounded-full bg-accent" />
                <dt className="text-h4 font-semibold text-ink">{point.title}</dt>
                <dd className="mt-1.5 text-pretty text-small text-ink-muted">{point.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── The divide — pick your side ── */}
      <Section id="sides">
        <Reveal>
          <SectionHeading
            eyebrow="Two products, one account"
            title="Pick your side"
            subtitle="Start on either one. The same resume drives both, and you can switch whenever you want."
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {SIDES.map((side, i) => {
            const Icon = side.icon;
            return (
              <Reveal key={side.id} delay={i * 0.08}>
                <Panel tone="raised" padding="lg" className="flex h-full flex-col">
                  <p className="overline">{side.eyebrow}</p>
                  <span className="mt-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent-text">
                    <Icon size={19} />
                  </span>
                  <h3 className="mt-4 text-h2 font-semibold text-ink">{side.title}</h3>
                  <p className="mt-2 text-body text-ink-muted">{side.tagline}</p>

                  <ul className="mt-5 space-y-2.5">
                    {side.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-body text-ink-muted">
                        <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <ProductFrame
                    src={side.art}
                    alt={`${side.title} screen`}
                    caption={side.caption}
                    className="mt-6 shadow-e1"
                  />

                  <div className="mt-6 pt-1">
                    <Button asChild variant="secondary">
                      <a href={side.href}>
                        {side.cta} <ArrowRight />
                      </a>
                    </Button>
                  </div>
                </Panel>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ── Shared flow ── */}
      <Section id="how" tone="muted">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="One resume, both engines"
            subtitle="Upload once. Practice and job matching run off the same indexed profile."
            align="center"
          />
        </Reveal>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={i * 0.06}>
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
        </ol>
      </Section>

      {/* ── What you actually get (replaces the invented stat row) ── */}
      <Section id="capabilities">
        <Reveal>
          <SectionHeading
            eyebrow="What you actually get"
            title="Specific things the product does"
            subtitle="No traction numbers we can't show you — just what happens after you upload a resume."
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={(i % 3) * 0.06}>
                <div className="flex gap-3.5">
                  {/* 36px, matching the FLOW tiles — the neutral fill is the
                      deliberate part of the ramp, the odd size was not. */}
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-ink-muted">
                    <Icon size={17} />
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

      {/* ── FAQ ── */}
      <Section id="faq" tone="muted">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title="Straight answers"
              subtitle="The four things people ask before signing up."
            />
          </Reveal>
          <Reveal delay={0.08}>
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-canvas">
              {FAQ.map((item) => (
                <details key={item.q} className="group">
                  {/* The affordance is a chevron rather than a rotating "+", and the
                      whole row is the hit area — a 4-line summary previously had a
                      target only as tall as its text. */}
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-body font-medium text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/70">
                    {item.q}
                    <ChevronDown
                      aria-hidden="true"
                      size={16}
                      className="shrink-0 text-ink-subtle transition-transform duration-200 group-open:-rotate-180"
                    />
                  </summary>
                  <p className="px-5 pb-4 text-pretty text-small text-ink-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section>
        <Reveal>
          <Panel tone="muted" padding="lg" className="text-center">
            <h2 className="mx-auto max-w-xl text-h1 font-semibold text-ink">
              Start on either side
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-lead text-ink-muted">
              One free account unlocks both. Practice tonight, apply tomorrow.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="/auth/register">
                  Create a free account <ArrowRight />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="/demo">Try the demo</a>
              </Button>
            </div>
            <p className="mt-4 text-small text-ink-subtle">
              Already have an account?{" "}
              <a href="/auth/login" className="text-accent-text underline-offset-4 hover:underline">
                Log in
              </a>
            </p>
          </Panel>
        </Reveal>
      </Section>

      <SiteFooter />
    </div>
  );
}
