/**
 * Dashboard — the hub for both sides.
 *
 * UI: the phosphor-terminal design (2026-09-24) — restyle only. Data, copy and
 * sections are exactly the pre-phosphor dashboard's
 * (docs/backup/dashboard-before-phosphor.tsx.txt): the real /user/overview
 * stats, score chart and Recent list, plus the sections that were already
 * sample content (skill radar, Upcoming, AI Suggestions, Achievements,
 * Improvement, Streak), kept as they were. The stat, launcher, suggestion and
 * row cards all share the one card hover from `phos/tokens` — the border
 * brightens to the accent, a soft bloom lifts off, and the card rises 2px.
 */
import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { authService } from "@/services/authService";
import { motion } from "framer-motion";
import { CountUp } from "@/components/motion/count-up";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Users, Calendar, Trophy, Target, TrendingUp, Zap, Award, Star, ChevronRight, Activity, Mic, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserOverview, type UserOverview } from "@/api/userService";
import { getInterviewResults } from "@/api/interviewService";
import { NumberedCard } from "@/components/phos";
import { PH_CARD_HOVER, PH_MONO, PH_MONO_RAW } from "@/components/phos/tokens";

/**
 * The four stat cards, from the real payload. `change` used to carry invented
 * deltas (+12% / +8% / -5% / +18%); there is no time series behind a delta, so
 * the slot now states what the number actually counts.
 *
 * Passed/Failed split on `stats.pass_score`, which the SERVER decides — it is
 * the product's existing 65 band, shared with the result and profile pages.
 */
const buildStats = (o: UserOverview | null) => {
  const st = o?.stats;
  const scored = (st?.passed ?? 0) + (st?.failed ?? 0);
  return [
    { id: "total", title: "Total Interviews", value: st?.total_interviews ?? 0, change: `${st?.completed ?? 0} completed`, icon: Users },
    { id: "passed", title: "Passed", value: st?.passed ?? 0, change: `${st?.pass_score ?? 65}+ score`, icon: Trophy },
    { id: "failed", title: "Failed", value: st?.failed ?? 0, change: `of ${scored} scored`, icon: Target },
    { id: "avg", title: "Average Score", value: st?.average_score == null ? "—" : `${st.average_score}%`, change: st?.best_score == null ? "no scores yet" : `best ${st.best_score}%`, icon: TrendingUp },
  ];
};

const skillRadar = [
  { skill: "Problem Solving", current: 85, previous: 75 },
  { skill: "Communication", current: 70, previous: 65 },
  { skill: "Coding", current: 78, previous: 70 },
  { skill: "System Design", current: 60, previous: 55 },
  { skill: "Domain Knowledge", current: 74, previous: 68 },
];

const upcoming = [
  { id: 1, role: "Frontend Developer", company: "TechCorp", date: "2025-12-15", time: "10:00 AM", type: "Live", difficulty: "Medium" },
  { id: 2, role: "ML Intern", company: "AI Labs", date: "2025-12-20", time: "02:30 PM", type: "Recorded", difficulty: "Easy" },
  { id: 3, role: "Product Eng.", company: "StartupX", date: "2026-01-05", time: "11:00 AM", type: "Live", difficulty: "Hard" },
];

const achievements = [
  { id: 1, title: "First Win", description: "Passed your first interview", unlocked: true, icon: Trophy },
  { id: 2, title: "Streak Master", description: "5 consecutive passes", unlocked: true, icon: Zap },
  { id: 3, title: "Perfect Score", description: "Score 100 in any interview", unlocked: false, icon: Star },
  { id: 4, title: "Dedicated", description: "Complete 50 interviews", unlocked: false, icon: Award },
];

const suggestions = [
  { title: "Practice: Algo Problems", desc: "Focus on arrays & graphs. Try timed mocks." },
  { title: "Improve Communication", desc: "Record explanations and compare with samples." },
  { title: "System Design Primer", desc: "Review scalability patterns for senior roles." },
];

// ---------- Phosphor styling ----------
const CARD = "rounded-[16px] border border-ph-line-strong bg-ph-surface p-5 sm:p-6";
const WELL = "rounded-[12px] border border-ph-line bg-black";
const LABEL_MD = "text-[13px] leading-4 tracking-[0.02em] font-medium";
const BODY_SM = "text-[12px] leading-[18px] tracking-[0.01em]";
const H_SM = "font-st-display text-[18px] leading-[26px] tracking-[-0.01em] font-medium";
const H_MD = "font-st-display text-[22px] leading-7 tracking-[-0.02em] font-semibold";

/** Recharts needs real colour strings; these are the phosphor palette's. */
const chart = {
  accent: "#00ff41",
  line: "#f5f1ea",
  grid: "rgba(134,239,172,0.12)",
  axis: "rgba(245,241,234,0.55)",
  surface: "#000000",
  ink: "#f5f1ea",
  border: "rgba(134,239,172,0.32)",
};

/*
 * Two colours only, so difficulty is carried by fill and weight rather than by
 * hue: filled phosphor, a cream outline, then a plain hairline chip.
 */
const DIFFICULTY_TONE: Record<string, string> = {
  Easy: "border-ph-green/50 bg-ph-green/10 text-ph-green",
  Medium: "border-ph-ink/30 bg-ph-ink/[0.06] text-ph-ink",
  Hard: "border-ph-line-bright bg-ph-surface text-ph-ink-muted",
};

// ---------- Small UI Components ----------
interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: ComponentType<{ className?: string; size?: number | string }>;
}

function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  return (
    <div
      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-[16px] border border-ph-line-strong bg-ph-surface p-5 ${PH_CARD_HOVER}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className={`${PH_MONO} text-ph-ink-soft`}>{title}</span>
        <Icon size={16} className="text-ph-green transition-transform duration-200 group-hover:scale-110" />
      </div>
      <div className="tnum my-1 font-st-display text-[44px] font-semibold leading-[52px] tracking-[-0.04em] text-ph-ink">
        {/* Real metric: must not sit at 0 while below the fold. */}
        <CountUp value={String(value)} startOnMount />
      </div>
      <span className={`${PH_MONO_RAW} mt-1 flex items-center gap-2 text-ph-ink-soft`}>
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45 bg-ph-green" />
        {change}
      </span>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${CARD} ${className}`}>{children}</div>;
}

function CardHeading({
  icon: Icon,
  iconClass,
  title,
  subtitle,
  action,
}: {
  icon: ComponentType<{ className?: string; size?: number | string }>;
  iconClass: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className={`${H_SM} flex items-center gap-2 text-ph-ink`}>
          <Icon className={iconClass} size={16} />
          {title}
        </h3>
        <p className={`${PH_MONO_RAW} mt-1 text-ph-ink-soft`}>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

// ---------- Main Page ----------
export default function UserDashboardPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUserFromStorage();
  const displayName = currentUser?.full_name ?? currentUser?.email ?? "there";

  const [overview, setOverview] = useState<UserOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [openingReport, setOpeningReport] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUserOverview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setOverviewError(
            err instanceof Error ? err.message : "Could not load your interview history."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => buildStats(overview), [overview]);

  /*
   * The performance chart. `score` is every scored attempt oldest-first; the
   * second series is the pass band the server reports, drawn as a flat
   * reference line — the old "target" series was invented week-by-week numbers.
   */
  const passScore = overview?.stats.pass_score ?? 65;
  const scoreHistory = useMemo(
    () =>
      (overview?.score_trend ?? []).map((pt, i) => ({
        name: pt.completed_at
          ? new Date(pt.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
          : `#${i + 1}`,
        score: pt.score,
        target: passScore,
      })),
    [overview, passScore]
  );

  const recent = overview?.recent_completed ?? [];

  /** Rehydrate a scored interview into the report page — same contract as /profile. */
  const openReport = useCallback(
    async (interviewId: string) => {
      setOpeningReport(interviewId);
      setOverviewError(null);
      try {
        const result = await getInterviewResults(interviewId);
        const answered = result.feedback?.question_feedback?.length ?? 0;
        const resultState = {
          result,
          totalQuestions: result.feedback?.total_questions ?? answered,
          answeredQuestions: answered,
        };
        try {
          sessionStorage.setItem("talentpulse_last_result", JSON.stringify(resultState));
        } catch {
          /* ignore quota errors */
        }
        navigate("/interview/result", { state: resultState });
      } catch (err) {
        setOverviewError(
          err instanceof Error ? err.message : "Could not open that interview report."
        );
      } finally {
        setOpeningReport(null);
      }
    },
    [navigate]
  );

  const initial = String(displayName).charAt(0).toUpperCase();

  return (
    <div className="ph-grid relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-ph-bg font-st-body text-[14px] leading-5 text-ph-ink antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-[-140px] h-[350px] w-[500px] rounded-full bg-ph-green/[0.06] blur-[130px]"
      />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-8">
        {/* Header Row */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <div className="flex items-start gap-5 md:items-center">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-ph-green/40 bg-ph-green/[0.06] font-st-display text-[26px] font-semibold text-ph-green">
                {initial}
              </div>
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-black bg-ph-green shadow-[0_0_10px_#00ff41]"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-st-display text-[28px] font-semibold leading-9 tracking-[-0.025em] text-ph-ink sm:text-[34px] sm:leading-[42px]">
                Welcome back, <span className="ph-glow text-ph-green">{displayName}</span>
              </h1>
              <p className={`${PH_MONO_RAW} mt-1.5 text-ph-ink-soft`}>Your hub for both sides — practice interviews and hunt for jobs</p>
            </div>
          </div>
          {overviewError && (
            <p className={`${BODY_SM} mt-4 rounded-[12px] border border-ph-ink/30 bg-ph-ink/[0.06] px-4 py-2.5 text-ph-ink`}>
              {overviewError}
            </p>
          )}
        </motion.div>

        {/* Two sides — the hub's job is to launch either one */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              id: "interview",
              label: "Interview Practice",
              desc: "Rehearse with AI questions built from your resume",
              action: "Start an interview",
              to: "/interview/select-role",
              icon: Mic,
            },
            {
              id: "jobs",
              label: "Job Search",
              desc: "Let the agent scan career pages and rank matches",
              action: "Find matching jobs",
              to: "/jobs",
              icon: Briefcase,
            },
          ].map((side, i) => (
            <motion.button
              key={side.id}
              type="button"
              onClick={() => navigate(side.to)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 + i * 0.08 }}
              className={`group relative overflow-hidden rounded-[16px] border border-ph-line-strong bg-ph-surface p-5 text-left ${PH_CARD_HOVER}`}
            >
              <div className="relative z-10 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-ph-green/30 bg-ph-green/[0.06] text-ph-green">
                  <side.icon size={20} />
                </div>
                <div>
                  <h3 className={`${H_MD} text-ph-ink`}>{side.label}</h3>
                  <p className={`${BODY_SM} mt-1 text-ph-ink-muted`}>{side.desc}</p>
                </div>
              </div>
              <span className={`${PH_MONO} relative z-10 mt-4 inline-flex items-center gap-1.5 text-ph-green transition-all group-hover:gap-2.5`}>
                {side.action}
                <ChevronRight size={14} />
              </span>
            </motion.button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
              <StatCard title={s.title} value={s.value} change={s.change} icon={s.icon} />
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left column */}
          <div className="flex flex-col gap-4 lg:col-span-8">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeading
                  icon={TrendingUp}
                  iconClass="text-ph-green"
                  title="Performance Over Time"
                  subtitle={`Every scored attempt against the ${passScore} pass band`}
                  action={
                    <span className={`${PH_MONO} rounded-full border border-ph-green/45 bg-ph-green/10 px-2.5 py-1 text-ph-green`}>
                      {scoreHistory.length} scored
                    </span>
                  }
                />

                {scoreHistory.length === 0 ? (
                  <div className={`flex h-[240px] flex-col items-center justify-center text-center ${WELL}`}>
                    <p className={`${BODY_SM} text-ph-ink-muted`}>No scored interviews yet.</p>
                    <button
                      onClick={() => navigate("/interview/select-role")}
                      className={`${PH_MONO} mt-2 text-ph-green hover:underline`}
                    >
                      Take your first interview
                    </button>
                  </div>
                ) : (
                  <div className={`${WELL} p-4`} style={{ width: "100%", height: 272 }}>
                    <ResponsiveContainer>
                      <AreaChart data={scoreHistory}>
                        <defs>
                          <linearGradient id="phColorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chart.accent} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={chart.accent} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="phScoreLine" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#15803d" />
                            <stop offset="55%" stopColor="#00ff41" />
                            <stop offset="100%" stopColor="#f5f1ea" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke={chart.grid} vertical={false} />
                        <XAxis dataKey="name" stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke={chart.axis} fontSize={11} tickLine={false} axisLine={false} width={32} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: chart.surface,
                            border: `1px solid ${chart.border}`,
                            borderRadius: "12px",
                            color: chart.ink,
                            fontSize: "12px",
                          }}
                        />
                        <Area type="monotone" dataKey="score" stroke="url(#phScoreLine)" strokeWidth={2.5} fill="url(#phColorScore)" dot={{ r: 3.5, fill: "#000000", stroke: chart.accent, strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="target" stroke={chart.axis} strokeWidth={1.5} strokeDasharray="6 6" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className={`${WELL} p-3.5`}>
                    <div className={`${PH_MONO} mb-1.5 text-ph-green`}>Best Score</div>
                    <div className="tnum font-st-display text-[24px] font-semibold text-ph-ink">{overview?.stats.best_score ?? "—"}</div>
                  </div>
                  <div className={`${WELL} p-3.5`}>
                    <div className={`${PH_MONO} mb-1.5 text-ph-ink-soft`}>Improvement</div>
                    <div className="tnum font-st-display text-[24px] font-semibold text-ph-ink">+18%</div>
                  </div>
                  <div className={`${WELL} p-3.5`}>
                    <div className={`${PH_MONO} mb-1.5 text-ph-ink-soft`}>Current Streak</div>
                    <div className="tnum font-st-display text-[24px] font-semibold text-ph-ink">5 🔥</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* AI Suggestions — three numbered cards */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeading icon={Zap} iconClass="text-ph-green" title="AI Suggestions" subtitle="Personalized tips" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {suggestions.map((tip, i) => (
                    <NumberedCard
                      key={tip.title}
                      index={String(i + 1).padStart(2, "0")}
                      icon={Zap}
                      title={tip.title}
                    >
                      <p>{tip.desc}</p>
                    </NumberedCard>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Radar Skills */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
              <Card>
                <CardHeading icon={Star} iconClass="text-ph-green" title="Skill Analysis" subtitle="Current vs previous performance" />
                <div className={WELL} style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <RadarChart outerRadius={90} data={skillRadar}>
                      <PolarGrid stroke={chart.grid} />
                      <PolarAngleAxis dataKey="skill" stroke={chart.axis} fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={chart.grid} fontSize={10} />
                      <Radar name="Current" dataKey="current" stroke={chart.accent} fill={chart.accent} fillOpacity={0.3} />
                      <Radar name="Previous" dataKey="previous" stroke={chart.axis} fill={chart.line} fillOpacity={0.08} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeading icon={Calendar} iconClass="text-ph-green" title="Upcoming" subtitle={`${upcoming.length} scheduled`} />
                <div className="flex flex-col gap-2.5">
                  {upcoming.map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={`rounded-[12px] border border-ph-line bg-black p-3.5 ${PH_CARD_HOVER}`}
                    >
                      <div className="mb-2.5 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ph-green/30 bg-ph-green/[0.06] font-ph-mono text-[13px] text-ph-green">
                            {u.company.charAt(0)}
                          </div>
                          <div>
                            <div className={`${LABEL_MD} font-medium text-ph-ink`}>{u.role}</div>
                            <div className={`${PH_MONO_RAW} text-ph-ink-soft`}>{u.company}</div>
                          </div>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-0.5 font-ph-mono text-[10px] uppercase tracking-[0.12em] ${DIFFICULTY_TONE[u.difficulty] ?? DIFFICULTY_TONE.Hard}`}
                        >
                          {u.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className={`${PH_MONO_RAW} text-ph-ink-soft`}>
                          {u.date} · {u.time}
                        </div>
                        <button className={`${PH_MONO} rounded-full border border-ph-line-strong px-3 py-1 text-ph-ink transition-colors hover:border-ph-green hover:text-ph-green`}>
                          Join
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <button className={`${PH_MONO} ml-auto flex items-center gap-1.5 text-ph-green transition hover:opacity-70`}>
                    View all <ChevronRight size={14} />
                  </button>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeading
                  icon={Activity}
                  iconClass="text-ph-green"
                  title="Recent"
                  subtitle={recent.length === 0 ? "No scored attempts yet" : `Last ${recent.length} scored`}
                />
                <div className="flex flex-col gap-2">
                  {recent.length === 0 && (
                    <p className={`${BODY_SM} rounded-[12px] border border-ph-line bg-black p-4 text-center text-ph-ink-muted`}>
                      Finish an interview and it will show up here.
                    </p>
                  )}
                  {recent.map((r, i) => {
                    const score = r.score ?? 0;
                    const passed = score >= passScore;
                    return (
                      <motion.button
                        type="button"
                        key={r.interview_id}
                        onClick={() => openReport(r.interview_id)}
                        disabled={openingReport !== null}
                        aria-label={`Open ${r.role} report`}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className={`w-full rounded-[12px] border border-ph-line bg-black p-3 text-left disabled:opacity-60 ${PH_CARD_HOVER}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className={`${LABEL_MD} truncate font-medium text-ph-ink`}>{r.role}</div>
                            <div className={`${PH_MONO_RAW} truncate text-[10px] uppercase tracking-[0.14em] text-ph-ink-soft`}>
                              {r.difficulty} · {r.completed_at ? new Date(r.completed_at).toLocaleDateString() : "date unknown"}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className={`${PH_MONO} ${passed ? "text-ph-green" : "text-ph-ink"}`}>
                              {openingReport === r.interview_id ? "Opening…" : passed ? "Pass" : "Fail"}
                            </div>
                            <div className={`${PH_MONO_RAW} tnum mt-1 text-ph-ink-soft`}>Score: {r.score ?? "—"}</div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => navigate("/profile")}
                    className={`${PH_MONO} ml-auto flex items-center gap-1.5 text-ph-green transition hover:opacity-70`}
                  >
                    Full history <ChevronRight size={14} />
                  </button>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
              <Card>
                <CardHeading icon={Trophy} iconClass="text-ph-green" title="Achievements" subtitle="2 of 4 unlocked" />
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`rounded-[12px] border p-3.5 ${
                        ach.unlocked
                          ? `border-ph-green/30 bg-ph-green/[0.05] ${PH_CARD_HOVER}`
                          : "border-dashed border-ph-line bg-black opacity-60"
                      }`}
                    >
                      <ach.icon className={ach.unlocked ? "text-ph-green" : "text-ph-ink-soft"} size={18} />
                      <div className={`${LABEL_MD} mt-2.5 font-medium text-ph-ink`}>{ach.title}</div>
                      <div className={`${BODY_SM} mt-1 text-ph-ink-muted`}>{ach.description}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
