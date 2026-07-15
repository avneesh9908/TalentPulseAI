import { useRef, useState } from "react";
import { useTheme } from "@/contexts/use-theme";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Menu, X, ArrowRight, Sparkles, Mic, BarChart3,
  Code, Brain, Target, Play, ChevronRight, ChevronDown,
  Github, Twitter, Linkedin, Sun, Moon
} from "lucide-react";
import { LimelightNav } from "@/components/ui/limelight-nav";
import { ArcGalleryHero } from "@/components/ui/arc-gallery-hero";
import { CircularFlipGallery } from "@/components/ui/circular-flip-gallery";
import { CardStack } from "@/components/ui/card-stack";
import { ImageAutoSlider } from "@/components/ui/image-auto-slider";
import { ImageSwiper } from "@/components/ui/image-swiper";
import { SocialIcons } from "@/components/ui/social-icons";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { CountUp } from "@/components/motion/count-up";
import { ClipReveal } from "@/components/motion/clip-reveal";
import { useMotionSafe } from "@/components/motion/use-motion-safe";
import { staggerChild, staggerParent } from "@/lib/motion";
import arcInterview from "@/assets/landing/arc-interview.svg";
import arcResume from "@/assets/landing/arc-resume.svg";
import arcOffer from "@/assets/landing/arc-offer.svg";
import arcScore from "@/assets/landing/arc-score.svg";
import arcQuestion from "@/assets/landing/arc-question.svg";
import arcAnalytics from "@/assets/landing/arc-analytics.svg";
import arcVoice from "@/assets/landing/arc-voice.svg";
import arcFeedback from "@/assets/landing/arc-feedback.svg";
import tourDashboard from "@/assets/landing/tour-dashboard.svg";
import tourInterview from "@/assets/landing/tour-interview.svg";
import tourResults from "@/assets/landing/tour-results.svg";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const motionSafe = useMotionSafe();
  const [finePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );
  // Fan stacks use fixed pixel card sizes — fit them to the viewport once.
  const [stackCardWidth] = useState(() =>
    typeof window === "undefined" ? 520 : Math.min(520, window.innerWidth - 72)
  );

  // Hero scroll choreography
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroTextY = useTransform(heroProgress, [0, 1], [0, 90]);
  const heroTextOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);

  // Page scroll progress bar
  const { scrollYProgress: pageProgress } = useScroll();
  const progressScale = useSpring(pageProgress, { stiffness: 120, damping: 30 });

  // Cursor glow (desktop + motion-safe only)
  const glowX = useMotionValue(-600);
  const glowY = useMotionValue(-600);
  const glowXs = useSpring(glowX, { stiffness: 60, damping: 20 });
  const glowYs = useSpring(glowY, { stiffness: 60, damping: 20 });
  const glowEnabled = motionSafe && finePointer;

  const interviewTracks = [
    { name: "Python Interview", icon: "🐍", color: "from-blue-500 to-cyan-500", topics: "Core Python, DSA, OOP" },
    { name: "JavaScript Interview", icon: "⚡", color: "from-yellow-500 to-orange-500", topics: "ES6+, Async, DOM" },
    { name: "React Interview", icon: "⚛️", color: "from-cyan-500 to-blue-500", topics: "Hooks, State, Components" },
    { name: "C++ DSA", icon: "💻", color: "from-violet-500 to-purple-500", topics: "STL, Algorithms, Pointers" },
    { name: "Node.js Backend", icon: "🟢", color: "from-emerald-500 to-teal-500", topics: "Express, APIs, MongoDB" },
    { name: "Data Science", icon: "📊", color: "from-pink-500 to-rose-500", topics: "Pandas, ML, Statistics" },
  ];

  const features = [
    { icon: Sparkles, title: "AI-Generated Questions", desc: "Dynamic, role-specific questions powered by AI" },
    { icon: Mic, title: "Video & Voice Analysis", desc: "Advanced cheating detection & behavior analysis" },
    { icon: BarChart3, title: "Performance Analytics", desc: "Detailed reports with skill-wise breakdown" },
    { icon: Target, title: "Resume-Based", desc: "Questions personalized to your experience" },
    { icon: Code, title: "Real Simulations", desc: "Practice like it's a real interview" },
    { icon: Brain, title: "AI Feedback", desc: "Instant improvement tips from AI mentor" },
  ];

  const steps = [
    { icon: Target, title: "Choose Interview", desc: "Select role, technology & difficulty level", color: "from-blue-500 to-cyan-500" },
    { icon: Mic, title: "AI Interview", desc: "Answer AI-generated questions via video/audio", color: "from-violet-500 to-purple-500" },
    { icon: BarChart3, title: "Instant Report", desc: "Get score, strengths & improvement tips", color: "from-emerald-500 to-teal-500" },
  ];

  const stats = [
    { value: "50K+", label: "Interviews Conducted" },
    { value: "85%", label: "Success Rate" },
    { value: "24/7", label: "AI Availability" },
    { value: "4.9★", label: "User Rating" },
  ];

  const tourSlides = [
    { src: tourInterview, alt: "Live AI interview screen with question, camera and timer", caption: "Answer AI questions live — with voice, video and a timer" },
    { src: tourResults, alt: "Results screen with overall score, strengths and improvements", caption: "Instant scored report with strengths & next steps" },
    { src: tourDashboard, alt: "Dashboard with interview stats and progress charts", caption: "Track your progress across every practice interview" },
  ];

  // Placeholder testimonials (marketing copy — replace with real user quotes)
  const testimonials = [
    { quote: "The questions actually came from my resume — my real projects, my stack. Way closer to a real interview than anything else I tried.", name: "Priya S.", role: "Frontend Developer" },
    { quote: "Practiced three nights in a row, walked into my on-site relaxed. The instant feedback on my weak answers is what did it.", name: "Rahul M.", role: "Backend Engineer" },
    { quote: "The score report told me exactly what to fix — fewer buzzwords, more numbers. Two weeks later I cleared my first tech round.", name: "Ananya K.", role: "Data Analyst" },
  ];

  const navItems = [
    { id: "features", label: "Features", href: "#features" },
    { id: "how-it-works", label: "How It Works", href: "#how-it-works" },
    { id: "tracks", label: "Tracks", href: "#tracks" },
    { id: "explore", label: "Explore", href: "/explore" },
    { id: "demo", label: "Demo", href: "/demo" },
  ];

  const marqueeItems = [
    "AI-Powered Interviews", "Resume-Based Questions", "Instant Scoring",
    "Voice & Video Answers", "Personalized Feedback", "Real Interview Pressure",
  ];

  const arcImages = [
    arcResume, arcQuestion, arcInterview, arcVoice,
    arcScore, arcAnalytics, arcFeedback, arcOffer,
  ];

  const headlineTop = "Practice Real AI Interviews.";
  const headlineBottom = "Get Instant Feedback.";

  const subTextClass = isDark ? "text-slate-400" : "text-slate-500";
  const sectionBgClass = isDark ? "bg-slate-900/50" : "bg-slate-50";
  const glassCard = isDark
    ? "border-white/10 bg-white/[0.04] text-white"
    : "border-slate-200 bg-white text-slate-900 shadow-sm";

  return (
    <div className={`min-h-screen overflow-x-clip transition-colors duration-300 ${
      isDark
        ? "bg-slate-950 text-white"
        : "bg-white text-slate-900"
    }`}>
      {/* Scroll progress bar */}
      {motionSafe && (
        <motion.div
          className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-violet-600 to-cyan-500"
          style={{ scaleX: progressScale }}
        />
      )}

      {/* ── Header ── */}
      <header className={`relative z-50 sticky top-0 backdrop-blur-xl border-b ${
        isDark
          ? "bg-slate-950/70 border-white/10 text-white"
          : "bg-white/70 border-slate-200 text-slate-900"
      }`}>
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold font-display">
                TalentPulse<span className="text-cyan-500">AI</span>
              </span>
            </motion.div>

            {/* Desktop Menu — limelight nav */}
            <div className="hidden md:block">
              <LimelightNav items={navItems} />
            </div>

            {/* Desktop CTA + Theme toggle */}
            <div className="hidden md:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={`p-2 rounded-lg transition ${
                  isDark
                    ? "bg-slate-800 text-yellow-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              <a href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  }`}
                >
                  Login
                </motion.button>
              </a>
              <a href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-medium transition shadow-lg"
                >
                  Get Started Free
                </motion.button>
              </a>
            </div>

            {/* Mobile right controls */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={`p-2 rounded-lg transition ${
                  isDark ? "bg-slate-800 text-yellow-300" : "bg-slate-100 text-slate-600"
                }`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                className={`p-2 rounded-lg transition ${
                  isDark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden mt-4 py-4 border-t ${
                isDark ? "border-white/10" : "border-slate-200"
              }`}
            >
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`transition text-sm font-medium ${
                      isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-violet-600"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
                <div className={`flex flex-col gap-2 pt-4 border-t ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}>
                  <a
                    href="/auth/login"
                    className={`px-4 py-2 rounded-lg text-center text-sm font-medium ${
                      isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    Login
                  </a>
                  <a
                    href="/auth/register"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-center text-sm font-medium"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </nav>
      </header>

      {/* ── Hero — immersive, type-first ── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-6"
        onMouseMove={
          glowEnabled
            ? (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                glowX.set(e.clientX - rect.left);
                glowY.set(e.clientY - rect.top);
              }
            : undefined
        }
      >
        {/* Backdrop: glow orbs + dot grid */}
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute -top-32 left-1/4 h-[480px] w-[480px] rounded-full blur-3xl ${
            isDark ? "bg-violet-600/25" : "bg-violet-300/40"
          }`} />
          <div className={`absolute -bottom-40 right-1/5 h-[520px] w-[520px] rounded-full blur-3xl ${
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
          {/* Cursor-follow glow */}
          {glowEnabled && (
            <motion.div
              className={`absolute h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] ${
                isDark ? "bg-violet-500/25" : "bg-violet-400/25"
              }`}
              style={{ left: glowXs, top: glowYs }}
            />
          )}
        </div>

        {/* Arc gallery + copy */}
        <div className="relative z-10 w-full pt-6">
        <ArcGalleryHero images={arcImages}>
        <motion.div
          className="mx-auto max-w-5xl px-2 pb-20 text-center"
          style={motionSafe ? { y: heroTextY, opacity: heroTextOpacity } : undefined}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-8 inline-block rounded-full border px-4 py-2 text-sm ${
              isDark
                ? "border-violet-500/30 bg-violet-500/20 text-violet-300"
                : "border-violet-200 bg-violet-50 text-violet-600"
            }`}
          >
            🚀 AI-Powered Interview Platform
          </motion.div>

          <motion.h1
            className="font-display font-bold uppercase leading-[0.95] tracking-tight"
            initial="hidden"
            animate="visible"
            variants={staggerParent(0.08, 0.15)}
          >
            <span className="block text-[clamp(2.5rem,7.5vw,6.5rem)]">
              {headlineTop.split(" ").map((word, i) => (
                <motion.span key={i} variants={staggerChild(40, 0.5)} className="inline-block whitespace-pre">
                  {word}{" "}
                </motion.span>
              ))}
            </span>
            <span className="block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent text-[clamp(2.5rem,7.5vw,6.5rem)]">
              {headlineBottom.split(" ").map((word, i) => (
                <motion.span key={i} variants={staggerChild(40, 0.5)} className="inline-block whitespace-pre">
                  {word}{" "}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className={`mx-auto mb-10 mt-8 max-w-2xl text-lg md:text-xl ${subTextClass}`}
          >
            TalentPulseAI simulates real interviews using advanced AI. Answer via video/audio, get scored in seconds, and improve with personalized smart feedback.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <a href="/demo">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-9 py-4 text-lg font-semibold text-white shadow-[0_0_40px_-8px_rgba(139,92,246,0.7)] transition hover:from-violet-500 hover:to-cyan-500"
              >
                <Play size={20} />
                Try Free Demo
              </motion.button>
            </a>
            <a href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-9 py-4 text-lg font-semibold transition ${
                  isDark
                    ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    : "border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
                }`}
              >
                Get Started Free
                <ArrowRight size={20} />
              </motion.button>
            </a>
          </motion.div>
        </motion.div>
        </ArcGalleryHero>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={motionSafe ? { y: [0, 8, 0] } : undefined}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <ChevronDown className={subTextClass} size={26} />
        </motion.div>
      </section>

      {/* ── Marquee band ── */}
      <div className="-rotate-1 scale-[1.02]">
        <Marquee
          items={marqueeItems}
          className="border-y border-black/10 bg-gradient-to-r from-violet-600 to-cyan-600 py-4 font-display text-lg font-bold uppercase tracking-widest text-white md:text-2xl"
        />
      </div>

      {/* ── Stats — giant count-ups ── */}
      <section className="px-6 py-24">
        <StaggerGroup className="mx-auto grid max-w-6xl grid-cols-2 gap-10 md:grid-cols-4">
          {stats.map((stat, i) => (
            <StaggerItem key={i} className="text-center">
              <CountUp
                value={stat.value}
                className={`font-display text-5xl font-bold md:text-7xl ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              />
              <div className={`mt-3 text-sm uppercase tracking-wider ${subTextClass}`}>{stat.label}</div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ── How It Works — huge numbered rows ── */}
      <section id="how-it-works" className={`px-6 py-28 ${sectionBgClass}`}>
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-20">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              How It{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className={`mt-4 text-xl ${subTextClass}`}>Get started in 3 simple steps</p>
          </Reveal>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ x: 12 }}
                  className={`flex flex-col items-start gap-6 rounded-3xl border p-8 backdrop-blur-xl md:flex-row md:items-center md:gap-12 md:p-10 ${glassCard}`}
                >
                  <span
                    aria-hidden="true"
                    className={`font-display text-7xl font-bold leading-none text-transparent md:text-9xl ${
                      isDark
                        ? "[-webkit-text-stroke:2px_rgba(139,92,246,0.5)]"
                        : "[-webkit-text-stroke:2px_rgba(139,92,246,0.35)]"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ${step.color}`}>
                    <step.icon className="text-white" size={30} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold md:text-3xl">{step.title}</h3>
                    <p className={`mt-2 text-lg ${subTextClass}`}>{step.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — fan card stack ── */}
      <section id="features" className="px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-16 text-center">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              Why{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">TalentPulseAI?</span>
            </h2>
            <p className={`mt-4 text-xl ${subTextClass}`}>Powerful features to ace your interviews</p>
          </Reveal>

          <Reveal>
            <CardStack
              items={features.map((f, i) => ({
                id: f.title,
                title: f.title,
                description: f.desc,
                icon: f.icon,
                imageSrc: [arcQuestion, tourInterview, tourDashboard, arcResume, arcInterview, arcFeedback][i],
              }))}
              cardWidth={stackCardWidth}
              cardHeight={300}
              maxVisible={5}
              autoAdvance
              intervalMs={3200}
              renderCard={(item) => {
                const Icon = item.icon;
                return (
                  <div className="relative h-full w-full bg-slate-950">
                    {/* Full-bleed artwork */}
                    <img
                      src={item.imageSrc}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable={false}
                      loading="eager"
                    />
                    {/* Readability gradient */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    {/* Content over the image */}
                    <div className="relative z-10 flex h-full flex-col justify-end p-6">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                        <Icon className="text-white" size={22} />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/80">{item.description}</p>
                    </div>
                  </div>
                );
              }}
            />
          </Reveal>
        </div>
      </section>

      {/* ── Image auto-slider band ── */}
      <ImageAutoSlider
        className={`border-y ${isDark ? "border-white/10" : "border-slate-200"}`}
        images={[
          { src: tourInterview },
          { src: arcScore },
          { src: tourResults },
          { src: arcAnalytics },
          { src: tourDashboard },
          { src: arcFeedback },
        ]}
      />

      {/* ── Interview Tracks — interactive selector ── */}
      <section id="tracks" className={`px-6 py-28 ${sectionBgClass}`}>
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-20 text-center">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              Interview{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Tracks</span>
            </h2>
            <p className={`mt-4 text-xl ${subTextClass}`}>Choose your domain and start practicing</p>
          </Reveal>

          <Reveal>
            <CircularFlipGallery
              radius={280}
              items={interviewTracks.map((track) => ({
                id: track.name,
                front: (
                  <>
                    <span className="text-5xl" aria-hidden="true">{track.icon}</span>
                    <span className="font-display text-lg font-bold leading-tight">{track.name}</span>
                    <span className={`text-xs ${subTextClass}`}>Hover to flip</span>
                  </>
                ),
                back: (
                  <>
                    <span className={`text-sm ${subTextClass}`}>{track.topics}</span>
                    <span className={`flex items-center justify-center font-semibold ${
                      isDark ? "text-violet-400" : "text-violet-600"
                    }`}>
                      Start Practice
                      <ChevronRight size={20} />
                    </span>
                  </>
                ),
              }))}
            />
          </Reveal>
        </div>
      </section>

      {/* ── Product tour — image swiper in glow frame ── */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-20 text-center">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              See It In{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className={`mt-4 text-xl ${subTextClass}`}>From first question to final report</p>
          </Reveal>
          <ClipReveal>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-violet-600/25 to-cyan-500/25 blur-2xl" />
              <div className="relative">
                <ImageSwiper slides={tourSlides} />
              </div>
            </div>
          </ClipReveal>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={`px-6 py-28 ${sectionBgClass}`}>
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-20 text-center">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-none tracking-tight">
              Loved by{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Candidates</span>
            </h2>
            <p className={`mt-4 text-xl ${subTextClass}`}>Real practice, real confidence, real offers</p>
          </Reveal>
          <CardStack
            items={testimonials.map((t) => ({
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
                <blockquote className="text-base leading-relaxed md:text-lg">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-sm font-bold text-white"
                    aria-hidden="true"
                  >
                    {item.title.charAt(0)}
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className={`block text-xs ${subTextClass}`}>{item.description}</span>
                  </span>
                </figcaption>
              </figure>
            )}
          />
        </div>
      </section>

      {/* ── CTA finale — massive type ── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-600/30 to-cyan-500/30 blur-[130px]" />
        </div>
        <div className="relative mx-auto max-w-5xl text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(2.5rem,8vw,7rem)] font-bold uppercase leading-[0.95] tracking-tight">
              Ready to{" "}
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                Crack
              </span>{" "}
              Your Next Interview?
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={`mx-auto mb-10 mt-6 max-w-2xl text-xl ${subTextClass}`}>
              Start your AI-powered mock interview today and land your dream tech job.
            </p>
            <a href="/demo" className="inline-block">
              <motion.button
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-10 py-5 text-xl font-bold text-white shadow-[0_0_60px_-10px_rgba(139,92,246,0.8)] transition hover:from-violet-500 hover:to-cyan-500"
              >
                Start Free Interview Now
                <ArrowRight size={26} />
              </motion.button>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`relative border-t px-6 py-12 ${
        isDark ? "border-white/10" : "border-slate-200"
      }`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-12 md:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg">
                  <Sparkles className="text-white" size={20} />
                </div>
                <span className="font-display text-xl font-bold">
                  TalentPulse<span className="text-cyan-500">AI</span>
                </span>
              </div>
              <p className={`text-sm ${subTextClass}`}>
                AI-powered interview platform to help you ace your tech interviews.
              </p>
              <SocialIcons
                className="mt-4"
                links={[
                  { label: "Twitter", href: "#", icon: <Twitter size={16} /> },
                  { label: "GitHub", href: "#", icon: <Github size={16} /> },
                  { label: "LinkedIn", href: "#", icon: <Linkedin size={16} /> },
                ]}
              />
            </div>

            {/* Product */}
            <div>
              <h3 className="mb-4 font-bold">Product</h3>
              <ul className={`space-y-2 text-sm ${subTextClass}`}>
                <li><a href="/explore" className={`hover:${isDark ? "text-white" : "text-violet-600"} transition`}>Explore</a></li>
                <li><a href="/demo" className={`hover:${isDark ? "text-white" : "text-violet-600"} transition`}>Demo</a></li>
                <li><a href="#features" className={`hover:${isDark ? "text-white" : "text-violet-600"} transition`}>Features</a></li>
                <li><a href="#tracks" className={`hover:${isDark ? "text-white" : "text-violet-600"} transition`}>Tracks</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 font-bold">Company</h3>
              <ul className={`space-y-2 text-sm ${subTextClass}`}>
                <li><a href="#" className="transition hover:text-violet-600">About Us</a></li>
                <li><a href="#" className="transition hover:text-violet-600">Blog</a></li>
                <li><a href="#" className="transition hover:text-violet-600">Careers</a></li>
                <li><a href="#" className="transition hover:text-violet-600">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="mb-4 font-bold">Legal</h3>
              <ul className={`space-y-2 text-sm ${subTextClass}`}>
                <li><a href="#" className="transition hover:text-violet-600">Privacy Policy</a></li>
                <li><a href="#" className="transition hover:text-violet-600">Terms of Service</a></li>
                <li><a href="#" className="transition hover:text-violet-600">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className={`flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm md:flex-row ${subTextClass} ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}>
            <p>© {new Date().getFullYear()} TalentPulseAI. All rights reserved.</p>
            <p>Made with ❤️ for aspiring developers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
