import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/use-theme";
import { authService } from "@/services/authService";
import { getUserOverview, type InterviewSummary, type UserOverview } from "@/api/userService";
import { getInterviewResults } from "@/api/interviewService";
import { Reveal } from "@/components/motion/reveal";
import {
  Mail,
  Phone,
  Briefcase,
  FileText,
  Lock,
  ArrowRight,
  LayoutDashboard,
  Mic,
  Award,
  BarChart3,
  CalendarClock,
  Loader2,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

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

export default function Profile() {
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
      setLoadError(
        err instanceof Error ? err.message : "Could not load your account data."
      );
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

  const cardClass = isDark
    ? "bg-slate-800/50 border-white/10"
    : "bg-white border-slate-200";
  const mutedText = isDark ? "text-slate-400" : "text-slate-600";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">
            Your{" "}
            <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className={`text-lg ${mutedText}`}>
            Your account, your interview history and the resumes on file
          </p>

          {/* Both sides reachable from the shared account page */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                isDark
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link
              to="/interview/select-role"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg"
            >
              <Mic size={16} />
              Start interview
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-white shadow-lg"
            >
              <Briefcase size={16} />
              Find jobs
            </Link>
          </div>
        </div>

        {loading && (
          <div className={`mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm ${cardClass} ${mutedText}`}>
            <Loader2 size={16} className="animate-spin" />
            Loading your account…
          </div>
        )}

        {loadError && (
          <div
            className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm ${
              isDark ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-700"
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

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`rounded-xl border p-8 ${cardClass}`}
        >
          {/* Profile Picture & Basic Info */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-white/10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {initial}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{userData.name}</h2>
              <p className={mutedText}>
                {latest?.role
                  ? `${latest.role} · ${latest.experience}`
                  : dataLoaded
                    ? "No interviews yet"
                    : "—"}
              </p>
              <p className="mt-2 font-mono text-xs text-slate-500">
                User ID: <span className="select-all">{userData.publicId}</span>
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6 mb-8">
            <h3 className="text-xl font-bold">Personal Information</h3>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Mail size={20} className="text-violet-400" />
              </div>
              <div>
                <p className={`text-sm ${mutedText}`}>Email Address</p>
                <p className="font-medium">{userData.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Phone size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className={`text-sm ${mutedText}`}>Phone Number</p>
                <p className="font-medium">{userData.phone}</p>
              </div>
            </div>

            {/* Practice summary — real counts for this user */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <BarChart3 size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className={`text-sm ${mutedText}`}>Practice So Far</p>
                <p className="font-medium">
                  {stats
                    ? [
                        `${stats.completed} completed`,
                        stats.unfinished > 0 ? `${stats.unfinished} unfinished` : null,
                        stats.average_score !== null ? `avg ${stats.average_score}` : null,
                        stats.best_score !== null ? `best ${stats.best_score}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Latest interview — status + the action that follows from it */}
          <div className="space-y-4 mb-8 pb-8 border-b border-white/10">
            <h3 className="text-xl font-bold">Latest Interview</h3>

            {reportError && (
              <p className={`text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}>{reportError}</p>
            )}

            {unfinishedSetup && (
              <p className={`text-sm ${mutedText}`}>
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
              <div className={`rounded-lg border p-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <p className={`text-sm ${mutedText}`}>
                  You haven't taken an interview yet. Your status and score will show up here.
                </p>
                <Link
                  to="/interview/select-role"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  <Mic size={16} />
                  Take your first interview
                </Link>
              </div>
            )}

            {latest && (
              <Reveal>
                <div className={`rounded-lg border p-5 ${isDark ? "border-white/10 bg-slate-950/40" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{latest.role}</p>
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
                      <Link
                        to="/interview/select-role"
                        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                      >
                        <PlayCircle size={16} />
                        Start a new interview
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        isDark
                          ? "border-white/10 text-white hover:bg-white/5"
                          : "border-slate-200 text-slate-700 hover:bg-white"
                      }`}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  </div>
                </div>
              </Reveal>
            )}

            {earlier.length > 0 && (
              <div className="space-y-2">
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
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
                      isDark ? "border-white/10" : "border-slate-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">{interview.role}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses(interview)}`}>
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
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
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
          </div>

          {/* Resume & Documents — the resumes actually indexed for this user */}
          <div className="space-y-4 mb-8 pb-8 border-b border-white/10">
            <h3 className="text-xl font-bold">Resume & Documents</h3>

            {!dataLoaded ? (
              !loading && (
                <p className={`text-sm ${mutedText}`}>
                  Your resumes couldn't be loaded, so they aren't shown here.
                </p>
              )
            ) : resumes.length === 0 ? (
              <div className={`rounded-lg border p-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-orange-500" />
                  <div>
                    <p className="font-medium">No resume on file</p>
                    <p className={`text-sm ${mutedText}`}>
                      Upload one in the interview setup — both the interview and job agent use it.
                    </p>
                  </div>
                </div>
                <Link
                  to="/interview/select-profile"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  Upload resume
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 ${
                      isDark ? "border-white/10" : "border-slate-200"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText size={20} className="shrink-0 text-orange-500" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{resume.file_name}</p>
                        <p className={`text-sm ${mutedText}`}>
                          {resume.role} · {resume.experience}
                          {resume.skills.length > 0 && ` · ${resume.skills.slice(0, 4).join(", ")}`}
                        </p>
                        <p className="text-xs text-slate-500">Added {formatDate(resume.created_at)}</p>
                      </div>
                    </div>
                    <Link
                      to="/jobs"
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        isDark
                          ? "border-white/10 text-white hover:bg-white/5"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Briefcase size={14} />
                      Match jobs
                    </Link>
                  </div>
                ))}
                <Link
                  to="/interview/select-profile"
                  className={`inline-flex items-center gap-2 text-sm font-semibold ${
                    isDark ? "text-violet-300 hover:text-violet-200" : "text-violet-700 hover:text-violet-800"
                  }`}
                >
                  Upload another resume
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Account Settings</h3>
            <button
              type="button"
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                isDark
                  ? "border-white/10 hover:bg-white/5"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Change Password</p>
                  <p className={`text-sm ${mutedText}`}>Update your password</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-slate-400" />
            </button>
          </div>
        </motion.div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mt-8 p-4 rounded-lg border ${
            isDark
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
            💡 Editing your details and changing your password are coming soon.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
