/**
 * Interview-practice product page (the "Side one" landing).
 *
 * Copy rule for this page: describe what the interview flow actually does.
 * The previous version advertised traction numbers, placeholder testimonials
 * and "cheating detection" the product does not have — all removed.
 */
import {
  ArrowRight, Sparkles, Mic, BarChart3, Target, Play, ListChecks, RefreshCw,
} from "lucide-react";
import SiteHeader from "@/components/landing/site-header";
import SiteFooter from "@/components/landing/site-footer";
import { ProductFrame } from "@/components/landing/product-frame";
import { Section, SectionHeading } from "@/components/ui/section";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import tourDashboard from "@/assets/landing/tour-dashboard.svg";
import tourInterview from "@/assets/landing/tour-interview.svg";
import tourResults from "@/assets/landing/tour-results.svg";

const NAV_ITEMS = [
  { id: "how-it-works", label: "How it works", href: "#how-it-works" },
  { id: "features", label: "Features", href: "#features" },
  { id: "tracks", label: "Tracks", href: "#tracks" },
  { id: "find-jobs", label: "Job search", href: "/find-jobs" },
];

const STEPS = [
  { icon: Target, title: "Set up the interview", desc: "Pick the role, your experience level, the difficulty and the skills to be tested." },
  { icon: Mic, title: "Answer out loud", desc: "Questions arrive one at a time on a timer. Speak your answer — it is transcribed live while the camera records." },
  { icon: BarChart3, title: "Read the report", desc: "An overall score, per-question feedback, your strengths and the specific things to fix." },
];

const FEATURES = [
  { icon: Sparkles, title: "Questions from your resume", desc: "Your projects, employers and stack are indexed and used to write the questions — not a generic bank." },
  { icon: ListChecks, title: "Easy first, tricky later", desc: "Every interview opens on fundamentals for your stack, then moves to applied questions, then the hard follow-ups." },
  { icon: Mic, title: "Voice and video", desc: "Live speech transcription while you answer, with the webcam recording so you can see how you came across." },
  { icon: BarChart3, title: "Scored against real signals", desc: "Each answer is judged against the specific things an interviewer listens for on that question." },
  { icon: RefreshCw, title: "Reports stay available", desc: "Every completed interview is kept on your profile, so you can reopen the report and compare runs." },
  { icon: Target, title: "Role and difficulty control", desc: "Eight roles, three difficulty levels and your own skill list decide what you get asked." },
];

const TRACKS = [
  { name: "Python", topics: "Core Python, DSA, OOP" },
  { name: "JavaScript", topics: "ES6+, async, the DOM" },
  { name: "React", topics: "Hooks, state, components" },
  { name: "C++ and DSA", topics: "STL, algorithms, pointers" },
  { name: "Node.js backend", topics: "Express, APIs, MongoDB" },
  { name: "Data science", topics: "Pandas, ML, statistics" },
];

const TOUR = [
  { src: tourInterview, alt: "Live interview screen with the question, camera and timer", caption: "Live interview", title: "Answer live, on a timer", desc: "One question at a time, voice transcribed as you speak, camera on." },
  { src: tourResults, alt: "Results screen with the overall score, strengths and improvements", caption: "Report", title: "A report, not just a number", desc: "Score, strengths, improvements and feedback on each individual answer." },
  { src: tourDashboard, alt: "Dashboard showing interview history and progress", caption: "History", title: "Every run is kept", desc: "Reopen any past report from your profile and see how you have moved." },
];

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteHeader navItems={NAV_ITEMS} activeId="practice" />

      {/* ── Hero ── */}
      <section className="border-b border-border">
        <div className="wrap grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1fr_1.05fr]">
          <Reveal y={16}>
            <Badge tone="accent" size="sm">Interview practice</Badge>
            <h1 className="mt-4 text-display font-semibold text-ink">
              Practice the interview you're{" "}
              <span className="text-accent-text">about to have</span>
            </h1>
            <p className="mt-5 max-w-lg text-lead text-ink-muted">
              Upload your resume and an AI interviews you on your own experience — out loud, on
              a timer, and scored the moment you finish.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" pill>
                <a href="/interview/select-role">
                  Start an interview <ArrowRight />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary" pill>
                <a href="/demo">
                  <Play /> Try the demo
                </a>
              </Button>
            </div>
            <p className="mt-4 text-small text-ink-subtle">
              Free while in beta · Personal details are stripped before indexing
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ProductFrame
              src={tourInterview}
              alt="A live AI interview in progress"
              caption="talentpulse.ai / interview"
            />
          </Reveal>
        </div>
      </section>

      {/* ── How it works ── */}
      <Section id="how-it-works" tone="muted">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Three steps, about two minutes to start"
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
            title="What makes it feel like the real thing"
            subtitle="Six things the interview flow does today."
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

      {/* ── Product tour ── */}
      <Section tone="muted">
        <Reveal>
          <SectionHeading eyebrow="Inside the product" title="What you'll actually see" align="center" />
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TOUR.map((slide, i) => (
            <Reveal key={slide.title} delay={i * 0.07}>
              <div className="flex h-full flex-col">
                <ProductFrame src={slide.src} alt={slide.alt} caption={slide.caption} />
                <h3 className="mt-4 text-h4 font-semibold text-ink">{slide.title}</h3>
                <p className="mt-1 text-small text-ink-muted">{slide.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Tracks ── */}
      <Section id="tracks">
        <Reveal>
          <SectionHeading
            eyebrow="Tracks"
            title="Pick the stack you're being hired for"
            subtitle="The warm-up questions are drawn from your stack; the rest come from your resume."
            align="center"
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((track, i) => (
            <Reveal key={track.name} delay={(i % 3) * 0.06}>
              <Panel interactive className="h-full">
                <h3 className="text-h4 font-semibold text-ink">{track.name}</h3>
                <p className="mt-1 text-small text-ink-muted">{track.topics}</p>
                <a
                  href="/interview/select-role"
                  className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-accent-text underline-offset-4 hover:underline"
                >
                  Start practice <ArrowRight size={14} />
                </a>
              </Panel>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section tone="muted">
        <Reveal>
          <Panel tone="raised" padding="lg" className="text-center">
            <h2 className="mx-auto max-w-xl text-h1 font-semibold text-ink">
              Rehearse tonight, interview tomorrow
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-lead text-ink-muted">
              Or let the job agent find the interview worth rehearsing for.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" pill>
                <a href="/interview/select-role">
                  Start an interview <ArrowRight />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary" pill>
                <a href="/find-jobs">See the job agent</a>
              </Button>
            </div>
          </Panel>
        </Reveal>
      </Section>

      <SiteFooter />
    </div>
  );
}
