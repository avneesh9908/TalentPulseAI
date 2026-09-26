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
import { CopyBar } from "@/components/phos/copy";
import { PH_CARD_HOVER, PH_MONO, PH_MONO_RAW } from "@/components/phos/tokens";
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
  Layers,
} from "lucide-react";

/** An interview is finished only once it has been scored. */
const isComplete = (interview: InterviewSummary) => interview.status === "submitted";

// Answers/questions are never persisted server-side, so an unsubmitted interview
// cannot be resumed later — label it for what it is rather than implying it can.
const statusLabel = (interview: InterviewSummary) =>
  isComplete(interview) ? "Completed" : "Not completed";

const statusClasses = (interview: InterviewSummary) =>
  isComplete(interview)
    ? "border-ph-green/50 bg-ph-green/10 text-ph-green"
    : "border-ph-ink/30 bg-ph-ink/[0.06] text-ph-ink";

/*
 * Two colours only, so a score is graded by intensity rather than by hue: a
 * pass glows, a near-pass is plain phosphor, anything below reads as cream.
 */
const scoreTone = (score: number) => {
  if (score >= 80) return "ph-glow text-ph-green";
  if (score >= 65) return "text-ph-green";
  return "text-ph-ink";
};

/*
 * UI: the phosphor-terminal design (2026-09-24) — restyle only: every label,
 * number and action is the page's own, and the logic block is unchanged from
 * docs/backup/profile-before-phosphor.tsx.txt. Only the tone helpers above, the
 * style constants below and the markup differ.
 */
const CARD = "rounded-[16px] border border-ph-line-strong bg-ph-surface";
const CTA =
  "bg-ph-ink font-semibold text-black transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,255,65,0.35)] active:translate-y-0";
const GHOST_BTN =
  "inline-flex items-center gap-1.5 rounded-full border border-ph-line-strong px-4 py-2 text-ph-ink transition-colors hover:border-ph-green hover:text-ph-green";
const LABEL_MD = "text-[13px] leading-4 tracking-[0.02em] font-medium";
const BODY_SM = "text-[12px] leading-[18px] tracking-[0.01em]";
const BODY_LG = "text-[15px] leading-6 tracking-[-0.01em]";
const H_SM = "font-st-display text-[17px] leading-6 tracking-[-0.01em] font-medium";

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

  const iconButtonClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-ph-line text-ph-ink-soft transition-colors hover:border-ph-green hover:text-ph-green disabled:opacity-50";

  const sectionHeading = (
    label: string,
    Icon: ComponentType<{ size?: number | string; className?: string }>,
    accent: string,
    action?: React.ReactNode
  ) => (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Icon size={16} className={accent} />
        <h2 className={`${PH_MONO} text-ph-green`}>{label}</h2>
      </div>
      {action}
    </div>
  );

  const statTiles = [
    { id: "completed", label: "Completed", value: stats ? stats.completed : null, icon: CheckCircle2, accent: "text-ph-green" },
    { id: "unfinished", label: "Not completed", value: stats ? stats.unfinished : null, icon: Clock, accent: "text-ph-ink-soft" },
    { id: "avg", label: "Average score", value: stats?.average_score ?? null, icon: TrendingUp, accent: "text-ph-green" },
    { id: "best", label: "Best score", value: stats?.best_score ?? null, icon: Trophy, accent: "text-ph-green" },
  ];

  return (
    <div className="ph-grid relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-ph-bg font-st-body text-[14px] leading-5 text-ph-ink antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-ph-green/[0.06] blur-[128px]"
      />

      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header plate — identity, practice summary and actions */}
        <div className={`flex w-full flex-col items-start justify-between gap-6 p-6 xl:flex-row xl:items-center ${CARD}`}>
          <div className="flex min-w-0 flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-ph-green/40 bg-ph-green/[0.06] font-st-display text-[28px] font-semibold text-ph-green">
                {initial}
              </div>
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h1 className="font-st-display text-[28px] font-semibold leading-9 tracking-[-0.025em] text-ph-ink md:text-[34px] md:leading-[42px]">
                  {userData.name}
                </h1>
                <div className="flex items-center gap-2 rounded-full border border-ph-green/40 bg-ph-green/[0.06] px-2.5 py-1">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ph-green shadow-[0_0_6px_#00ff41]" />
                  <span className={`${PH_MONO} text-ph-green`}>Your Profile</span>
                </div>
              </div>
              <p className={`${BODY_LG} mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-ph-ink-muted`}>
                <span className="font-medium text-ph-ink">
                  {latest?.role
                    ? `${latest.role} · ${latest.experience}`
                    : dataLoaded
                      ? "No interviews yet"
                      : "—"}
                </span>
              </p>
              <p className={`${PH_MONO_RAW} mt-1 text-ph-ink-soft`}>Your account, your interview history and the resumes on file</p>
              {/* Practice summary — the four real counters as pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {statTiles.map((tile) => (
                  <div key={tile.id} className="flex items-center gap-2 rounded-full border border-ph-line bg-black px-2.5 py-1">
                    <tile.icon size={13} className={tile.accent} />
                    <span className={`${PH_MONO} text-ph-ink-soft`}>{tile.label}</span>
                    <span className="tnum font-ph-mono text-[12px] font-medium text-ph-ink">{tile.value ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-start gap-2 xl:w-auto xl:justify-end">
            <Link to="/dashboard" className={`${LABEL_MD} ${GHOST_BTN}`}>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <Link to="/interview/select-role" className={`${LABEL_MD} ${GHOST_BTN}`}>
              <Mic size={16} />
              Start interview
            </Link>
            <Link to="/jobs" className={`${LABEL_MD} ${CTA} inline-flex items-center gap-1.5 rounded-full px-4 py-2`}>
              <Briefcase size={16} />
              Find jobs
            </Link>
          </div>
        </div>

        {loading && (
          <div className={`${BODY_SM} mt-4 flex items-center gap-3 p-4 text-ph-ink-muted ${CARD}`}>
            <Loader2 size={16} className="animate-spin text-ph-green" />
            Loading your account…
          </div>
        )}

        {loadError && (
          <div className={`${BODY_SM} mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-ph-ink/30 bg-ph-ink/[0.06] p-4 text-ph-ink`}>
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => void loadOverview()}
              className={`${LABEL_MD} inline-flex items-center gap-2 rounded-full border border-ph-green/45 px-3 py-1.5 text-ph-green transition-colors hover:bg-ph-green/10`}
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Three columns — resumes | interviews | account */}
        <div className="grid w-full grid-cols-1 items-start gap-5 py-6 lg:grid-cols-12">
          {/* ── Column 1: resumes ─────────────────────────────────────── */}
          <Reveal className="flex w-full flex-col gap-4 lg:col-span-6 xl:col-span-3">
            {sectionHeading(
              "Resumes & documents",
              Layers,
              "text-ph-green",
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

            {resumeError && <p className={`${BODY_SM} text-ph-ink`}>{resumeError}</p>}
            {resumeNotice && <p className={`${BODY_SM} text-ph-green`}>{resumeNotice}</p>}

            {!dataLoaded ? (
              !loading && (
                <p className={`${BODY_SM} p-4 text-ph-ink-muted ${CARD}`}>
                  Your resumes couldn't be loaded, so they aren't shown here.
                </p>
              )
            ) : resumes.length === 0 ? (
              <div className="flex flex-col items-center gap-2.5 rounded-[16px] border border-dashed border-ph-line-strong bg-black p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-ph-green/30 bg-ph-green/[0.06] text-ph-green">
                  <FileText size={20} />
                </div>
                <p className={`${LABEL_MD} font-medium text-ph-ink`}>No resume on file</p>
                <p className={`${BODY_SM} text-ph-ink-muted`}>
                  Upload one in the interview setup — both the interview and job agent use it.
                </p>
                <Link
                  to="/interview/select-profile"
                  className={`${LABEL_MD} ${CTA} mt-1 inline-flex items-center gap-2 rounded-full px-4 py-2`}
                >
                  Upload resume
                  <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              /* The list grows with every interview setup — 11 rows here already —
                 so it is capped at roughly three cards and scrolls. The cap is a
                 max-height, not a fixed one: with one or two resumes the column
                 still shrinks to fit. `pr-1` keeps the scrollbar off the cards'
                 hover border. */
              <div className="flex max-h-[32rem] flex-col gap-3 overflow-y-auto pr-1">
                {resumes.map((resume) => (
                  <div key={resume.id} className={`flex flex-col gap-3 rounded-[16px] border border-ph-line-strong bg-ph-surface p-4 ${PH_CARD_HOVER}`}>
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-ph-green/30 bg-ph-green/[0.06] text-ph-green">
                        <FileText size={18} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className={`${LABEL_MD} truncate font-medium text-ph-ink`}>{resume.file_name}</span>
                        <span className={`${BODY_SM} text-ph-ink-muted`}>
                          {resume.role} · {resume.experience}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 rounded-[10px] border border-ph-line bg-black p-2.5">
                      {resume.skills.length > 0 && (
                        <span className={`${BODY_SM} truncate text-ph-ink-muted`}>{resume.skills.slice(0, 4).join(", ")}</span>
                      )}
                      <span className={`${PH_MONO_RAW} text-ph-ink-soft`}>Added {formatShortDate(resume.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void openResume(resume.id)}
                        disabled={viewingId === resume.id}
                        aria-label={`View ${resume.file_name}`}
                        title="View extracted content"
                        className={`${LABEL_MD} flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ph-line-strong py-1.5 text-ph-ink transition-colors hover:border-ph-green hover:text-ph-green disabled:opacity-50`}
                      >
                        {viewingId === resume.id && !viewed ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Eye size={15} className="text-ph-green" />
                        )}
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete({ id: resume.id, name: resume.file_name })}
                        disabled={deletingId === resume.id}
                        aria-label={`Delete ${resume.file_name}`}
                        title="Delete resume"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ph-line text-ph-ink-soft transition-colors hover:border-ph-ink/50 hover:text-ph-ink disabled:opacity-50"
                      >
                        {deletingId === resume.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link to="/jobs" className={`${LABEL_MD} ${CTA} inline-flex items-center gap-2 rounded-full px-4 py-2`}>
                    <Briefcase size={15} />
                    Match jobs
                  </Link>
                  <Link to="/interview/select-profile" className={`${LABEL_MD} ${GHOST_BTN}`}>
                    Upload another
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            )}
          </Reveal>

          {/* ── Column 2: interviews ──────────────────────────────────── */}
          <Reveal className="flex w-full flex-col gap-4 lg:col-span-6 xl:col-span-5">
            {sectionHeading("Interviews", Award, "text-ph-green")}

            {reportError && <p className={`${BODY_SM} text-ph-ink`}>{reportError}</p>}

            {unfinishedSetup && (
              <p className={`${BODY_SM} rounded-[12px] border border-ph-line bg-black p-3 leading-relaxed text-ph-ink-muted`}>
                You also have an unfinished {unfinishedSetup.role} setup from{" "}
                {formatShortDate(unfinishedSetup.started_at)}. It can't be resumed — start a new
                interview to practise that role.
              </p>
            )}

            {!dataLoaded && !loading && (
              <p className={`${BODY_SM} p-4 text-ph-ink-muted ${CARD}`}>
                Your interview history couldn't be loaded, so it isn't shown here.
              </p>
            )}

            {dataLoaded && !latest && (
              <div className={`p-4 ${CARD}`}>
                <p className={`${BODY_SM} text-ph-ink-muted`}>
                  You haven't taken an interview yet. Your status and score will show up here.
                </p>
                <Link
                  to="/interview/select-role"
                  className={`${LABEL_MD} ${CTA} mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2`}
                >
                  <Mic size={16} />
                  Take your first interview
                </Link>
              </div>
            )}

            {latest && (
              <div className={`rounded-[16px] border border-ph-green/40 bg-ph-surface p-4 ${PH_CARD_HOVER}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`${PH_MONO} rounded-full border border-ph-green/50 bg-ph-green/10 px-2 py-0.5 text-ph-green`}>
                        Latest
                      </span>
                      <span className={`${PH_MONO} inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${statusClasses(latest)}`}>
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                        {statusLabel(latest)}
                      </span>
                    </div>
                    <p className={`${H_SM} mt-2 truncate text-ph-ink`}>{latest.role}</p>
                    <p className={`${BODY_SM} text-ph-ink-muted`}>
                      {latest.experience} · {latest.difficulty}
                    </p>
                    {latest.skills.length > 0 && (
                      <p className={`${BODY_SM} text-ph-ink-muted`}>{latest.skills.slice(0, 4).join(", ")}</p>
                    )}
                    <p className={`${PH_MONO_RAW} mt-2 flex items-center gap-1.5 text-ph-ink-soft`}>
                      <CalendarClock size={13} />
                      {isComplete(latest) ? formatDate(latest.completed_at) : `Started ${formatDate(latest.started_at)}`}
                    </p>
                  </div>

                  {isComplete(latest) && typeof latest.score === "number" && (
                    <div className="shrink-0 text-right">
                      <p className={`tnum font-st-display text-[32px] font-semibold leading-none ${scoreTone(latest.score)}`}>{latest.score}</p>
                      <p className={`${PH_MONO_RAW} mt-1 text-ph-ink-soft`}>/ 100</p>
                    </div>
                  )}
                </div>

                {isComplete(latest) && typeof latest.score === "number" && (
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black">
                    <div className="h-full rounded-full bg-ph-green shadow-[0_0_10px_rgba(0,255,65,0.5)]" style={{ width: `${Math.max(0, Math.min(100, latest.score))}%` }} />
                  </div>
                )}

                <div className="mt-4">
                  {isComplete(latest) ? (
                    <button
                      type="button"
                      onClick={() => void openReport(latest.interview_id)}
                      disabled={openingReport === latest.interview_id}
                      className={`${LABEL_MD} ${CTA} inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 disabled:opacity-60`}
                    >
                      {openingReport === latest.interview_id ? <Loader2 size={15} className="animate-spin" /> : <Award size={15} />}
                      View report
                    </button>
                  ) : (
                    <Link
                      to="/interview/select-role"
                      className={`${LABEL_MD} ${CTA} inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2`}
                    >
                      <PlayCircle size={15} />
                      Start a new interview
                    </Link>
                  )}
                </div>
              </div>
            )}

            {earlier.length > 0 && (
              <div className="flex flex-col gap-3">
                {earlier.map((interview) => (
                  <div key={interview.interview_id} className={`flex flex-col gap-2.5 rounded-[16px] border border-ph-line-strong bg-ph-surface p-4 ${PH_CARD_HOVER}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`${H_SM} truncate text-ph-ink`}>{interview.role}</p>
                        <p className={`${PH_MONO_RAW} text-ph-ink-soft`}>
                          {formatShortDate(isComplete(interview) ? interview.completed_at : interview.started_at)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {typeof interview.score === "number" && (
                          <span className={`tnum font-st-display text-[26px] font-semibold leading-none ${scoreTone(interview.score)}`}>
                            {interview.score}
                          </span>
                        )}
                        {isComplete(interview) && (
                          <button
                            type="button"
                            onClick={() => void openReport(interview.interview_id)}
                            disabled={openingReport === interview.interview_id}
                            aria-label={`Open ${interview.role} report`}
                            className={`${LABEL_MD} inline-flex items-center gap-1.5 rounded-full border border-ph-line-strong px-3 py-1.5 text-ph-ink transition-colors hover:border-ph-green hover:text-ph-green disabled:opacity-60`}
                          >
                            {openingReport === interview.interview_id ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />}
                            Report
                          </button>
                        )}
                      </div>
                    </div>
                    {typeof interview.score === "number" && (
                      <div className="h-1 w-full overflow-hidden rounded-full bg-black">
                        <div className="h-full rounded-full bg-ph-green/70" style={{ width: `${Math.max(0, Math.min(100, interview.score))}%` }} />
                      </div>
                    )}
                  </div>
                ))}
                <p className={`${PH_MONO} px-1 text-ph-ink-soft`}>
                  Earlier
                  {stats && stats.completed > history.length && (
                    <span className="normal-case tracking-normal">
                      {" "}
                      · {history.length} of {stats.completed}
                    </span>
                  )}
                </p>
              </div>
            )}
          </Reveal>

          {/* ── Column 3: account ─────────────────────────────────────── */}
          <Reveal className="flex w-full flex-col gap-4 lg:col-span-12 xl:col-span-4">
            {sectionHeading("Account", UserRound, "text-ph-green")}
            <div className={`flex flex-col gap-3 p-6 ${CARD}`}>
              <dl className="grid grid-cols-1 gap-2.5">
                {[
                  { label: "Email address", value: userData.email, icon: Mail },
                  { label: "Phone number", value: userData.phone, icon: Phone },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3 rounded-[12px] border border-ph-line bg-black p-3">
                    <row.icon size={16} className="shrink-0 text-ph-green" />
                    <div className="min-w-0">
                      <dt className={`${PH_MONO} text-ph-ink-soft`}>{row.label}</dt>
                      <dd className="truncate font-medium text-ph-ink">{row.value}</dd>
                    </div>
                  </div>
                ))}
                {/* The one value on this page worth copying, so it gets the copy bar. */}
                <div>
                  <dt className={`${PH_MONO} mb-1.5 flex items-center gap-2 text-ph-ink-soft`}>
                    <CheckCircle2 size={14} className="text-ph-green" />
                    User ID
                  </dt>
                  <dd>
                    <CopyBar label="ID" value={userData.publicId} copyLabel="Copy user id" />
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                className={`${LABEL_MD} flex w-full items-center justify-between rounded-full border border-ph-line-strong px-4 py-2.5 text-ph-ink transition-colors hover:border-ph-green hover:text-ph-green`}
              >
                <span className="flex items-center gap-2.5">
                  <Lock size={16} className="text-ph-green" />
                  Change password
                </span>
                <ArrowRight size={16} className="text-ph-ink-soft" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 rounded-full border border-ph-line bg-ph-surface px-4 py-2.5">
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45 bg-ph-green" />
              <p className={`${BODY_SM} text-ph-ink-muted`}>💡 Editing your details and changing your password are coming soon.</p>
            </div>
          </Reveal>
        </div>
      </motion.div>
      </div>

      {/* ── Resume viewer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewingId !== null && viewed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-st-body backdrop-blur-sm"
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
              className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[16px] border border-ph-line-strong bg-black text-ph-ink"
            >
              <div className="flex items-start gap-3 border-b border-ph-line px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-ph-green/30 bg-ph-green/[0.06] text-ph-green">
                  <FileText size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`${H_SM} truncate`}>{viewed.file_name}</h3>
                  <p className={`${PH_MONO_RAW} mt-0.5 text-ph-ink-soft`}>
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

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                {/* Be explicit: this is the parsed text, not the uploaded file. */}
                <p className={`${BODY_SM} mb-4 rounded-[12px] border border-ph-line bg-ph-surface px-3.5 py-3 text-ph-ink-muted`}>
                  This is the text extracted from your resume — the one the AI reads. The
                  uploaded file itself isn't stored, so there's nothing to download. Contact
                  details are removed before indexing.
                </p>

                {viewed.sections.length === 0 ? (
                  <p className={`${BODY_SM} text-ph-ink-muted`}>No extracted content was stored for this resume.</p>
                ) : (
                  <div className="space-y-5">
                    {viewed.sections.map((section) => (
                      <div key={section.name}>
                        <p className={`${PH_MONO} mb-1.5 text-ph-green`}>{section.name.replace(/_/g, " ")}</p>
                        <p className={`${BODY_SM} whitespace-pre-wrap leading-relaxed text-ph-ink-muted`}>{section.text}</p>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-st-body backdrop-blur-sm"
            onClick={() => deletingId === null && setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md rounded-[16px] border border-ph-line-strong bg-black p-6 text-ph-ink"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ph-ink/40 bg-ph-ink/[0.08]">
                  <AlertTriangle size={18} className="text-ph-ink" />
                </div>
                <div className="min-w-0">
                  <h3 className={H_SM}>Delete this resume?</h3>
                  <p className={`${BODY_SM} mt-1.5 text-ph-ink-muted`}>
                    <span className="font-medium text-ph-ink">{confirmDelete.name}</span> and everything indexed
                    from it will be removed. Interviews you already completed keep their reports.
                    This can't be undone — you'd need to upload the file again.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  disabled={deletingId !== null}
                  className={`${LABEL_MD} rounded-full border border-ph-line-strong px-4 py-2 text-ph-ink transition-colors hover:border-ph-line-bright disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void removeResume()}
                  disabled={deletingId !== null}
                  className={`${LABEL_MD} inline-flex items-center gap-2 rounded-full border border-ph-ink/50 bg-ph-ink/10 px-4 py-2 font-semibold text-ph-ink transition-colors hover:bg-ph-ink/20 disabled:opacity-60`}
                >
                  {deletingId !== null ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
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
