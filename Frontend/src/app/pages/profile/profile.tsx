import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import {
  deleteResume,
  getResumeDetail,
  getUserOverview,
  type InterviewSummary,
  type ResumeDetail,
  type UserOverview,
} from "@/api/userService";
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
  CalendarClock,
  Loader2,
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  TrendingUp,
  Trophy,
  UserRound,
  Plus,
  Eye,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

/** An interview is finished only once it has been scored. */
const isComplete = (interview: InterviewSummary) => interview.status === "submitted";

// Answers/questions are never persisted server-side, so an unsubmitted interview
// cannot be resumed later — label it for what it is rather than implying it can.
const statusLabel = (interview: InterviewSummary) =>
  isComplete(interview) ? "Completed" : "Not completed";

const statusClasses = (interview: InterviewSummary) =>
  isComplete(interview)
    ? "bg-success-soft text-success ring-1 ring-success/30"
    : "bg-warning-soft text-warning ring-1 ring-warning/30";

const scoreTone = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 65) return "text-accent-text";
  return "text-warning";
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
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

export default function Profile() {
  const navigate = useNavigate();

  const [overview, setOverview] = useState<UserOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openingReport, setOpeningReport] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // Resume view / delete
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [viewed, setViewed] = useState<ResumeDetail | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);

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

  /** Open the viewer — shows the extracted content, since the PDF isn't stored. */
  const openResume = useCallback(async (resumeId: number) => {
    setViewingId(resumeId);
    setResumeError(null);
    setViewed(null);
    try {
      setViewed(await getResumeDetail(resumeId));
    } catch (err) {
      setViewingId(null);
      setResumeError(err instanceof Error ? err.message : "Could not open that resume.");
    }
  }, []);

  const removeResume = useCallback(async () => {
    if (!confirmDelete) return;
    const { id, name } = confirmDelete;
    setDeletingId(id);
    setResumeError(null);
    setResumeNotice(null);
    try {
      const result = await deleteResume(id);
      setConfirmDelete(null);
      setResumeNotice(
        result.job_setup_detached
          ? `Deleted ${name}. Your job search no longer has a resume selected — pick one in Job Search setup.`
          : `Deleted ${name}.`
      );
      // Re-read rather than patching local state, so stats/latest stay consistent.
      await loadOverview();
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : `Could not delete ${name}.`);
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, loadOverview]);

  const panelClass = "bg-canvas border-border shadow-e1";
  const mutedText = "text-ink-muted";
  const innerBorder = "border-border";

  const panelHeading = (
    label: string,
    Icon: ComponentType<{ size?: number | string; className?: string }>,
    accent: string,
    action?: React.ReactNode
  ) => (
    <div className={`flex items-center gap-2 border-b px-5 py-4 ${innerBorder}`}>
      <Icon size={18} className={accent} />
      <h2 className="font-semibold">{label}</h2>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );

  const iconButtonClass = `inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-50 border-border text-ink-subtle hover:bg-surface hover:text-ink`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header — title and actions share one row so they don't stack */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-h1 font-semibold">
              Your{" "}
              <span className="text-accent-text">Profile</span>
            </h1>
            <p className={`mt-1 ${mutedText}`}>
              Your account, your interview history and the resumes on file
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition border-border bg-canvas text-ink-muted shadow-e1 hover:bg-surface`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link
              to="/interview/select-role"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-lg"
            >
              <Mic size={16} />
              Start interview
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-lg"
            >
              <Briefcase size={16} />
              Find jobs
            </Link>
          </div>
        </div>

        {loading && (
          <div className={`mb-5 flex items-center gap-3 rounded-xl border p-4 text-sm ${panelClass} ${mutedText}`}>
            <Loader2 size={16} className="animate-spin" />
            Loading your account…
          </div>
        )}

        {loadError && (
          <div
            className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm ${
              "border-warning/30 bg-warning-soft text-warning"
            }`}
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => void loadOverview()}
              className="inline-flex items-center gap-2 rounded-lg bg-warning px-3 py-1.5 font-semibold text-white hover:brightness-95"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Practice summary — one compact row instead of a paragraph */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { id: "completed", label: "Completed", value: stats ? stats.completed : null, icon: CheckCircle2, accent: "text-success" },
            { id: "unfinished", label: "Not completed", value: stats ? stats.unfinished : null, icon: Clock, accent: "text-warning" },
            { id: "avg", label: "Average score", value: stats?.average_score ?? null, icon: TrendingUp, accent: "text-accent-text" },
            { id: "best", label: "Best score", value: stats?.best_score ?? null, icon: Trophy, accent: "text-accent-text" },
          ].map((tile) => (
            <div key={tile.id} className={`rounded-xl border p-4 ${panelClass}`}>
              <div className="flex items-center gap-2">
                <tile.icon size={15} className={tile.accent} />
                <p className={`text-xs ${mutedText}`}>{tile.label}</p>
              </div>
              <p className="mt-1 text-2xl font-bold">{tile.value ?? "—"}</p>
            </div>
          ))}
        </div>

        {/* Three vertical partitions — account | interviews | resumes */}
        <div className="grid items-start gap-6 lg:grid-cols-3">
          {/* ── Partition 1: account ─────────────────────────────────── */}
          <Reveal className={`rounded-2xl border ${panelClass}`}>
            {panelHeading("Account", UserRound, "text-accent-text")}

            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white shadow-lg">
                  {initial}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold">{userData.name}</h3>
                  <p className={`truncate text-sm ${mutedText}`}>
                    {latest?.role
                      ? `${latest.role} · ${latest.experience}`
                      : dataLoaded
                        ? "No interviews yet"
                        : "—"}
                  </p>
                </div>
              </div>

              <dl className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                    <Mail size={17} className="text-accent-text" />
                  </div>
                  <div className="min-w-0">
                    <dt className={`text-xs ${mutedText}`}>Email address</dt>
                    <dd className="truncate text-sm font-medium">{userData.email}</dd>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                    <Phone size={17} className="text-accent-text" />
                  </div>
                  <div className="min-w-0">
                    <dt className={`text-xs ${mutedText}`}>Phone number</dt>
                    <dd className="truncate text-sm font-medium">{userData.phone}</dd>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-soft">
                    <CheckCircle2 size={17} className="text-success" />
                  </div>
                  <div className="min-w-0">
                    <dt className={`text-xs ${mutedText}`}>User ID</dt>
                    <dd className="truncate font-mono text-xs">
                      <span className="select-all">{userData.publicId}</span>
                    </dd>
                  </div>
                </div>
              </dl>

              <button
                type="button"
                className={`mt-5 flex w-full items-center justify-between rounded-lg border p-3 transition border-border hover:bg-surface`}
              >
                <span className="flex items-center gap-2.5">
                  <Lock size={17} className="text-accent-text" />
                  <span className="text-sm font-medium">Change password</span>
                </span>
                <ArrowRight size={16} className="text-ink-subtle" />
              </button>

              <p className={`mt-3 text-xs ${mutedText}`}>
                💡 Editing your details and changing your password are coming soon.
              </p>
            </div>
          </Reveal>

          {/* ── Partition 2: interviews ───────────────────────────────── */}
          <Reveal className={`rounded-2xl border ${panelClass}`}>
            {panelHeading("Interviews", Award, "text-success")}

            <div className="p-5">
              {reportError && (
                <p className={`mb-3 text-sm ${"text-warning"}`}>{reportError}</p>
              )}

              {unfinishedSetup && (
                <p className={`mb-4 text-xs leading-relaxed ${mutedText}`}>
                  You also have an unfinished {unfinishedSetup.role} setup from{" "}
                  {formatShortDate(unfinishedSetup.started_at)}. It can't be resumed — start a new
                  interview to practise that role.
                </p>
              )}

              {!dataLoaded && !loading && (
                <p className={`text-sm ${mutedText}`}>
                  Your interview history couldn't be loaded, so it isn't shown here.
                </p>
              )}

              {dataLoaded && !latest && (
                <div className={`rounded-xl border p-4 ${innerBorder}`}>
                  <p className={`text-sm ${mutedText}`}>
                    You haven't taken an interview yet. Your status and score will show up here.
                  </p>
                  <Link
                    to="/interview/select-role"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
                  >
                    <Mic size={16} />
                    Take your first interview
                  </Link>
                </div>
              )}

              {latest && (
                <div className={`rounded-xl border p-4 border-border bg-surface`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-[11px] uppercase tracking-wider ${mutedText}`}>Latest</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{latest.role}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses(latest)}`}>
                          {statusLabel(latest)}
                        </span>
                      </div>
                      <p className={`mt-1 text-xs ${mutedText}`}>
                        {latest.experience} · {latest.difficulty}
                      </p>
                      {latest.skills.length > 0 && (
                        <p className={`text-xs ${mutedText}`}>{latest.skills.slice(0, 4).join(", ")}</p>
                      )}
                      <p className={`mt-2 flex items-center gap-1.5 text-xs ${mutedText}`}>
                        <CalendarClock size={13} />
                        {isComplete(latest)
                          ? formatDate(latest.completed_at)
                          : `Started ${formatDate(latest.started_at)}`}
                      </p>
                    </div>

                    {isComplete(latest) && typeof latest.score === "number" && (
                      <div className="shrink-0 text-right">
                        <p className={`text-3xl font-bold leading-none ${scoreTone(latest.score)}`}>{latest.score}</p>
                        <p className={`text-[11px] ${mutedText}`}>/ 100</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    {isComplete(latest) ? (
                      <button
                        type="button"
                        onClick={() => void openReport(latest.interview_id)}
                        disabled={openingReport === latest.interview_id}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60"
                      >
                        {openingReport === latest.interview_id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Award size={15} />
                        )}
                        View report
                      </button>
                    ) : (
                      <Link
                        to="/interview/select-role"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent"
                      >
                        <PlayCircle size={15} />
                        Start a new interview
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {earlier.length > 0 && (
                <div className="mt-4">
                  <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${mutedText}`}>
                    Earlier
                    {stats && stats.completed > history.length && (
                      <span className="font-normal normal-case tracking-normal">
                        {" "}
                        · {history.length} of {stats.completed}
                      </span>
                    )}
                  </p>
                  <div className="space-y-2">
                    {earlier.map((interview) => (
                      <div
                        key={interview.interview_id}
                        className={`flex items-center justify-between gap-3 rounded-lg border p-2.5 ${innerBorder}`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{interview.role}</p>
                          <p className={`text-xs ${mutedText}`}>
                            {formatShortDate(
                              isComplete(interview) ? interview.completed_at : interview.started_at
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
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
                              aria-label={`Open ${interview.role} report`}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 border-border text-ink-muted hover:bg-surface`}
                            >
                              {openingReport === interview.interview_id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Award size={13} />
                              )}
                              Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* ── Partition 3: resumes ──────────────────────────────────── */}
          <Reveal className={`rounded-2xl border ${panelClass}`}>
            {panelHeading(
              "Resumes & documents",
              FileText,
              "text-ink-subtle",
              // Uploading happens inside the interview setup (that flow supplies the
              // role/skills a resume row needs), so this jumps there.
              <Link
                to="/interview/select-role"
                aria-label="Add a resume"
                title="Add a resume (via interview setup)"
                className={iconButtonClass}
              >
                <Plus size={16} />
              </Link>
            )}

            <div className="p-5">
              {resumeError && (
                <p className={`mb-3 text-sm ${"text-warning"}`}>{resumeError}</p>
              )}
              {resumeNotice && (
                <p className={`mb-3 text-sm ${"text-success"}`}>{resumeNotice}</p>
              )}

              {!dataLoaded ? (
                !loading && (
                  <p className={`text-sm ${mutedText}`}>
                    Your resumes couldn't be loaded, so they aren't shown here.
                  </p>
                )
              ) : resumes.length === 0 ? (
                <div className={`rounded-xl border p-4 ${innerBorder}`}>
                  <div className="flex items-center gap-2.5">
                    <FileText size={18} className="text-ink-subtle" />
                    <p className="text-sm font-medium">No resume on file</p>
                  </div>
                  <p className={`mt-1 text-sm ${mutedText}`}>
                    Upload one in the interview setup — both the interview and job agent use it.
                  </p>
                  <Link
                    to="/interview/select-profile"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
                  >
                    Upload resume
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {resumes.map((resume) => (
                    <div key={resume.id} className={`rounded-xl border p-3 ${innerBorder}`}>
                      <div className="flex items-start gap-2.5">
                        <FileText size={17} className="mt-0.5 shrink-0 text-ink-subtle" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{resume.file_name}</p>
                          <p className={`text-xs ${mutedText}`}>
                            {resume.role} · {resume.experience}
                          </p>
                          {resume.skills.length > 0 && (
                            <p className={`truncate text-xs ${mutedText}`}>
                              {resume.skills.slice(0, 4).join(", ")}
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-ink-subtle">
                            Added {formatShortDate(resume.created_at)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void openResume(resume.id)}
                            disabled={viewingId === resume.id}
                            aria-label={`View ${resume.file_name}`}
                            title="View extracted content"
                            className={iconButtonClass}
                          >
                            {viewingId === resume.id && !viewed ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({ id: resume.id, name: resume.file_name })
                            }
                            disabled={deletingId === resume.id}
                            aria-label={`Delete ${resume.file_name}`}
                            title="Delete resume"
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-50 border-border text-ink-subtle hover:bg-danger-soft hover:text-danger`}
                          >
                            {deletingId === resume.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      to="/jobs"
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-lg"
                    >
                      <Briefcase size={15} />
                      Match jobs
                    </Link>
                    <Link
                      to="/interview/select-profile"
                      className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition border-border text-ink-muted hover:bg-surface`}
                    >
                      Upload another
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </motion.div>

      {/* ── Resume viewer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewingId !== null && viewed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => {
              setViewingId(null);
              setViewed(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${viewed.file_name} content`}
              className={`flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-canvas`}
            >
              <div className={`flex items-start gap-3 border-b px-5 py-4 ${innerBorder}`}>
                <FileText size={18} className="mt-0.5 shrink-0 text-ink-subtle" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{viewed.file_name}</h3>
                  <p className={`text-xs ${mutedText}`}>
                    {viewed.role} · {viewed.experience} · added {formatShortDate(viewed.created_at)} ·{" "}
                    {viewed.chunk_count} indexed chunk{viewed.chunk_count === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewingId(null);
                    setViewed(null);
                  }}
                  aria-label="Close"
                  className={iconButtonClass}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {/* Be explicit: this is the parsed text, not the uploaded file. */}
                <p className={`mb-4 rounded-lg border px-3 py-2 text-xs border-border bg-surface text-ink-muted`}>
                  This is the text extracted from your resume — the one the AI reads. The
                  uploaded file itself isn't stored, so there's nothing to download. Contact
                  details are removed before indexing.
                </p>

                {viewed.sections.length === 0 ? (
                  <p className={`text-sm ${mutedText}`}>No extracted content was stored for this resume.</p>
                ) : (
                  <div className="space-y-4">
                    {viewed.sections.map((section) => (
                      <div key={section.name}>
                        <p className={`mb-1 text-xs font-semibold uppercase tracking-wider ${
                          "text-accent-text"
                        }`}>
                          {section.name.replace(/_/g, " ")}
                        </p>
                        <p className={`whitespace-pre-wrap text-sm leading-relaxed ${
                          "text-ink-muted"
                        }`}>
                          {section.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => deletingId === null && setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              className={`w-full max-w-md rounded-2xl border p-5 border-border bg-canvas`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft">
                  <AlertTriangle size={19} className="text-danger" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">Delete this resume?</h3>
                  <p className={`mt-1 text-sm ${mutedText}`}>
                    <span className="font-medium">{confirmDelete.name}</span> and everything indexed
                    from it will be removed. Interviews you already completed keep their reports.
                    This can't be undone — you'd need to upload the file again.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  disabled={deletingId !== null}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-surface disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void removeResume()}
                  disabled={deletingId !== null}
                  className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
                >
                  {deletingId !== null ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
