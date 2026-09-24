/**
 * Interview-practice product page (the "Side one" landing).
 *
 * Copy rule for this page: describe what the interview flow actually does.
 * The previous version advertised traction numbers, placeholder testimonials
 * and "cheating detection" the product does not have — all removed.
 *
 * UI: the phosphor-terminal design (2026-09-24) — restyle only; every word is
 * the page's own copy (docs/backup/practice-before-phosphor.tsx.txt).
 */
import {
  ArrowRight, Sparkles, Mic, BarChart3, Target, ListChecks, RefreshCw, Search, ShieldCheck, Keyboard,
} from "lucide-react";
import PhosSiteHeader from "@/components/landing/phos-site-header";
import PhosSiteFooter from "@/components/landing/phos-site-footer";
import {
  CtaBanner, CtaLink, FeatureCard, LimitPanel, PhosHero, PhosPage, PhosSection, SectionIntro, StepTrack, WindowFrame,
} from "@/components/landing/phos-marketing";
import { GlyphBand } from "@/components/phos";
import { PH_BODY_SM, PH_H3, PH_LINK_MONO, PH_MONO } from "@/components/phos/tokens";
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

/** Top strip — every line is a fragment of a claim made further down the page. */
const TICKER = [
  "Eight roles",
  "Three difficulty levels",
  "Up to twelve skills",
  "Voice and video",
  "Scored against real signals",
  "Reports stay available",
  "Free while in beta",
  "Personal details stripped",
];

/**
 * The four steps of a run, per design doc 4a. Two of the doc's captions are
 * corrected against the code: parsing is allowed 120s by the client, not 30s,
 * and the report is written on submit rather than instantly.
 */
const STEPS = [
  { title: "Pick a role", desc: "Choose from eight roles, plus your experience level and difficulty." },
  { title: "Add your resume", desc: "Parsing usually takes under a minute." },
  { title: "Choose skills", desc: "Up to twelve, drawn from your resume." },
  { title: "Answer and submit", desc: "Speak or type. The report is ready when you submit." },
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
    <PhosPage>
      <PhosSiteHeader navItems={NAV_ITEMS} activeId="practice" tickerItems={TICKER} />

      <main className="relative w-full overflow-hidden">
        {/* ── Hero ── */}
        <PhosHero
          eyebrow="Mock interviews"
          title={
            <>
              Practise the questions{" "}
              <span className="ph-glow text-ph-green">you'll actually be asked.</span>
            </>
          }
          lead="Pick a role, upload your resume, and answer out loud or by typing. Every answer comes back scored, with the signals an interviewer would have been listening for."
          actions={
            <>
              <CtaLink href="/interview/select-role">Start a mock interview</CtaLink>
              <CtaLink href="/find-jobs" variant="glass" icon={Search}>
                Looking for openings?
              </CtaLink>
            </>
          }
          note="Free while in beta · Personal details are stripped before indexing"
        />

        {/* ── How a run works ── */}
        <PhosSection id="how-it-works" grid>
          <SectionIntro index="01" eyebrow="How a run works" title="Four steps, about ten minutes." />
          <StepTrack steps={STEPS} />

          {/* The limits, stated on the page rather than discovered in use. */}
          <Reveal className="mt-14 grid gap-6 lg:grid-cols-2">
            <LimitPanel icon={ShieldCheck} label="What it does not do">
              <p>
                Scores are guidance for your own preparation. They are not a hiring decision and
                are never shared with an employer.
              </p>
              <p>
                Recordings never leave your browser. Each answer is captured locally so you can
                play it back, and only the answer text is submitted — the audio and video are
                discarded when you leave the page.
              </p>
            </LimitPanel>
            <LimitPanel icon={Keyboard} label="If speech is unavailable">
              <p>
                Browser support for the speech API this uses is uneven — Firefox has none. Every
                question can be answered by typing instead, and the scoring is identical.
              </p>
            </LimitPanel>
          </Reveal>
        </PhosSection>

        {/* ── Features ── */}
        <PhosSection id="features">
          <SectionIntro
            index="02"
            eyebrow="Features"
            title="What makes it feel like the real thing"
            subtitle="Six things the interview flow does today."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((item, i) => (
              <FeatureCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} index={i} />
            ))}
          </div>
        </PhosSection>

        <GlyphBand rows={2} />

        {/* ── Product tour ── */}
        <PhosSection grid>
          <SectionIntro index="03" eyebrow="Inside the product" title="What you'll actually see" />
          <div className="grid gap-6 lg:grid-cols-3">
            {TOUR.map((slide, i) => (
              <Reveal key={slide.title} delay={i * 0.07} className="flex h-full flex-col">
                <WindowFrame src={slide.src} alt={slide.alt} caption={slide.caption} />
                <h3 className={`${PH_H3} mt-5 text-ph-ink`}>{slide.title}</h3>
                <p className={`${PH_BODY_SM} mt-1`}>{slide.desc}</p>
              </Reveal>
            ))}
          </div>
        </PhosSection>

        {/* ── Tracks ── */}
        <PhosSection id="tracks">
          <SectionIntro
            index="04"
            eyebrow="Tracks"
            title="Pick the stack you're being hired for"
            subtitle="The warm-up questions are drawn from your stack; the rest come from your resume."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((track, i) => (
              <FeatureCard key={track.name} title={track.name} index={i}>
                <p className={`${PH_MONO} mt-2 text-ph-ink-soft`}>{track.topics}</p>
                <a href="/interview/select-role" className={`${PH_LINK_MONO} mt-6`}>
                  Start practice <ArrowRight size={14} />
                </a>
              </FeatureCard>
            ))}
          </div>
        </PhosSection>

        {/* ── CTA ── */}
        <CtaBanner
          title="Rehearse tonight, interview tomorrow"
          text="Or let the job agent find the interview worth rehearsing for."
          actions={
            <>
              <CtaLink href="/interview/select-role">Start an interview</CtaLink>
              <CtaLink href="/find-jobs" variant="glass">
                See the job agent
              </CtaLink>
            </>
          }
        />
      </main>

      <PhosSiteFooter />
    </PhosPage>
  );
}
