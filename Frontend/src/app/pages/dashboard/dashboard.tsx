import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { useTheme } from "@/contexts/use-theme";
import { authService } from "@/services/authService";
import { motion, AnimatePresence } from "framer-motion";
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
  ReferenceLine,
} from "recharts";
import {
  Menu,
  X,
  Users,
  Calendar,
  BarChart2,
  Bell,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  Award,
  Clock,
  Star,
  ChevronRight,
  Activity,
  Mic,
  Briefcase,
  Mail,
  Phone,
  FileText,
  Loader2,
  RefreshCw,
  CalendarClock,
  PlayCircle,
  IdCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getUserOverview,
  type InterviewSummary,
  type UserOverview,
} from "@/api/userService";
import { getInterviewResults } from "@/api/interviewService";

// ---------- Placeholder data ----------
// These four sections have no backing data in the system yet (there is no
// scheduling concept, no per-skill scoring, and no achievement/tip engine).
// They are kept as a design placeholder and flagged with <SampleBadge /> so the
// numbers are never mistaken for the user's own. Everything else on this page
// comes from GET /user/overview.
const scoreHistoryPlaceholder = [
  { name: "Week 1", score: 60, target: 65 },
  { name: "Week 2", score: 70, target: 70 },
  { name: "Week 3", score: 65, target: 72 },
  { name: "Week 4", score: 72, target: 75 },
  { name: "Week 5", score: 80, target: 78 },
  { name: "Week 6", score: 82, target: 80 },
  { name: "Week 7", score: 90, target: 85 },
];

const skillRadar = [
  { skill: "Problem Solving", current: 85, previous: 75 },
  { skill: "Communication", current: 70, previous: 65 },
  { skill: "Coding", current: 78, previous: 70 },
  { skill: "System Design", current: 60, previous: 55 },
  { skill: "Domain Knowledge", current: 74, previous: 68 },
];

const upcoming = [
  { id: 1, role: "Frontend Developer", company: "TechCorp", date: "2025-12-15", time: "10:00 AM", type: "Live", difficulty: "Medium", color: "from-blue-500 to-cyan-500" },
  { id: 2, role: "ML Intern", company: "AI Labs", date: "2025-12-20", time: "02:30 PM", type: "Recorded", difficulty: "Easy", color: "from-emerald-500 to-teal-500" },
  { id: 3, role: "Product Eng.", company: "StartupX", date: "2026-01-05", time: "11:00 AM", type: "Live", difficulty: "Hard", color: "from-violet-500 to-purple-500" },
];

const achievements = [
  { id: 1, title: "First Win", description: "Passed your first interview", unlocked: true, icon: Trophy },
  { id: 2, title: "Streak Master", description: "5 consecutive passes", unlocked: true, icon: Zap },
  { id: 3, title: "Perfect Score", description: "Score 100 in any interview", unlocked: false, icon: Star },
  { id: 4, title: "Dedicated", description: "Complete 50 interviews", unlocked: false, icon: Award },
];

// ---------- Helpers ----------
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
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-cyan-400";
  return "text-amber-400";
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
interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

function IconButton({ children, onClick, className = "" }: IconButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-white/10 transition ${className}`}
    >
      {children}
    </motion.button>
  );
}

/** Marks a section whose contents are a design placeholder, not this user's data. */
function SampleBadge() {
  return (
    <span
      title="Placeholder content — this feature isn't wired to real data yet"
      className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400 ring-1 ring-amber-500/30"
    >
      Sample
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string | number | null;
  /** Optional factual note (e.g. "2 unfinished"). No invented percentages. */
  hint?: string;
  icon: ComponentType<{ className?: string; size?: number | string }>;
  color: string;
}

function StatCard({ title, value, hint, icon: Icon, color }: StatCardProps) {
  const hasValue = value !== null && value !== undefined && value !== "";
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl group dark-mode"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
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
        <div className="text-sm text-slate-400 mb-1 card-subtitle">{title}</div>
        <div className="font-display text-3xl font-bold text-white card-value">
          {/* startOnMount: these are real numbers — CountUp shows 0 until it
              scrolls into view, and a lingering 0 reads as fact. */}
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
    <div className={`${
      isDark
        ? "bg-gradient-card backdrop-blur-xl border border-white/10"
        : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
    } rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

// ---------- Main Page ----------
export default function UserDashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();
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
  const currentUser = authService.getCurrentUserFromStorage();
  const account = useMemo(() => {
    const server = overview?.user;
    return {
      name: server?.full_name || currentUser?.full_name || currentUser?.email || "there",
      email: server?.email || currentUser?.email || "—",
      phone: server?.phone || currentUser?.phone || "—",
      publicId: server?.public_id || currentUser?.public_id || "—",
    };
  }, [
    overview?.user,
    currentUser?.full_name,
    currentUser?.email,
    currentUser?.phone,
    currentUser?.public_id,
  ]);

  const displayName = account.name;
  const userInitial = displayName.charAt(0).toUpperCase();

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

  const realChart = useMemo(
    () =>
      (overview?.score_trend ?? []).map((point, idx) => ({
        name: formatShortDate(point.completed_at) || `#${idx + 1}`,
        score: point.score,
        role: point.role,
      })),
    [overview?.score_trend]
  );
  // Under two scored interviews there is no trend to draw, so the chart keeps its
  // shape using placeholder data — clearly badged so it isn't read as the user's.
  const usingRealChart = realChart.length >= 2;
  const chartData = usingRealChart ? realChart : scoreHistoryPlaceholder;

  // Real improvement: newest score minus oldest in the window.
  const improvement = useMemo(() => {
    if (realChart.length < 2) return null;
    const delta = realChart[realChart.length - 1].score - realChart[0].score;
    return `${delta >= 0 ? "+" : ""}${delta}`;
  }, [realChart]);

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

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? "bg-dashboard-bg to-slate-950"
        : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
    }`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse motion-reduce:animate-none ${
          isDark ? "bg-violet-500/10" : "bg-violet-500/5"
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse motion-reduce:animate-none ${
          isDark ? "bg-cyan-500/10" : "bg-cyan-500/5"
        }`} style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Top-level container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop & Tablet */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ${
              sidebarCollapsed ? "w-20" : "w-64"
            }`}
          >
            <div className={`${
              isDark
                ? "bg-gradient-card backdrop-blur-xl border border-white/10"
                : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
            } rounded-2xl p-4 mb-4`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary shadow-lg flex items-center justify-center">
                  <Activity className="text-white" size={24} />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <div className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>TalentPulse</div>
                    <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>AI Interview Coach</div>
                  </div>
                )}
              </div>

              <nav className="flex-1">
                <ul className="flex flex-col gap-2">
                  {[
                    { icon: BarChart2, label: "Dashboard", active: true, to: "/dashboard" },
                    { icon: Mic, label: "Interview", to: "/interview/select-role" },
                    { icon: Briefcase, label: "Job Search", to: "/jobs" },
                    { icon: Users, label: "My Interviews", to: "/dashboard" },
                    { icon: Trophy, label: "Achievements", to: "/dashboard" },
                  ].map((item, i) => (
                    <motion.li key={i} whileHover={{ x: 4 }}>
                      <button
                        type="button"
                        onClick={() => navigate(item.to)}
                        className={`w-full py-3 px-3 rounded-xl transition cursor-pointer flex items-center gap-3 text-left ${
                          item.active
                            ? isDark
                              ? "bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 text-white"
                              : "bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 text-gray-900"
                            : isDark
                              ? "hover:bg-white/5 text-slate-400"
                              : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        <item.icon size={18} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Account snapshot in the sidebar */}
            {!sidebarCollapsed && (
              <div className={`${
                isDark
                  ? "bg-gradient-card backdrop-blur-xl border border-white/10"
                  : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
              } rounded-2xl p-4 mb-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                      {displayName}
                    </div>
                    <div className={`text-xs truncate ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                      {account.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleTheme()}
                className={`w-full py-3 rounded-xl transition font-semibold shadow-lg ${
                  isDark
                    ? "bg-slate-800/50 hover:bg-slate-700/50 text-white border border-white/10"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                }`}
              >
                {isDark ? "☀️ Light" : "🌙 Dark"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSidebarCollapsed((s) => !s)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition text-white font-semibold shadow-lg"
              >
                {sidebarCollapsed ? "→" : "Collapse"}
              </motion.button>
            </div>
          </motion.aside>

          {/* Mobile Topbar & Hamburger */}
          <div className="flex-1 min-w-0">
            <header className={`flex items-center justify-between md:hidden mb-4 ${
              isDark
                ? "bg-gradient-card backdrop-blur-xl border border-white/10"
                : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
            } rounded-2xl p-4`}>
              <div className="flex items-center gap-3">
                <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X size={20} className={isDark ? "text-white" : "text-gray-900"} /> : <Menu size={20} className={isDark ? "text-white" : "text-gray-900"} />}
                </IconButton>
                <div className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>TalentPulse</div>
              </div>

              <div className="flex items-center gap-2">
                <IconButton onClick={() => toggleTheme()}>
                  {isDark ? <span className="text-xl">☀️</span> : <span className="text-xl">🌙</span>}
                </IconButton>
                <IconButton>
                  <Bell size={18} className={isDark ? "text-white" : "text-gray-900"} />
                </IconButton>
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shadow-lg">
                  {userInitial}
                </div>
              </div>
            </header>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden mb-4 overflow-hidden"
                >
                  <div className={`${
                    isDark
                      ? "bg-gradient-card backdrop-blur-xl border border-white/10"
                      : "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg"
                  } rounded-2xl p-4`}>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "Dashboard", to: "/dashboard" },
                        { label: "Interview", to: "/interview/select-role" },
                        { label: "Job Search", to: "/jobs" },
                      ].map((item, i) => (
                        <button
                          key={i}
                          className={`text-left py-3 px-4 rounded-xl transition ${
                            isDark ? "hover:bg-white/5 text-white" : "hover:bg-gray-100 text-gray-900"
                          }`}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate(item.to);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <main>
              {/* Header Row */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
              >
                <div>
                  <h1 className={`font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">{displayName}</span>
                  </h1>
                  <p className={isDark ? "text-slate-400" : "text-gray-600"}>Your hub for both sides — practice interviews and hunt for jobs</p>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTheme()}
                    className={`p-2 rounded-lg transition ${
                      isDark
                        ? "bg-slate-900/50 backdrop-blur-xl border border-white/10 text-white"
                        : "bg-white/80 backdrop-blur-xl border border-gray-300 text-gray-900 shadow-md"
                    }`}
                  >
                    {isDark ? <span className="text-xl">☀️</span> : <span className="text-xl">🌙</span>}
                  </motion.button>
                  <div className={`flex items-center gap-2 ${
                    isDark
                      ? "bg-slate-900/50 backdrop-blur-xl border border-white/10"
                      : "bg-white/80 backdrop-blur-xl border border-gray-300 shadow-md"
                  } rounded-xl px-4 py-2`}>
                    <Clock size={16} className="text-cyan-400" />
                    <div className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{today}</div>
                  </div>
                  <IconButton className={isDark ? "bg-slate-900/50 backdrop-blur-xl border border-white/10" : "bg-white/80 backdrop-blur-xl border border-gray-300 shadow-md"}>
                    <Bell size={18} className={isDark ? "text-white" : "text-gray-900"} />
                  </IconButton>
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shadow-lg">
                    {userInitial}
                  </div>
                </div>
              </motion.div>

              {loading && (
                <div className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm ${
                  isDark ? "border-white/10 text-slate-400" : "border-gray-200 text-gray-600"
                }`}>
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
                {[
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
                ].map((side, i) => (
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
                      isDark
                        ? "border-white/10 bg-slate-900/60 backdrop-blur-xl"
                        : "border-gray-200 bg-white shadow-md"
                    }`}
                  >
                    <div className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${side.accent} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`} />
                    <div className="relative z-10">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${side.accent} shadow-lg`}>
                        <side.icon className="text-white" size={24} />
                      </div>
                      <h3 className={`font-display text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {side.label}
                      </h3>
                      <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                        {side.desc}
                      </p>
                      <span className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3 ${
                        isDark ? "text-violet-300" : "text-violet-600"
                      }`}>
                        {side.action}
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Stats Cards — real numbers from this user's own interviews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    id: "total",
                    title: "Total Interviews",
                    value: stats ? stats.total_interviews : null,
                    icon: Users,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    id: "completed",
                    title: "Completed",
                    value: stats ? stats.completed : null,
                    icon: Trophy,
                    color: "from-emerald-500 to-teal-500",
                  },
                  {
                    id: "unfinished",
                    title: "Not Completed",
                    value: stats ? stats.unfinished : null,
                    icon: Target,
                    color: "from-rose-500 to-pink-500",
                  },
                  {
                    id: "avg",
                    title: "Average Score",
                    value: stats?.average_score ?? null,
                    hint: stats?.best_score != null ? `best ${stats.best_score}` : undefined,
                    icon: TrendingUp,
                    color: "from-violet-500 to-purple-500",
                  },
                ].map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <StatCard title={s.title} value={s.value} hint={s.hint} icon={s.icon} color={s.color} />
                  </motion.div>
                ))}
              </div>

              {/* Main Grid: Charts + Schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Performance Chart (col-span 2 on large) */}
                <div className="lg:col-span-2 space-y-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="flex items-start justify-between mb-6 gap-3">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <TrendingUp className="text-cyan-400" size={24} />
                            Performance Over Time
                            {!usingRealChart && <SampleBadge />}
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                            {usingRealChart
                              ? `Your ${realChart.length} most recent scored interviews, oldest first`
                              : dataLoaded
                                ? "Complete two interviews and your own trend replaces this example"
                                : "Your score trend"}
                          </p>
                        </div>
                        {usingRealChart && (
                          <div className={`shrink-0 py-2 px-4 rounded-lg text-sm border ${
                            isDark
                              ? "bg-white/5 text-white border-white/10"
                              : "bg-gray-100 text-gray-900 border-gray-300"
                          }`}>
                            Last {realChart.length}
                          </div>
                        )}
                      </div>

                      <div style={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" domain={[0, 100]} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                color: "#fff"
                              }}
                            />
                            {/* Real average line replaces the old invented "target" series */}
                            {usingRealChart && stats?.average_score != null && (
                              <ReferenceLine
                                y={stats.average_score}
                                stroke="#8b5cf6"
                                strokeDasharray="5 5"
                                label={{ value: `avg ${stats.average_score}`, fill: "#a78bfa", fontSize: 12 }}
                              />
                            )}
                            <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fill="url(#colorScore)" />
                            {!usingRealChart && (
                              <Line type="monotone" dataKey="target" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-xl ${
                          isDark
                            ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
                            : "bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300"
                        }`}>
                          <div className={`text-xs mb-1 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>Best Score</div>
                          <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {stats?.best_score ?? "—"}
                          </div>
                        </div>
                        <div className={`p-4 rounded-xl ${
                          isDark
                            ? "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20"
                            : "bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-300"
                        }`}>
                          <div className={`text-xs mb-1 ${isDark ? "text-violet-400" : "text-violet-700"}`}>Improvement</div>
                          <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {improvement ?? "—"}
                          </div>
                        </div>
                        <div className={`p-4 rounded-xl ${
                          isDark
                            ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                            : "bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-300"
                        }`}>
                          <div className={`text-xs mb-1 ${isDark ? "text-cyan-400" : "text-cyan-700"}`}>Completed</div>
                          <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {stats ? stats.completed : "—"}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Latest interview — real status, score and report */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="mb-6">
                        <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                          <Award className="text-emerald-400" size={24} />
                          Latest Interview
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Status, score and the full report</p>
                      </div>

                      {reportError && (
                        <p className={`mb-4 text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}>{reportError}</p>
                      )}

                      {unfinishedSetup && (
                        <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                          You also have an unfinished {unfinishedSetup.role} setup from{" "}
                          {formatDate(unfinishedSetup.started_at)}. It can't be resumed — start a new
                          interview to practise that role.
                        </p>
                      )}

                      {!dataLoaded && !loading && (
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                          Your interview history couldn't be loaded, so it isn't shown here.
                        </p>
                      )}

                      {dataLoaded && !latest && (
                        <div className={`rounded-xl border p-4 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                          <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
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
                        <div className={`rounded-xl border p-5 ${
                          isDark ? "border-white/10 bg-slate-950/40" : "border-gray-200 bg-gray-50"
                        }`}>
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{latest.role}</p>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses(latest)}`}>
                                  {statusLabel(latest)}
                                </span>
                              </div>
                              <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                                {latest.experience} · {latest.difficulty}
                                {latest.skills.length > 0 && ` · ${latest.skills.slice(0, 4).join(", ")}`}
                              </p>
                              <p className={`mt-2 flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                                <CalendarClock size={14} />
                                {isComplete(latest)
                                  ? `Completed ${formatDate(latest.completed_at)}`
                                  : `Started ${formatDate(latest.started_at)}`}
                              </p>
                            </div>

                            {isComplete(latest) && typeof latest.score === "number" && (
                              <div className="text-right">
                                <p className={`text-4xl font-bold ${scoreTone(latest.score)}`}>{latest.score}</p>
                                <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>out of 100</p>
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
                    </GlassCard>
                  </motion.div>

                  {/* Radar Skills */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <Star className="text-violet-400" size={24} />
                            Skill Analysis
                            <SampleBadge />
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Per-skill scoring isn't captured yet — example shape</p>
                        </div>
                      </div>

                      <div style={{ width: "100%", height: 320 }}>
                        <ResponsiveContainer>
                          <RadarChart outerRadius={110} data={skillRadar}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="skill" stroke="#94a3b8" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                            <Radar name="Current" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                            <Radar name="Previous" dataKey="previous" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>

                {/* Right column: Account + Schedule + Recent Interviews + Resumes */}
                <div className="space-y-6">
                  {/* Account details (merged in from the old profile page) */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <IdCard className="text-cyan-400" size={24} />
                            Your Account
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Personal details on file</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-lg font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{displayName}</p>
                          <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                            {latest?.role
                              ? `${latest.role} · ${latest.experience}`
                              : dataLoaded
                                ? "No interviews yet"
                                : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                            <Mail size={18} className="text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>Email Address</p>
                            <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{account.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                            <Phone size={18} className="text-cyan-400" />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>Phone Number</p>
                            <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{account.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <IdCard size={18} className="text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>User ID</p>
                            <p className={`font-mono text-xs truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                              <span className="select-all">{account.publicId}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className={`mt-5 text-xs ${isDark ? "text-slate-500" : "text-gray-500"}`}>
                        💡 Editing your details and changing your password are coming soon.
                      </p>
                    </GlassCard>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <Calendar className="text-cyan-400" size={24} />
                            Upcoming
                            <SampleBadge />
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Scheduling isn't built yet — example shape</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        {upcoming.map((u, i) => (
                          <motion.div
                            key={u.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`relative overflow-hidden p-4 rounded-xl group ${
                              isDark
                                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10"
                                : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300"
                            }`}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-br ${u.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{u.role}</div>
                                  <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>{u.company}</div>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  u.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-400" :
                                  u.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                                  "bg-rose-500/20 text-rose-400"
                                }`}>
                                  {u.difficulty}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                                  {u.date} • {u.time}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Recent — this user's real scored interviews */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <Activity className="text-violet-400" size={24} />
                            Recent
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                            {stats && stats.completed > history.length
                              ? `Showing ${history.length} of ${stats.completed} completed`
                              : "Your completed interviews"}
                          </p>
                        </div>
                      </div>

                      {!dataLoaded && !loading && (
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                          Your recent interviews couldn't be loaded.
                        </p>
                      )}

                      {dataLoaded && history.length === 0 && (
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                          No completed interviews yet — your attempts and scores will list here.
                        </p>
                      )}

                      <div className="flex flex-col gap-3">
                        {history.map((r, i) => (
                          <motion.div
                            key={r.interview_id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className={`p-3 rounded-xl transition ${
                              isDark
                                ? "bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10 hover:border-white/20"
                                : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <div className="min-w-0">
                                <div className={`font-medium text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>{r.role}</div>
                                <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                                  {r.difficulty} • {formatShortDate(r.completed_at)}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className={`font-semibold text-sm ${typeof r.score === "number" ? scoreTone(r.score) : ""}`}>
                                  {statusLabel(r)}
                                </div>
                                <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                                  Score: {r.score ?? "—"}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => void openReport(r.interview_id)}
                              disabled={openingReport === r.interview_id}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                                isDark
                                  ? "border-white/10 text-white hover:bg-white/5"
                                  : "border-gray-300 text-gray-700 hover:bg-white"
                              }`}
                            >
                              {openingReport === r.interview_id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Award size={14} />
                              )}
                              View report
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </GlassCard>
                  </motion.div>

                  {/* Resumes (merged in from the old profile page) */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.55 }}
                  >
                    <GlassCard isDark={isDark}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <FileText className="text-orange-400" size={24} />
                            Resumes
                          </h3>
                          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Used by both the interview and job agent</p>
                        </div>
                      </div>

                      {!dataLoaded ? (
                        !loading && (
                          <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                            Your resumes couldn't be loaded, so they aren't shown here.
                          </p>
                        )
                      ) : resumes.length === 0 ? (
                        <div className={`rounded-xl border p-4 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                          <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>No resume on file</p>
                          <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>
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
                            <div key={resume.id} className={`rounded-xl border p-4 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                              <div className="flex items-start gap-3">
                                <FileText size={18} className="shrink-0 text-orange-500 mt-0.5" />
                                <div className="min-w-0">
                                  <p className={`truncate text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{resume.file_name}</p>
                                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                                    {resume.role} · {resume.experience}
                                  </p>
                                  {resume.skills.length > 0 && (
                                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                                      {resume.skills.slice(0, 4).join(", ")}
                                    </p>
                                  )}
                                  <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-gray-500"}`}>
                                    Added {formatDate(resume.created_at)}
                                  </p>
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

              {/* Bottom Row: AI Suggestions + Achievements */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <GlassCard isDark={isDark}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                          <Zap className="text-yellow-400" size={24} />
                          AI Suggestions
                          <SampleBadge />
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                          Generic tips for now — your report's "Next Steps" are the personalized ones
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {[
                        { title: "Practice: Algo Problems", desc: "Focus on arrays & graphs. Try timed mocks.", color: "from-blue-500 to-cyan-500" },
                        { title: "Improve Communication", desc: "Record explanations and compare with samples.", color: "from-violet-500 to-purple-500" },
                        { title: "System Design Primer", desc: "Review scalability patterns for senior roles.", color: "from-emerald-500 to-teal-500" },
                      ].map((tip, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          className={`relative overflow-hidden p-4 rounded-xl group ${
                            isDark
                              ? "bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-white/10"
                              : "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300"
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${tip.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                          <div className="relative z-10">
                            <div className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{tip.title}</div>
                            <div className={`text-xs ${isDark ? "text-slate-400" : "text-gray-600"}`}>{tip.desc}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <GlassCard isDark={isDark}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                          <Trophy className="text-yellow-400" size={24} />
                          Achievements
                          <SampleBadge />
                        </h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>Not tracked yet — example badges</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {achievements.map((ach) => (
                        <motion.div
                          key={ach.id}
                          whileHover={{ scale: ach.unlocked ? 1.05 : 1 }}
                          className={`p-4 rounded-xl border transition ${
                            ach.unlocked
                              ? isDark
                                ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                                : "bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400"
                              : isDark
                                ? "bg-slate-800/30 border-slate-700/50 opacity-50"
                                : "bg-gray-100/30 border-gray-300/50 opacity-50"
                          }`}
                        >
                          <ach.icon className={ach.unlocked ? "text-yellow-400" : isDark ? "text-slate-600" : "text-gray-400"} size={24} />
                          <div className={`mt-2 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{ach.title}</div>
                          <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-600"}`}>{ach.description}</div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
