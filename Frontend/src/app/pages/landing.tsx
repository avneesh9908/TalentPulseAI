/**
 * Parent landing page — the entry point for the whole product.
 *
 * Its job is to advertise BOTH sides (interview practice + job search), let a
 * visitor sign in / sign up, and then DIVIDE them into the side they came for.
 * The split section is the centerpiece: pick a lane, and every following
 * section explains how the two lanes feed each other.
 */
import { useRef, useState } from "react";
import { useTheme } from "@/contexts/use-theme";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight, Sparkles, Mic, Briefcase, FileText, Target,
  BarChart3, Building2, ChevronDown, Play,
} from "lucide-react";
import SiteHeader from "@/components/landing/site-header";
import SiteFooter from "@/components/landing/site-footer";
import { CardStack } from "@/components/ui/card-stack";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { CountUp } from "@/components/motion/count-up";
import { useMotionSafe } from "@/components/motion/use-motion-safe";
import { staggerChild, staggerParent } from "@/lib/motion";
import arcInterview from "@/assets/landing/arc-interview.svg";
import arcScore from "@/assets/landing/arc-score.svg";
import arcResume from "@/assets/landing/arc-resume.svg";
import arcOffer from "@/assets/landing/arc-offer.svg";
import tourInterview from "@/assets/landing/tour-interview.svg";
import tourResults from "@/assets/landing/tour-results.svg";

/** The two sides of the product — the whole page funnels into these. */
const SIDES = [
  {
    id: "interview",
    eyebrow: "Side One",
    title: "Practice Interviews",
    tagline: "Rehearse under real pressure, get scored in seconds.",
    href: "/practice",
    cta: "Start practicing",
    icon: Mic,
    art: tourInterview,
    accent: "from-violet-600 to-fuchsia-500",
    glow: "rgba(139,92,246,0.55)",
    points: [
      "AI questions built from your own resume",
      "Answer by voice or video, like the real thing",
      "Instant score, strengths and fixes",
    ],
  },
  {
    id: "jobs",
    eyebrow: "Side Two",
    title: "Find Matching Jobs",
    tagline: "An agent watches career pages so you don't have to.",
    href: "/find-jobs",
    cta: "Find me jobs",
    icon: Briefcase,
    art: tourResults,
    accent: "from-cyan-500 to-emerald-400",
    glow: "rgba(6,182,212,0.55)",
    points: [
      "Scans company career pages for openings",
      "Ranks every role against your resume",
      "One table: applied, pending, why it fits",
    ],
  },
] as const;

/** How the two sides share one resume and feed each other. */
const FLOW = [
  { icon: FileText, title: "Upload once", desc: "Your resume is parsed, stripped of personal data, and indexed." },
  { icon: Target, title: "Pick your lane", desc: "Practice an interview, hunt for jobs — or run both together." },
  { icon: BarChart3, title: "Get scored", desc: "Answers judged against real signals; jobs ranked by real fit." },
  { icon: Building2, title: "Land the role", desc: "Walk into the interview you practised, for the job we found." },
];

const STATS = [
  { value: "50K+", label: "Interviews Conducted" },
  { value: "85%", label: "Success Rate" },
  { value: "24/7", label: "AI Availability" },
  { value: "4.9★", label: "User Rating" },
];

const TESTIMONIALS = [
  { quote: "I practised on Monday and applied to three matched roles the same night. Both sides of the app fed each other.", name: "Priya S.", role: "Frontend Developer" },
  { quote: "The questions actually came from my resume — my real projects, my stack. Nothing else felt this close to the real thing.", name: "Rahul M.", role: "Backend Engineer" },
  { quote: "The job agent surfaced an opening I'd never have found, and I'd already rehearsed that exact interview.", name: "Ananya K.", role: "Data Analyst" },
];

const NAV_ITEMS = [
  { id: "sides", label: "Two Sides", href: "#sides" },
  { id: "how", label: "How It Works", href: "#how" },
  { id: "practice", label: "Interviews", href: "/practice" },
  { id: "jobs", label: "Jobs", href: "/find-jobs" },
  { id: "demo", label: "Demo", href: "/demo" },
];

const MARQUEE_ITEMS = [
  "AI Mock Interviews", "Resume-Matched Jobs", "Instant Scoring",
  "Career Page Agent", "Voice & Video Answers", "One Resume, Both Sides",
];

const HEADLINE = ["One", "Platform.", "Two", "Ways", "In."];

export default function LandingPage() {
  const { isDark } = useTheme();
  const motionSafe = useMotionSafe();
  const [hovered, setHovered] = useState<string | null>(null);
  const [finePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );
  const [stackCardWidth] = useState(() =>
    typeof window === "undefined" ? 520 : Math.min(520, window.innerWidth - 72)
  );

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 90]);
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);

  const { scrollYProgress: pageProgress } = useScroll();
  const progressScale = useSpring(pageProgress, { stiffness: 120, damping: 30 });

  const glowX = useMotionValue(-600);
  const glowY = useMotionValue(-600);
  const glowXs = useSpring(glowX, { stiffness: 60, damping: 20 });
  const glowYs = useSpring(glowY, { stiffness: 60, damping: 20 });
  const glowEnabled = motionSafe && finePointer;

  const subText = isDark ? "text-slate-400" : "text-slate-500";
  const sectionBg = isDark ? "bg-slate-900/50" : "bg-slate-50";

  return (
    <div className={`min-h-screen overflow-x-clip transition-colors duration-300 ${
      isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"
    }`}>
      {motionSafe && (
        <motion.div
          className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-violet-600 to-cyan-500"
          style={{ scaleX: progressScale }}
        />
      )}

      <SiteHeader navItems={NAV_ITEMS} />

      {/* ── Hero — advertises both sides ── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-6"
        onMouseMove={
          glowEnabled
            ? (e) => {
                const r = e.currentTarget.getBoundingClientRect();
                glowX.set(e.clientX - r.left);
                glowY.set(e.clientY - r.top);
              }
            : undefined
        }
      >
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute -top-32 left-1/4 h-[460px] w-[460px] rounded-full blur-3xl ${
            isDark ? "bg-violet-600/25" : "bg-violet-300/40"
          }`} />
          <div className={`absolute -bottom-40 right-1/5 h-[500px] w-[500px] rounded-full blur-3xl ${
            isDark ? "bg-cyan-500/20" : "bg-cyan-200/50"
          }`} />
          <div
            className={`absolute inset-0 ${isDark ? "opacity-[0.15]" : "opacity-[0.35]"}`}
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? "#64748b" : "#94a3b8"} 1px, transparent 0)`,
              backgroundSize: "36px 36px",
              maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
            }}
          />
          {glowEnabled && (
            <motion.div
              className={`absolute h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] ${
                isDark ? "bg-violet-500/25" : "bg-violet-400/25"
              }`}
              style={{ left: glowXs, top: glowYs }}
            />
          )}
        </div>

        <motion.div
          className="relative z-10 mx-auto max-w-5xl py-24 text-center"
          style={motionSafe ? { y: heroY, opacity: heroOpacity } : undefined}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
              isDark
                ? "border-violet-500/30 bg-violet-500/20 text-violet-300"
                : "border-violet-200 bg-violet-50 text-violet-600"
            }`}
          >
            <Sparkles size={14} />
            Interview practice + job search, in one place
          </motion.div>

          <motion.h1
            className="font-display font-bold uppercase leading-[0.95] tracking-tight"
            initial="hidden"
            animate="visible"
            variants={staggerParent(0.08, 0.15)}
          >
            <span className="block text-[clamp(2.75rem,8vw,7rem)]">
              {HEADLINE.slice(0, 2).map((w, i) => (
                <motion.span key={i} variants={staggerChild(40, 0.5)} className="inline-block whitespace-pre">
                  {w}{" "}
                </motion.span>
              ))}
            </span>
            <span className="block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent text-[clamp(2.75rem,8vw,7rem)]">
              {HEADLINE.slice(2).map((w, i) => (
                <motion.span key={i} variants={staggerChild(40, 0.5)} className="inline-block whitespace-pre">
                  {w}{" "}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className={`mx-auto mb-10 mt-8 max-w-2xl text-lg md:text-xl ${subText}`}
          >
            Rehearse the interview with an AI that reads your resume — and let an agent hunt the
            jobs worth applying to. Same resume, two engines, one login.
          </motion.p>

          {/* Dual CTA — the choice starts here */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <a href="/practice">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-9 py-4 text-lg font-semibold text-white shadow-[0_0_40px_-8px_rgba(139,92,246,0.7)]"
              >
                <Mic size={20} />
                I want to practice
              </motion.button>
            </a>
            <a href="/find-jobs">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-9 py-4 text-lg font-semibold text-white shadow-[0_0_40px_-8px_rgba(6,182,212,0.7)]"
              >
                <Briefcase size={20} />
                I want a job
              </motion.button>
            </a>
          </motion.div>

          <motion.a
            href="#sides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className={`mt-8 inline-block text-sm underline-offset-4 hover:underline ${subText}`}
          >
            Not sure? See both sides
          </motion.a>
        </motion.div>

        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={motionSafe ? { y: [0, 8, 0] } : undefined}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <ChevronDown className={subText} size={26} />
        </motion.div>
      </section>

      {/* ── Marquee ── */}
      <div className="-rotate-1 scale-[1.02]">
        <Marquee
          items={MARQUEE_ITEMS}
          className="border-y border-black/10 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-600 py-4 font-display text-lg font-bold uppercase tracking-widest text-white md:text-2xl"
        />
      </div>

      {/* ── THE DIVIDE — pick your side ── */}
      <section id="sides" className="px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 text-center">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              Pick Your{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Side</span>
            </h2>
            <p className={`mt-4 text-xl ${subText}`}>
              Two products, one account. Switch between them any time.
            </p>
          </Reveal>

          {/* Hovering one side expands it and dims the other */}
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-5">
            {SIDES.map((side) => {
              const Icon = side.icon;
              const isHovered = hovered === side.id;
              const isDimmed = hovered !== null && !isHovered;
              return (
                <motion.a
                  key={side.id}
                  href={side.href}
                  onMouseEnter={() => setHovered(side.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(side.id)}
                  onBlur={() => setHovered(null)}
                  layout
                  animate={{
                    flexGrow: isHovered ? 1.35 : 1,
                    opacity: isDimmed ? 0.62 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  whileTap={{ scale: 0.99 }}
                  className={`group relative flex-1 overflow-hidden rounded-[2rem] border p-8 md:p-10 ${
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-slate-200 bg-white shadow-sm"
                  }`}
                >
                  {/* accent wash */}
                  <div
                    className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${side.accent} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`}
                  />

                  <div className="relative z-10 flex h-full flex-col">
                    <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${subText}`}>
                      {side.eyebrow}
                    </span>

                    <div
                      className={`mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${side.accent} shadow-lg`}
                      style={{ boxShadow: `0 0 40px -10px ${side.glow}` }}
                    >
                      <Icon className="text-white" size={30} />
                    </div>

                    <h3 className="mt-6 font-display text-3xl font-bold uppercase leading-none tracking-tight md:text-4xl">
                      {side.title}
                    </h3>
                    <p className={`mt-3 text-lg ${subText}`}>{side.tagline}</p>

                    <ul className="mt-7 space-y-3">
                      {side.points.map((p) => (
                        <li key={p} className="flex items-start gap-3 text-sm">
                          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${side.accent}`} />
                          <span className={subText}>{p}</span>
                        </li>
                      ))}
                    </ul>

                    {/* preview art — grows on hover */}
                    <motion.div
                      className="mt-8 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10"
                      animate={{ opacity: isHovered ? 1 : 0.75 }}
                    >
                      <img
                        src={side.art}
                        alt=""
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                    </motion.div>

                    <span
                      className={`mt-8 inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r ${side.accent} px-6 py-3 font-semibold text-white transition-transform group-hover:gap-3`}
                    >
                      {side.cta}
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>

          <p className={`mt-8 text-center text-sm ${subText}`}>
            Already have an account?{" "}
            <a href="/auth/login" className="font-semibold text-violet-500 hover:underline">Log in</a>
            {" · "}New here?{" "}
            <a href="/auth/register" className="font-semibold text-cyan-500 hover:underline">Create one free</a>
          </p>
        </div>
      </section>

      {/* ── Shared flow — how the sides connect ── */}
      <section id="how" className={`px-6 py-28 ${sectionBg}`}>
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-16 text-center">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              One Resume,{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Both Engines</span>
            </h2>
            <p className={`mt-4 text-xl ${subText}`}>
              Upload once — practice and job matching run off the same profile.
            </p>
          </Reveal>

          <StaggerGroup className="grid gap-5 md:grid-cols-4">
            {FLOW.map((step, i) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.title}>
                  <div
                    className={`relative h-full rounded-3xl border p-6 ${
                      isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white shadow-sm"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`font-display text-5xl font-bold leading-none text-transparent ${
                        isDark
                          ? "[-webkit-text-stroke:1.5px_rgba(139,92,246,0.45)]"
                          : "[-webkit-text-stroke:1.5px_rgba(139,92,246,0.3)]"
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500">
                      <Icon className="text-white" size={22} />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
                    <p className={`mt-2 text-sm leading-relaxed ${subText}`}>{step.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>

          {/* the split, drawn */}
          <Reveal className="mt-14">
            <div className={`flex flex-col items-center gap-4 rounded-3xl border p-8 md:flex-row md:justify-center md:gap-8 ${
              isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"
            }`}>
              <img src={arcResume} alt="" className="h-24 w-auto rounded-xl" loading="lazy" />
              <ArrowRight className={`${subText} rotate-90 md:rotate-0`} size={24} />
              <div className="flex gap-4">
                <img src={arcInterview} alt="" className="h-24 w-auto rounded-xl" loading="lazy" />
                <img src={arcScore} alt="" className="h-24 w-auto rounded-xl" loading="lazy" />
              </div>
              <ArrowRight className={`${subText} rotate-90 md:rotate-0`} size={24} />
              <img src={arcOffer} alt="" className="h-24 w-auto rounded-xl" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-6 py-24">
        <StaggerGroup className="mx-auto grid max-w-6xl grid-cols-2 gap-10 md:grid-cols-4">
          {STATS.map((stat) => (
            <StaggerItem key={stat.label} className="text-center">
              <CountUp
                value={stat.value}
                className={`font-display text-5xl font-bold md:text-7xl ${isDark ? "text-white" : "text-slate-900"}`}
              />
              <div className={`mt-3 text-sm uppercase tracking-wider ${subText}`}>{stat.label}</div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ── Testimonials ── */}
      <section className={`px-6 py-28 ${sectionBg}`}>
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 text-center">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              Loved by{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Candidates</span>
            </h2>
            <p className={`mt-4 text-xl ${subText}`}>Real practice, real matches, real offers</p>
          </Reveal>
          <CardStack
            items={TESTIMONIALS.map((t) => ({
              id: t.name,
              title: t.name,
              description: t.role,
              quote: t.quote,
            }))}
            cardWidth={stackCardWidth}
            cardHeight={300}
            maxVisible={5}
            autoAdvance
            intervalMs={4500}
            renderCard={(item) => (
              <figure
                className={`flex h-full w-full flex-col justify-between p-7 ${
                  isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                }`}
              >
                <blockquote className="text-base leading-relaxed md:text-lg">“{item.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-sm font-bold text-white"
                    aria-hidden="true"
                  >
                    {item.title.charAt(0)}
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className={`block text-xs ${subText}`}>{item.description}</span>
                  </span>
                </figcaption>
              </figure>
            )}
          />
        </div>
      </section>

      {/* ── CTA finale ── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-600/30 to-cyan-500/30 blur-[130px]" />
        </div>
        <div className="relative mx-auto max-w-5xl text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(2.5rem,8vw,6.5rem)] font-bold uppercase leading-[0.95] tracking-tight">
              Start on{" "}
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                Either Side
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={`mx-auto mb-10 mt-6 max-w-2xl text-xl ${subText}`}>
              One free account unlocks both. Practice tonight, apply tomorrow.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-10 py-5 text-xl font-bold text-white shadow-[0_0_60px_-10px_rgba(139,92,246,0.8)]"
                >
                  Create free account
                  <ArrowRight size={24} />
                </motion.button>
              </a>
              <a href="/demo">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-10 py-5 text-xl font-semibold transition ${
                    isDark
                      ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                      : "border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
                  }`}
                >
                  <Play size={20} />
                  Try the demo
                </motion.button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
