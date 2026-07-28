/**
 * Job Search product page — the parallel of practice.tsx (the interview
 * product page). Same shell, same design language, job-side content.
 */
import { useRef, useState } from "react";
import { useTheme } from "@/contexts/use-theme";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight, Sparkles, Briefcase, Building2, Radar, ListChecks,
  ShieldCheck, Clock, ChevronDown, Play,
} from "lucide-react";
import SiteHeader from "@/components/landing/site-header";
import SiteFooter from "@/components/landing/site-footer";
import { CardStack } from "@/components/ui/card-stack";
import { Marquee } from "@/components/ui/marquee";
import { ImageAutoSlider } from "@/components/ui/image-auto-slider";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { CountUp } from "@/components/motion/count-up";
import { ClipReveal } from "@/components/motion/clip-reveal";
import { useMotionSafe } from "@/components/motion/use-motion-safe";
import { staggerChild, staggerParent } from "@/lib/motion";
import arcResume from "@/assets/landing/arc-resume.svg";
import arcAnalytics from "@/assets/landing/arc-analytics.svg";
import arcOffer from "@/assets/landing/arc-offer.svg";
import arcQuestion from "@/assets/landing/arc-question.svg";
import tourDashboard from "@/assets/landing/tour-dashboard.svg";
import tourResults from "@/assets/landing/tour-results.svg";
import tourInterview from "@/assets/landing/tour-interview.svg";

const NAV_ITEMS = [
  { id: "how", label: "How It Works", href: "#how" },
  { id: "features", label: "Features", href: "#features" },
  { id: "status", label: "Tracking", href: "#status" },
  { id: "practice", label: "Interviews", href: "/practice" },
  { id: "demo", label: "Demo", href: "/demo" },
];

const MARQUEE_ITEMS = [
  "Career Page Agent", "Resume-Ranked Matches", "Why It Fits",
  "Applied / Pending Tracking", "No Spam Applications", "One Resume, Many Roles",
];

const STEPS = [
  { icon: Sparkles, title: "Set your targets", desc: "We read your resume and suggest the roles you qualify for — edit them, or add a role you're switching into.", color: "from-violet-500 to-fuchsia-500" },
  { icon: Radar, title: "The agent scans", desc: "It checks company career pages directly — the source, not a stale aggregator — for openings that match.", color: "from-cyan-500 to-blue-500" },
  { icon: ListChecks, title: "You review & apply", desc: "Every match is ranked against your resume with the reasons why. Apply with one click, track the rest.", color: "from-emerald-500 to-teal-500" },
];

const FEATURES = [
  { title: "Resume-Ranked Matching", desc: "Each opening is scored against your actual experience — not keyword soup.", image: arcResume },
  { title: "Straight From Career Pages", desc: "Roles pulled from company job boards, so you see them at the source.", image: tourDashboard },
  { title: "Why It Fits — And Doesn't", desc: "Every match explains its strengths and the gaps you'd need to cover.", image: arcAnalytics },
  { title: "Assisted, Never Reckless", desc: "The agent prepares the application; you press submit. No bans, no spam.", image: arcQuestion },
  { title: "One Status Table", desc: "Applied, pending, dismissed — the whole hunt in a single view.", image: tourResults },
  { title: "Many Roles, One Resume", desc: "Target Python and Frontend at once — matches for each, side by side.", image: arcOffer },
];

const STATUS_ROWS = [
  { company: "Acme Corp", role: "Senior Python Developer", location: "Remote", match: 92, status: "Applied", tone: "emerald" },
  { company: "Northwind", role: "Backend Engineer", location: "Bengaluru", match: 87, status: "Pending", reason: "Login wall — apply manually", tone: "amber" },
  { company: "Globex", role: "Full-Stack Developer", location: "Hybrid · Pune", match: 81, status: "New", tone: "violet" },
];

const STATS = [
  { value: "6", label: "Roles Per Resume" },
  { value: "24/7", label: "Agent Uptime" },
  { value: "0", label: "Spam Applications" },
  { value: "92%", label: "Top Match Score" },
];

const HEADLINE_TOP = ["Stop", "Refreshing", "Job", "Boards."];
const HEADLINE_BOTTOM = ["Let", "The", "Agent", "Hunt."];

const TONES: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

export default function FindJobsPage() {
  const { isDark } = useTheme();
  const motionSafe = useMotionSafe();
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
  const glassCard = isDark
    ? "border-white/10 bg-white/[0.04] text-white"
    : "border-slate-200 bg-white text-slate-900 shadow-sm";

  return (
    <div className={`min-h-screen overflow-x-clip transition-colors duration-300 ${
      isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"
    }`}>
      {motionSafe && (
        <motion.div
          className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-cyan-500 to-emerald-400"
          style={{ scaleX: progressScale }}
        />
      )}

      <SiteHeader navItems={NAV_ITEMS} />

      {/* ── Hero ── */}
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
          <div className={`absolute -top-32 right-1/4 h-[460px] w-[460px] rounded-full blur-3xl ${
            isDark ? "bg-cyan-500/25" : "bg-cyan-200/50"
          }`} />
          <div className={`absolute -bottom-40 left-1/5 h-[500px] w-[500px] rounded-full blur-3xl ${
            isDark ? "bg-emerald-500/20" : "bg-emerald-200/50"
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
                isDark ? "bg-cyan-500/25" : "bg-cyan-400/25"
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
                ? "border-cyan-500/30 bg-cyan-500/20 text-cyan-300"
                : "border-cyan-200 bg-cyan-50 text-cyan-700"
            }`}
          >
            <Briefcase size={14} />
            Job Search Agent
          </motion.div>

          <motion.h1
            className="font-display font-bold uppercase leading-[0.95] tracking-tight"
            initial="hidden"
            animate="visible"
            variants={staggerParent(0.08, 0.15)}
          >
            <span className="block text-[clamp(2.5rem,7.5vw,6.5rem)]">
              {HEADLINE_TOP.map((w, i) => (
                <motion.span key={i} variants={staggerChild(40, 0.5)} className="inline-block whitespace-pre">
                  {w}{" "}
                </motion.span>
              ))}
            </span>
            <span className="block bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent text-[clamp(2.5rem,7.5vw,6.5rem)]">
              {HEADLINE_BOTTOM.map((w, i) => (
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
            Your resume becomes a search. The agent checks company career pages, ranks every opening
            against your real experience, and hands you a shortlist worth your time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <a href="/jobs">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-9 py-4 text-lg font-semibold text-white shadow-[0_0_40px_-8px_rgba(6,182,212,0.7)]"
              >
                <Briefcase size={20} />
                Find my matches
              </motion.button>
            </a>
            <a href="/practice">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-9 py-4 text-lg font-semibold transition ${
                  isDark
                    ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    : "border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
                }`}
              >
                Practice interviews instead
                <ArrowRight size={20} />
              </motion.button>
            </a>
          </motion.div>
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
          className="border-y border-black/10 bg-gradient-to-r from-cyan-600 to-emerald-500 py-4 font-display text-lg font-bold uppercase tracking-widest text-white md:text-2xl"
        />
      </div>

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

      {/* ── How it works ── */}
      <section id="how" className={`px-6 py-28 ${sectionBg}`}>
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-20">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              How The{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Agent Works</span>
            </h2>
            <p className={`mt-4 text-xl ${subText}`}>Three steps, then it runs on its own</p>
          </Reveal>

          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ x: 12 }}
                  className={`flex flex-col items-start gap-6 rounded-3xl border p-8 backdrop-blur-xl md:flex-row md:items-center md:gap-12 md:p-10 ${glassCard}`}
                >
                  <span
                    aria-hidden="true"
                    className={`font-display text-7xl font-bold leading-none text-transparent md:text-9xl ${
                      isDark
                        ? "[-webkit-text-stroke:2px_rgba(6,182,212,0.5)]"
                        : "[-webkit-text-stroke:2px_rgba(6,182,212,0.35)]"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ${step.color}`}>
                    <step.icon className="text-white" size={30} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold md:text-3xl">{step.title}</h3>
                    <p className={`mt-2 text-lg ${subText}`}>{step.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features fan ── */}
      <section id="features" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-16 text-center">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              Built For{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Real Hunting</span>
            </h2>
            <p className={`mt-4 text-xl ${subText}`}>Signal over noise, every run</p>
          </Reveal>

          <Reveal>
            <CardStack
              items={FEATURES.map((f) => ({
                id: f.title,
                title: f.title,
                description: f.desc,
                imageSrc: f.image,
              }))}
              cardWidth={stackCardWidth}
              cardHeight={300}
              maxVisible={5}
              autoAdvance
              intervalMs={3400}
              renderCard={(item) => (
                <div className="relative h-full w-full bg-slate-950">
                  <img
                    src={item.imageSrc}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-6">
                    <h3 className="font-display text-2xl font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/80">{item.description}</p>
                  </div>
                </div>
              )}
            />
          </Reveal>
        </div>
      </section>

      {/* ── Auto-slider band ── */}
      <ImageAutoSlider
        className={`border-y ${isDark ? "border-white/10" : "border-slate-200"}`}
        images={[
          { src: tourDashboard }, { src: arcAnalytics }, { src: tourResults },
          { src: arcResume }, { src: tourInterview }, { src: arcOffer },
        ]}
      />

      {/* ── Status tracking preview ── */}
      <section id="status" className={`px-6 py-28 ${sectionBg}`}>
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-16 text-center">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              Every Application,{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Tracked</span>
            </h2>
            <p className={`mt-4 text-xl ${subText}`}>
              When the agent can't finish an application safely, it tells you why and hands you the link.
            </p>
          </Reveal>

          <ClipReveal>
            <div className={`overflow-hidden rounded-3xl border ${isDark ? "border-white/10" : "border-slate-200 shadow-lg"}`}>
              <table className="w-full text-left text-sm">
                <thead className={isDark ? "bg-white/[0.04] text-slate-300" : "bg-slate-100 text-slate-600"}>
                  <tr>
                    <th className="p-4 font-semibold">Company</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="hidden p-4 font-semibold sm:table-cell">Location</th>
                    <th className="p-4 font-semibold">Match</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-200"}`}>
                  {STATUS_ROWS.map((row) => (
                    <tr key={row.company} className={isDark ? "bg-slate-900/60" : "bg-white"}>
                      <td className="p-4 font-medium">{row.company}</td>
                      <td className="p-4">{row.role}</td>
                      <td className={`hidden p-4 sm:table-cell ${subText}`}>{row.location}</td>
                      <td className="p-4">
                        <span className="font-display font-bold">{row.match}%</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[row.tone]}`}>
                          {row.status}
                        </span>
                        {row.reason && (
                          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{row.reason}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ClipReveal>

          <StaggerGroup className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "No account bans", desc: "Nothing is submitted behind your back." },
              { icon: Clock, title: "Runs while you sleep", desc: "New matches waiting when you wake up." },
              { icon: Building2, title: "Straight from the source", desc: "Company career pages, not scrapers." },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className={`h-full rounded-2xl border p-6 ${glassCard}`}>
                  <item.icon className="mb-3 text-cyan-500" size={24} />
                  <h3 className="font-display text-lg font-bold">{item.title}</h3>
                  <p className={`mt-1 text-sm ${subText}`}>{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500/30 to-emerald-400/30 blur-[130px]" />
        </div>
        <div className="relative mx-auto max-w-5xl text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(2.5rem,8vw,6.5rem)] font-bold uppercase leading-[0.95] tracking-tight">
              Your Next Role Is{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Already Posted
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={`mx-auto mb-10 mt-6 max-w-2xl text-xl ${subText}`}>
              Point the agent at it. Then practise that exact interview on the other side.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a href="/jobs">
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-10 py-5 text-xl font-bold text-white shadow-[0_0_60px_-10px_rgba(6,182,212,0.8)]"
                >
                  Start job search
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
