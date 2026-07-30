import { useCallback, useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import {
  Activity,
  Award,
  BarChart2,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  Mail,
  Mic,
  Phone,
  PlayCircle,
  RefreshCw,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "@/contexts/use-theme";
import { authService } from "@/services/authService";
import { CountUp } from "@/components/motion/count-up";
import {
  getUserOverview,
  type InterviewSummary,
  type UserOverview,
} from "@/api/userService";
import { getInterviewResults } from "@/api/interviewService";

/** An interview is finished only once it has been scored. */
const isComplete = (interview: InterviewSummary) => interview.status === "submitted";

// Answers/questions are never persisted server-side, so an unsubmitted interview
// cannot be resumed later — label it for what it is rather than implying it can.
const statusLabel = (interview: InterviewSummary) =>
  isComplete(interview) ? "Completed" : "Not completed";

const statusClasses = (interview: InterviewSummary) =>
  isComplete(interview)
    ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30"
    : "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30";

const scoreTone = (score: number) => {
  if (score >= 80) return "text-emerald-500";
  if (score >= 65) return "text-cyan-500";
  return "text-amber-500";
};

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatShortDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// ---------- Small UI Components ----------
interface StatCardProps {
  title: string;
  value: string | number | null;
  hint?: string;
  icon: ComponentType<{ className?: string; size?: number | string }>;
  color: string;
}

function StatCard({ title, value, hint, icon: Icon, color }: StatCardProps) {
  const hasValue = value !== null && value !== undefined && value !== "";
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="text-white" size={24} />
          </div>
          {hint && (
            <div className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-slate-300">
              {hint}
            </div>
          )}
        </div>
        <div className="text-sm text-slate-400 mb-1">{title}</div>
        <div className="font-display text-3xl font-bold text-white">
          {hasValue ? <CountUp value={String(value)} startOnMount /> : "—"}
        </div>
      </div>
    </motion.div>
  );
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  isDark?: boolean;
}

function GlassCard({ children, className = "", isDark = true }: GlassCardProps) {
  return (
    <div
      className={`${
        isDark
          ? "bg-gradient-card backdrop-blur-xl border border-white/10"
          : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
      } rounded-2xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}

// ---------- Main Page ----------
export default function UserDashboardPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<UserOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openingReport, setOpeningReport] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setOverview(await getUserOverview());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load your account data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  // Server is the source of truth; the cached login payload covers the fetch failing.
  const stored = authService.getCurrentUserFromStorage();
  const userData = useMemo(() => {
    const server = overview?.user;
    return {
      name: server?.full_name || stored?.full_name || "User",
      email: server?.email || stored?.email || "—",
      phone: server?.phone || stored?.phone || "—",
      publicId: server?.public_id || stored?.public_id || "—",
    };
  }, [overview?.user, stored?.full_name, stored?.email, stored?.phone, stored?.public_id]);

  const initial = userData.name.charAt(0).toUpperCase();
  // Only the server can tell us a section is genuinely empty. Until it answers,
  // say "unavailable" rather than claiming the user has no interviews/resumes.
  const dataLoaded = overview !== null;
  const stats = overview?.stats;
  const resumes = overview?.resumes ?? [];
  const history = overview?.recent_completed ?? [];
  // Headline the newest SCORED interview — the newest row is often just an
  // abandoned setup, which would otherwise hide the user's actual last result.
  const newest = overview?.latest_interview ?? null;
  const latest = overview?.latest_completed ?? newest;
  const unfinishedSetup =
    newest && !isComplete(newest) && newest.interview_id !== latest?.interview_id
      ? newest
      : null;
  // Whatever the two cards above already show must not repeat in the history list.
  const earlier = history.filter(
    (i) =>
      i.interview_id !== latest?.interview_id &&
      i.interview_id !== unfinishedSetup?.interview_id
  );

  const chartData = useMemo(
    () =>
      (overview?.score_trend ?? []).map((point, idx) => ({
        label: formatShortDate(point.completed_at) || `#${idx + 1}`,
        score: point.score,
        role: point.role,
      })),
    [overview?.score_trend]
  );

  /** Rehydrate a scored interview into the report page (same contract as a fresh submit). */
  const openReport = useCallback(
    async (interviewId: string) => {
      setOpeningReport(interviewId);
      setReportError(null);
      try {
        const result = await getInterviewResults(interviewId);
        // question_feedback covers the answered questions; total_questions is the
        // number asked (absent on interviews submitted before it was recorded).
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
        setReportError(
          err instanceof Error ? err.message : "Could not open that interview report."
        );
      } finally {
        setOpeningReport(null);
      }
    },
    [navigate]
  );

  const mutedText = isDark ? "text-slate-400" : "text-gray-600";
  const headingText = isDark ? "text-white" : "text-gray-900";
  const rowBorder = isDark ? "border-white/10" : "border-gray-200";

  const sides = [
    {
      id: "interview",
      label: "Interview Practice",
      desc: "Rehearse with AI questions built from your resume",
      action: "Start an interview",
      to: "/interview/select-role",
      icon: Mic,
      accent: "from-violet-600 to-fuchsia-500",
    },
    {
      id: "jobs",
      label: "Job Search",
      desc: "Let the agent scan career pages and rank matches",
      action: "Find matching jobs",
      to: "/jobs",
      icon: Briefcase,
      accent: "from-cyan-500 to-emerald-400",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-dashboard-bg to-slate-950" : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse motion-reduce:animate-none ${
            isDark ? "bg-violet-500/10" : "bg-violet-500/5"
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse motion-reduce:animate-none ${
            isDark ? "bg-cyan-500/10" : "bg-cyan-500/5"
          }`}
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-8">
        {/* Header row */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1
            className={`font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-2 ${headingText}`}
          >
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
              {userData.name}
            </span>
          </h1>
          <p className={mutedText}>
            Your account, your interview results and the resumes on file — all in one place
          </p>
        </motion.div>

        {loading && (
          <div className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm ${rowBorder} ${mutedText}`}>
            <Loader2 size={16} className="animate-spin" />
            Loading your account…
          </div>
        )}

        {loadError && (
          <div
            className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 text-sm ${
              isDark
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => void loadOverview()}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold text-white bg-amber-600 hover:bg-amber-700"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Two sides — the hub's job is to launch either one */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {sides.map((side, i) => (
            <motion.button
              key={side.id}
              type="button"
              onClick={() => navigate(side.to)}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 + i * 0.08 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition ${
                isDark ? "border-white/10 bg-slate-900/60 backdrop-blur-xl" : "border-gray-200 bg-white shadow-md"
              }`}
            >
              <div
                className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${side.accent} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
              />
              <div className="relative z-10">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${side.accent} shadow-lg`}
                >
                  <side.icon className="text-white" size={24} />
                </div>
                <h3 className={`font-display text-xl font-bold ${headingText}`}>{side.label}</h3>
                <p className={`mt-1 text-sm ${mutedText}`}>{side.desc}</p>
                <span
                  className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3 ${
                    isDark ? "text-violet-300" : "text-violet-600"
                  }`}
                >
                  {side.action}
                  <ChevronRight size={16} />
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Stats — every number here comes from this user's own interviews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              id: "completed",
              title: "Interviews Completed",
              value: stats ? stats.completed : null,
              hint: stats && stats.unfinished > 0 ? `${stats.unfinished} unfinished` : undefined,
              icon: Trophy,
              color: "from-emerald-500 to-teal-500",
            },
            {
              id: "avg",
              title: "Average Score",
              value: stats?.average_score ?? null,
              icon: TrendingUp,
              color: "from-violet-500 to-purple-500",
            },
            {
              id: "best",
              title: "Best Score",
              value: stats?.best_score ?? null,
              icon: Award,
              color: "from-blue-500 to-cyan-500",
            },
            {
              id: "resumes",
              title: "Resumes On File",
              value: dataLoaded ? resumes.length : null,
              icon: FileText,
              color: "from-orange-500 to-amber-500",
            },
          ].map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <StatCard title={s.title} value={s.value} hint={s.hint} icon={s.icon} color={s.color} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: score trend + interview detail */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <GlassCard isDark={isDark}>
                <div className="mb-6">
                  <h3 className={`text-xl font-bold flex items-center gap-2 ${headingText}`}>
                    <TrendingUp className="text-cyan-400" size={24} />
                    Score History
                  </h3>
                  <p className={`text-sm mt-1 ${mutedText}`}>
                    {chartData.length >= 2
                      ? `Your ${chartData.length} most recent scored interviews, oldest first`
                      : "Your scores over time"}
                  </p>
                </div>

                {!dataLoaded && !loading && (
                  <p className={`text-sm ${mutedText}`}>Your score history couldn't be loaded.</p>
                )}

                {dataLoaded && chartData.length < 2 && (
                  <p className={`text-sm ${mutedText}`}>
                    {chartData.length === 0
                      ? "No scored interviews yet — finish one and your score history appears here."
                      : "One interview scored so far. Complete another to see a trend."}
                  </p>
                )}

                {chartData.length >= 2 && (
                  <div style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="label" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                          formatter={(value: number | string) => [value, "Score"]}
                          labelFormatter={(label: string, payload) => {
                            const role = payload?.[0]?.payload?.role;
                            return role ? `${role} — ${label}` : label;
                          }}
                        />
                        {stats?.average_score != null && (
                          <ReferenceLine
                            y={stats.average_score}
                            stroke="#8b5cf6"
                            strokeDasharray="5 5"
                            label={{ value: `avg ${stats.average_score}`, fill: "#a78bfa", fontSize: 12 }}
                          />
                        )}
                        <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fill="url(#colorScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Latest interview + history */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <GlassCard isDark={isDark}>
                <div className="mb-6">
                  <h3 className={`text-xl font-bold flex items-center gap-2 ${headingText}`}>
                    <Activity className="text-violet-400" size={24} />
                    Latest Interview
                  </h3>
                  <p className={`text-sm mt-1 ${mutedText}`}>Status, score and the full report</p>
                </div>

                {reportError && (
                  <p className={`mb-4 text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}>{reportError}</p>
                )}

                {unfinishedSetup && (
                  <p className={`mb-4 text-sm ${mutedText}`}>
                    You also have an unfinished {unfinishedSetup.role} setup from{" "}
                    {formatDate(unfinishedSetup.started_at)}. It can't be resumed — start a new
                    interview to practise that role.
                  </p>
                )}

                {!dataLoaded && !loading && (
                  <p className={`text-sm ${mutedText}`}>
                    Your interview history couldn't be loaded, so it isn't shown here.
                  </p>
                )}

                {dataLoaded && !latest && (
                  <div className={`rounded-xl border p-4 ${rowBorder}`}>
                    <p className={`text-sm ${mutedText}`}>
                      You haven't taken an interview yet. Your status and score will show up here.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/interview/select-role")}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      <Mic size={16} />
                      Take your first interview
                    </button>
                  </div>
                )}

                {latest && (
                  <div
                    className={`rounded-xl border p-5 ${
                      isDark ? "border-white/10 bg-slate-950/40" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`font-semibold ${headingText}`}>{latest.role}</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses(latest)}`}>
                            {statusLabel(latest)}
                          </span>
                        </div>
                        <p className={`mt-1 text-sm ${mutedText}`}>
                          {latest.experience} · {latest.difficulty}
                          {latest.skills.length > 0 && ` · ${latest.skills.slice(0, 4).join(", ")}`}
                        </p>
                        <p className={`mt-2 flex items-center gap-2 text-xs ${mutedText}`}>
                          <CalendarClock size={14} />
                          {isComplete(latest)
                            ? `Completed ${formatDate(latest.completed_at)}`
                            : `Started ${formatDate(latest.started_at)}`}
                        </p>
                      </div>

                      {isComplete(latest) && typeof latest.score === "number" && (
                        <div className="text-right">
                          <p className={`text-4xl font-bold ${scoreTone(latest.score)}`}>{latest.score}</p>
                          <p className={`text-xs ${mutedText}`}>out of 100</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {isComplete(latest) ? (
                        <button
                          type="button"
                          onClick={() => void openReport(latest.interview_id)}
                          disabled={openingReport === latest.interview_id}
                          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                        >
                          {openingReport === latest.interview_id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Award size={16} />
                          )}
                          View report
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate("/interview/select-role")}
                          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                        >
                          <PlayCircle size={16} />
                          Start a new interview
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {earlier.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <p className={`text-sm font-semibold ${mutedText}`}>
                      Earlier interviews
                      {stats && stats.completed > history.length && (
                        <span className="font-normal">
                          {" "}
                          — showing {history.length} of {stats.completed} completed
                        </span>
                      )}
                    </p>
                    {earlier.map((interview) => (
                      <div
                        key={interview.interview_id}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${rowBorder}`}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={`truncate text-sm font-medium ${headingText}`}>{interview.role}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses(interview)}`}
                            >
                              {statusLabel(interview)}
                            </span>
                          </div>
                          <p className={`text-xs ${mutedText}`}>
                            {isComplete(interview)
                              ? formatDate(interview.completed_at)
                              : formatDate(interview.started_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {typeof interview.score === "number" && (
                            <span className={`text-sm font-bold ${scoreTone(interview.score)}`}>
                              {interview.score}
                            </span>
                          )}
                          {isComplete(interview) && (
                            <button
                              type="button"
                              onClick={() => void openReport(interview.interview_id)}
                              disabled={openingReport === interview.interview_id}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                                isDark
                                  ? "border-white/10 text-white hover:bg-white/5"
                                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {openingReport === interview.interview_id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Award size={14} />
                              )}
                              Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* Right: account details + resumes (merged in from the old profile page) */}
          <div className="space-y-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
              <GlassCard isDark={isDark}>
                <div className="mb-6">
                  <h3 className={`text-xl font-bold flex items-center gap-2 ${headingText}`}>
                    <BarChart2 className="text-cyan-400" size={24} />
                    Your Account
                  </h3>
                  <p className={`text-sm mt-1 ${mutedText}`}>Personal details on file</p>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-lg font-bold truncate ${headingText}`}>{userData.name}</p>
                    <p className={`text-sm ${mutedText}`}>
                      {latest?.role ? `${latest.role} · ${latest.experience}` : dataLoaded ? "No interviews yet" : "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs ${mutedText}`}>Email Address</p>
                      <p className={`text-sm font-medium truncate ${headingText}`}>{userData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs ${mutedText}`}>Phone Number</p>
                      <p className={`text-sm font-medium truncate ${headingText}`}>{userData.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs ${mutedText}`}>User ID</p>
                      <p className={`font-mono text-xs truncate ${headingText}`}>
                        <span className="select-all">{userData.publicId}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <p className={`mt-5 text-xs ${mutedText}`}>
                  💡 Editing your details and changing your password are coming soon.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
              <GlassCard isDark={isDark}>
                <div className="mb-6">
                  <h3 className={`text-xl font-bold flex items-center gap-2 ${headingText}`}>
                    <FileText className="text-orange-400" size={24} />
                    Resumes
                  </h3>
                  <p className={`text-sm mt-1 ${mutedText}`}>Used by both the interview and job agent</p>
                </div>

                {!dataLoaded ? (
                  !loading && (
                    <p className={`text-sm ${mutedText}`}>
                      Your resumes couldn't be loaded, so they aren't shown here.
                    </p>
                  )
                ) : resumes.length === 0 ? (
                  <div className={`rounded-xl border p-4 ${rowBorder}`}>
                    <p className={`text-sm font-medium ${headingText}`}>No resume on file</p>
                    <p className={`text-sm ${mutedText}`}>
                      Upload one in the interview setup — both sides use it.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/interview/select-role")}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                      Upload resume
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resumes.map((resume) => (
                      <div key={resume.id} className={`rounded-xl border p-4 ${rowBorder}`}>
                        <div className="flex items-start gap-3">
                          <FileText size={18} className="shrink-0 text-orange-500 mt-0.5" />
                          <div className="min-w-0">
                            <p className={`truncate text-sm font-medium ${headingText}`}>{resume.file_name}</p>
                            <p className={`text-xs ${mutedText}`}>
                              {resume.role} · {resume.experience}
                            </p>
                            {resume.skills.length > 0 && (
                              <p className={`text-xs ${mutedText}`}>{resume.skills.slice(0, 4).join(", ")}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">Added {formatDate(resume.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => navigate("/jobs")}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-white shadow-lg"
                    >
                      <Briefcase size={16} />
                      Match jobs
                    </button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
