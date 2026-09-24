/**
 * Interview report.
 *
 * UI: the Stitch screen "Interview Feedback & Result" (project
 * 16808869888425310618, screen e64583ec3f6941dc8ded806fd3e42a7f) — restyle only
 * (2026-09-24). Data flow and copy are unchanged from
 * docs/backup/interview-result-before-stitch.tsx.txt; Stitch's sample content
 * (matched jobs, salary bands, dimension scores) is not used.
 */
import { useLocation, useNavigate } from "react-router-dom";
import { Award, BarChart3, CheckCircle2, ChevronDown, FileText, Home, ListChecks, Rocket, RotateCcw, Target } from "lucide-react";
import { useInterview } from "@/contexts/use-interview";
import type { InterviewSubmitResponse } from "@/types/api";

type ResultState = {
  result?: InterviewSubmitResponse;
  totalQuestions?: number;
  answeredQuestions?: number;
};

const RESULT_STORAGE_KEY = "talentpulse_last_result";

const scoreTone = (score: number) => {
  if (score >= 80) return "ph-glow text-ph-green";
  if (score >= 65) return "text-ph-green";
  return "text-ph-ink";
};

/** Same three bands as `scoreTone`, for the score pill backgrounds. */
const scorePill = (score: number) => {
  if (score >= 80) return "border border-ph-green/50 bg-ph-green/10 text-ph-green";
  if (score >= 65) return "border border-ph-green/40 bg-ph-green/[0.06] text-ph-green";
  return "border border-ph-ink/30 bg-ph-ink/[0.06] text-ph-ink";
};

function formatCompletedAt(value: string | undefined) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function readPersistedResult(): ResultState | null {
  try {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResultState;
  } catch {
    return null;
  }
}

// Stitch styling
const RAISED = "border border-ph-line-strong";
const RECESSED = "border border-ph-line";
const CTA =
  "bg-ph-ink font-semibold text-black shadow-[0_0_0_1px_rgba(0,255,65,0.25)] hover:shadow-[0_0_24px_rgba(0,255,65,0.35)] active:scale-[0.98] transition-all";
const LABEL_SM = "text-[11px] leading-[14px] tracking-[0.04em] font-semibold";
const LABEL_MD = "text-[13px] leading-4 tracking-[0.02em] font-medium";
const BODY_SM = "text-[12px] leading-[18px] tracking-[0.01em]";
const BODY_MD = "text-[14px] leading-[22px]";
const H_SM = "font-st-display text-[18px] leading-[26px] tracking-[-0.01em] font-medium";
const CODE_SM_PILL =
  "rounded-full bg-black px-3 py-1 text-[12px] leading-4 font-medium text-ph-ink-muted border border-ph-line";

/** Stitch's glowing score ring. */
function ScoreDial({ score }: { score: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  return (
    <div className="relative mx-auto h-44 w-44" role="img" aria-label={`Final score ${score} out of 100`}>
      <div className="absolute inset-4 rounded-full bg-ph-green/10 blur-2xl" />
      <svg viewBox="0 0 160 160" className="relative h-full w-full -rotate-90">
        <defs>
          <linearGradient id="stDial" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#00ff41" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={r} fill="none" stroke="#15803d" strokeWidth="12" strokeDasharray="3 5" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="url(#stDial)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-st-display text-[48px] font-bold leading-none tabular-nums ${scoreTone(score)}`}>{score}</span>
        <span className={`${LABEL_SM} mt-1 uppercase tracking-widest text-ph-ink-muted`}>/100</span>
      </div>
    </div>
  );
}

export default function InterviewResultPage() {
  const navigate = useNavigate();
  const { resetInterview } = useInterview();
  const { state } = useLocation();
  // Use router state first (fresh navigation), fall back to sessionStorage (page refresh)
  const typedState: ResultState = (state as ResultState) || readPersistedResult() || {};
  const result = typedState.result;
  const totalQuestions = typedState.totalQuestions ?? result?.feedback.question_feedback.length ?? 0;
  const answeredQuestions = typedState.answeredQuestions ?? result?.feedback.question_feedback.length ?? 0;

  const completedAt = formatCompletedAt(result?.completed_at ?? undefined);

  if (!result) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-ph-bg px-6 font-st-body text-ph-ink">
        <div className={`w-full max-w-lg rounded-[2rem] bg-ph-surface p-8 text-center ${RAISED}`}>
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-ph-green ${RECESSED}`}>
            <FileText size={22} />
          </div>
          <h2 className="font-st-display text-[24px] font-semibold leading-8">No interview report found</h2>
          <p className={`${BODY_MD} mt-2 text-ph-ink-muted`}>Submit an interview first to see your score and feedback.</p>
          <button type="button" onClick={() => navigate("/dashboard")} className={`${LABEL_MD} ${CTA} mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold`}>
            <Home size={16} /> Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  const newInterview = () => {
    resetInterview();
    sessionStorage.removeItem(RESULT_STORAGE_KEY);
    navigate("/interview/select-role");
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-ph-bg font-st-body text-[14px] leading-5 text-ph-ink antialiased">
      <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-ph-green/[0.08] blur-[128px]" />
      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className={`inline-flex items-center gap-1.5 rounded-full bg-black px-2 py-0.5 ${RECESSED}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-ph-green shadow-[0_0_6px_#00ff41]" />
              <span className={`${LABEL_SM} uppercase tracking-widest text-ph-green`}>Interview report</span>
            </span>
            <h1 className="mt-1 font-st-display text-[28px] font-semibold leading-9 tracking-[-0.02em] text-ph-ink md:text-[36px] md:leading-[44px]">
              Interview completed
            </h1>
            <p className={`${BODY_MD} mt-1 max-w-2xl text-ph-ink-muted`}>{result.message}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left: score + overall feedback */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className={`rounded-[2rem] bg-ph-surface p-6 ${RAISED}`}>
              <div className="flex justify-center">
                <span className={`${CODE_SM_PILL} inline-flex items-center gap-1.5`}>
                  <BarChart3 size={14} className="text-ph-green" />
                  Completed: {completedAt}
                </span>
              </div>
              <p className={`${LABEL_SM} mt-4 text-center uppercase tracking-widest text-ph-ink-soft`}>Final score</p>
              <div className="mt-2">
                <ScoreDial score={result.score} />
              </div>
              <p className={`${BODY_SM} text-center text-ph-ink-muted`}>out of 100</p>
              <dl className="mt-4 flex flex-wrap justify-center gap-2">
                <div className={`${CODE_SM_PILL} flex items-center gap-1.5`}>
                  <Award size={14} className="text-ph-green" />
                  <dt className="sr-only">Status</dt>
                  <dd>Status: {result.status}</dd>
                </div>
                <div className={`${CODE_SM_PILL} flex items-center gap-1.5`}>
                  <Target size={14} className="text-ph-green" />
                  <dt className="sr-only">Answered</dt>
                  <dd>
                    Answered: {answeredQuestions} of {totalQuestions}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-2">
                <button type="button" onClick={newInterview} className={`${LABEL_MD} ${CTA} flex w-full items-center justify-center gap-2 rounded-full py-3 font-semibold`}>
                  <RotateCcw size={16} /> New interview
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className={`${LABEL_MD} flex w-full items-center justify-center gap-2 rounded-full bg-ph-surface-2 py-3 text-ph-ink transition-colors hover:bg-ph-surface-2`}
                >
                  <Home size={16} /> Dashboard
                </button>
              </div>
            </div>

            <div className={`rounded-[2rem] bg-ph-surface p-6 ${RAISED}`}>
              <h2 className={`${H_SM} flex items-center gap-2 font-semibold text-ph-ink`}>
                <FileText size={18} className="text-ph-green" />
                Overall feedback
              </h2>
              <p className={`${BODY_MD} mt-3 text-ph-ink-muted`}>{result.feedback.overall_feedback}</p>
            </div>
          </div>

          {/* Right: strengths / improve, questions, next steps */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="grid gap-4 md:grid-cols-2">
              <div className={`rounded-[2rem] bg-ph-surface p-6 ${RAISED}`}>
                <h3 className={`${H_SM} flex items-center gap-2 font-semibold text-ph-green`}>
                  <CheckCircle2 size={18} />
                  Strengths
                </h3>
                <ul className="mt-3 space-y-2">
                  {result.feedback.strengths.map((item, idx) => (
                    <li key={`str-${idx}`} className={`${BODY_SM} flex gap-2 rounded-2xl bg-black px-3 py-2 text-ph-ink-muted ${RECESSED}`}>
                      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ph-green" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-[2rem] bg-ph-surface p-6 ${RAISED}`}>
                <h3 className={`${H_SM} flex items-center gap-2 font-semibold text-ph-ink`}>
                  <Target size={18} />
                  Improve next
                </h3>
                <ul className="mt-3 space-y-2">
                  {result.feedback.improvements.map((item, idx) => (
                    <li key={`imp-${idx}`} className={`${BODY_SM} flex gap-2 rounded-2xl bg-black px-3 py-2 text-ph-ink-muted ${RECESSED}`}>
                      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ph-ink" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className={`${H_SM} flex items-center gap-2 font-semibold text-ph-ink`}>
                  <ListChecks size={18} className="text-ph-green" />
                  Question-by-question
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {result.feedback.question_feedback.map((item) => (
                  <details key={item.question_id} className={`group rounded-[2rem] bg-ph-surface ${RAISED}`}>
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ph-green/70">
                      <span className={`${LABEL_SM} shrink-0 rounded-2xl px-2 py-1 tabular-nums ${scorePill(item.score)}`}>{item.score}/100</span>
                      <span className="min-w-0 flex-1">
                        <span className={`${LABEL_MD} block font-semibold text-ph-ink`}>{item.question_id.toUpperCase()}</span>
                        <span className={`${BODY_SM} block truncate text-ph-ink-muted group-open:hidden`}>
                          {item.word_count} words • {item.feedback}
                        </span>
                        <span className={`${BODY_SM} hidden text-ph-ink-muted group-open:block`}>{item.word_count} words</span>
                      </span>
                      <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-ph-ink-soft transition-transform group-open:rotate-180" />
                    </summary>
                    <p className={`${BODY_SM} mx-5 mb-4 rounded-2xl bg-black p-3 text-ph-ink-muted ${RECESSED}`}>{item.feedback}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className={`rounded-[2rem] bg-ph-surface p-6 ${RAISED}`}>
              <h2 className={`${H_SM} flex items-center gap-2 font-semibold text-ph-ink`}>
                <Rocket size={18} className="text-ph-green" />
                Next steps
              </h2>
              <ul className="mt-3 space-y-2">
                {result.feedback.next_steps.map((step, idx) => (
                  <li key={`step-${idx}`} className={`${BODY_MD} flex items-start gap-3 rounded-[2rem] bg-black p-3 text-ph-ink-muted ${RECESSED}`}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ph-green/10 font-st-display text-[13px] font-semibold text-ph-green">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

