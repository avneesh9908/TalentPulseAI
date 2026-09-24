/**
 * Parent landing page — the entry point for the whole product.
 *
 * Its job is to advertise BOTH sides (interview practice + job search), let a
 * visitor sign in / sign up, and then DIVIDE them into the side they came for.
 *
 * Claims on this page must be things the product actually does. The previous
 * version advertised invented traction numbers and testimonials; those are
 * gone until there is real data to cite.
 *
 * UI: the phosphor-terminal design (2026-09-24) — black page, one phosphor
 * accent, mono micro-type, numbered sections. Patterns P1–P15 of
 * `docs/REFERENCE-TEARDOWN-phosphor.md`; restyle only. Every word below is the
 * page's own copy (see docs/backup/landing-before-phosphor.tsx.txt). Dark-only
 * by design.
 */
import type { ComponentType } from "react";
import {
  ArrowRight, Mic, Briefcase, FileText, Target, BarChart3, Building2,
  ShieldCheck, Video, ListChecks, Sparkles, Gauge, PlayCircle,
  FileSearch, UserCheck,
} from "lucide-react";
import PhosSiteHeader from "@/components/landing/phos-site-header";
import PhosSiteFooter from "@/components/landing/phos-site-footer";
import { AccordionRow, BracketCard, CtaBand, GlyphBand, SectionHead, WindowFrame } from "@/components/phos";
import {
  PH_BODY, PH_BODY_SM, PH_BTN_GHOST, PH_BTN_PRIMARY, PH_BTN_TERM, PH_CARD,
  PH_DISPLAY, PH_H3, PH_LINK_MONO, PH_MONO, PH_MONO_RAW,
} from "@/components/phos/tokens";
import { Reveal } from "@/components/motion/reveal";
import tourInterview from "@/assets/landing/tour-interview.svg";
import tourResults from "@/assets/landing/tour-results.svg";

type Icon = ComponentType<{ size?: number; className?: string }>;

const NAV_ITEMS = [
  { id: "practice", label: "Practice", href: "/practice" },
  { id: "jobs", label: "Find jobs", href: "/find-jobs" },
  { id: "how", label: "How it works", href: "#how" },
  { id: "faq", label: "FAQ", href: "#faq" },
];

/**
 * The top strip. Every line is a fragment of a claim made further down the
 * page — nothing here is a new promise, and no traction numbers appear.
 */
const TICKER = [
  "Free while in beta",
  "No card, no sales call",
  "Resume-aware questions",
  "Voice and video answers",
  "Personal details stripped",
  "Career pages, not job boards",
  "Per-question feedback",
  "The agent never applies for you",
];

/**
 * The row under the hero. Each line is a claim the rest of the page has to keep,
 * which is why the third one is a limit rather than a feature.
 */
const HERO_POINTS: { title: string; desc: string; icon: Icon }[] = [
  {
    title: "Scored against the role",
    desc: "Questions come from your resume and the role you pick, not a generic bank.",
    icon: FileSearch,
  },
  {
    title: "A report you can act on",
    desc: "Every answer gets the signals expected and what was missing.",
    icon: ListChecks,
  },
  {
    title: "The agent never applies for you",
    desc: "It finds and ranks openings. You decide what to send.",
    icon: UserCheck,
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
    <div className="relative min-h-screen bg-ph-bg font-st-body text-ph-ink antialiased selection:bg-ph-green selection:text-black">
      <PhosSiteHeader navItems={NAV_ITEMS} tickerItems={TICKER} />

      <main className="relative w-full overflow-hidden pt-[104px]">
        {/* ── Hero ── */}
        <section className="ph-grid relative w-full overflow-hidden border-b border-ph-line">
          <div aria-hidden="true" className="ph-scan pointer-events-none absolute inset-0" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-ph-green/[0.07] blur-[140px]"
          />
          <div className="ph-wrap relative z-10 grid gap-14 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <Reveal>
              {/* Announcement — the one place a claim about price lives. */}
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-ph-green/40 bg-ph-green/[0.06] px-3.5 py-1.5">
                <span className={`${PH_MONO} text-ph-green`}>Beta</span>
                <span aria-hidden="true" className="h-3 w-px bg-ph-green/30" />
                <span className={`${PH_MONO} text-ph-ink-muted`}>
                  Free while in beta — no card, no sales call.
                </span>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ph-green shadow-[0_0_8px_#00ff41]" />
              </div>

              <h1 className={`${PH_DISPLAY} mb-6 max-w-[16ch] text-balance text-ph-ink`}>
                Transform your career profile into{" "}
                <span className="ph-glow text-ph-green">high-fidelity signal.</span>
              </h1>

              <p className={`${PH_BODY} mb-10 max-w-[62ch] text-pretty`}>
                Mock interviews built from your own resume and scored against the role you're
                targeting, plus a job agent that ranks real openings. Personal details are stripped
                before anything is indexed.
              </p>

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <a href="/auth/register" className={`${PH_BTN_PRIMARY} w-full sm:w-auto`}>
                  Get started for free <ArrowRight size={18} />
                </a>
                <a href="/demo" className={`${PH_BTN_GHOST} w-full sm:w-auto`}>
                  <PlayCircle size={18} className="text-ph-green" /> Try the demo
                </a>
                <span className={PH_BTN_TERM}>
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ph-green" />
                  Personal details stripped
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <WindowFrame caption="Live interview">
                <img
                  src={tourInterview}
                  alt="Live interview screen with the question, camera and timer"
                  className="ph-tint block w-full object-cover"
                />
              </WindowFrame>
            </Reveal>
          </div>

          {/* The three claims the hero makes, stated plainly. */}
          <div className="ph-wrap relative z-10 pb-20">
            <dl className="grid grid-cols-1 gap-px bg-ph-line md:grid-cols-3">
              {HERO_POINTS.map((point) => (
                <div key={point.title} className="bg-black p-6">
                  <dt className="mb-2 flex items-center gap-2.5">
                    <point.icon size={16} className="text-ph-green" />
                    <span className="font-st-display text-[15px] font-medium text-ph-ink">
                      {point.title}
                    </span>
                  </dt>
                  <dd className={`${PH_BODY_SM} text-pretty`}>{point.desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── The divide — pick your side ── */}
        <section id="sides" className="ph-section scroll-mt-28">
          <div className="ph-wrap">
            <SectionHead
              index="01"
              eyebrow="Two products, one account"
              title="Pick your side"
              subtitle="Start on either one. The same resume drives both, and you can switch whenever you want."
            />
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
              {SIDES.map((side, i) => {
                const SideIcon = side.icon;
                return (
                  <Reveal key={side.id} delay={i * 0.08} className={`${PH_CARD} flex flex-col p-6 sm:p-8`}>
                    <div className="mb-6 flex items-center gap-3 border-b border-ph-line pb-6">
                      <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-ph-green/30 bg-ph-green/[0.06] text-ph-green">
                        <SideIcon size={18} />
                      </span>
                      <div>
                        <p className={`${PH_MONO} text-ph-green`}>{side.eyebrow}</p>
                        <h3 className="mt-1 font-st-display text-[22px] font-semibold leading-7 text-ph-ink">
                          {side.title}
                        </h3>
                      </div>
                    </div>

                    <p className={PH_BODY}>{side.tagline}</p>

                    <ul className="mt-5 space-y-2.5">
                      {side.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-ph-green" />
                          <span className={`${PH_MONO_RAW} leading-[1.7] text-ph-ink-muted`}>{point}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7">
                      <WindowFrame caption={side.caption}>
                        <img
                          src={side.art}
                          alt={`${side.title} screen`}
                          loading="lazy"
                          className="ph-tint block w-full object-cover"
                        />
                      </WindowFrame>
                    </div>

                    <div className="mt-7">
                      <a href={side.href} className={PH_LINK_MONO}>
                        {side.cta} <ArrowRight size={14} />
                      </a>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <GlyphBand />

        {/* ── Shared flow ── */}
        <section id="how" className="ph-section scroll-mt-28">
          <div className="ph-wrap">
            <SectionHead
              index="02"
              eyebrow="How it works"
              title="One resume, both engines"
              subtitle="Upload once. Practice and job matching run off the same indexed profile."
            />
            <div className="relative">
              {/* The track the four steps sit on. */}
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 top-[22px] hidden h-px bg-gradient-to-r from-transparent via-ph-green/45 to-transparent lg:block"
              />
              <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {FLOW.map((step, i) => {
                  const StepIcon = step.icon;
                  return (
                    <Reveal key={step.title} delay={i * 0.06} className="relative">
                      <div className="mb-6 flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ph-green/40 bg-black font-ph-mono text-[13px] text-ph-green shadow-[0_0_18px_rgba(0,255,65,0.18)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <StepIcon size={16} className="text-ph-ink-soft" />
                      </div>
                      <h3 className={`${PH_H3} mb-2 text-ph-ink`}>{step.title}</h3>
                      <p className={PH_BODY_SM}>{step.desc}</p>
                    </Reveal>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* ── What you actually get ── */}
        <section id="capabilities" className="ph-section-tight">
          <div className="ph-wrap">
            <SectionHead
              index="03"
              eyebrow="What you actually get"
              title="Specific things the product does"
              subtitle="No traction numbers we can't show you — just what happens after you upload a resume."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <Reveal key={item.title} delay={(i % 3) * 0.06}>
                    <BracketCard className="h-full">
                      <ItemIcon size={18} className="mb-5 text-ph-green" />
                      <h3 className="mb-2 font-st-display text-[17px] font-medium leading-6 text-ph-ink">
                        {item.title}
                      </h3>
                      <p className={PH_BODY_SM}>{item.desc}</p>
                    </BracketCard>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <GlyphBand rows={2} />

        {/* ── FAQ ── */}
        <section id="faq" className="ph-section-tight scroll-mt-28">
          <div className="ph-wrap grid gap-10 lg:grid-cols-[1fr_1.35fr]">
            <Reveal>
              <p className={`${PH_MONO} mb-6 text-ph-green`}>
                <span className="text-ph-ink-soft">04</span>
                <span className="px-2 text-ph-ink-soft">/</span>
                FAQ
              </p>
              <h2 className="font-st-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.028em] text-ph-ink">
                Straight answers
              </h2>
              <p className={`${PH_BODY} mt-4 max-w-md`}>The four things people ask before signing up.</p>
            </Reveal>
            <Reveal delay={0.08} className="border-t border-ph-line">
              {FAQ.map((item) => (
                <AccordionRow key={item.q} q={item.q} a={item.a} />
              ))}
            </Reveal>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ph-section-tight">
          <div className="ph-wrap">
            <Reveal>
              <CtaBand
                index="05"
                eyebrow="Get started"
                title="Start on either side"
                desc="One free account unlocks both. Practice tonight, apply tomorrow."
                footnote={
                  <p className={PH_BODY_SM}>
                    Already have an account?{" "}
                    <a href="/auth/login" className="text-ph-green underline-offset-4 hover:underline">
                      Log in
                    </a>
                  </p>
                }
              >
                <a href="/auth/register" className={`${PH_BTN_PRIMARY} w-full sm:w-auto`}>
                  Create a free account <ArrowRight size={18} />
                </a>
                <a href="/demo" className={`${PH_BTN_GHOST} w-full sm:w-auto`}>
                  Try the demo
                </a>
              </CtaBand>
            </Reveal>
          </div>
        </section>
      </main>

      <PhosSiteFooter />
    </div>
  );
}
