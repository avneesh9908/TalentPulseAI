import { useLocation, useNavigate } from "react-router-dom";
import { Award, BarChart3, CheckCircle2, Home, RotateCcw, Target } from "lucide-react";
import { useInterview } from "@/contexts/use-interview";
import type { InterviewSubmitResponse } from "@/types/api";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelTitle } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

type ResultState = {
  result?: InterviewSubmitResponse;
  totalQuestions?: number;
  answeredQuestions?: number;
};

const RESULT_STORAGE_KEY = "talentpulse_last_result";

const scoreTone = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 65) return "text-accent-text";
  return "text-warning";
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

export default function InterviewResultPage() {
  const navigate = useNavigate();
  const { resetInterview } = useInterview();
  const { state } = useLocation();
  // Use router state first (fresh navigation), fall back to sessionStorage (page refresh)
  const typedState: ResultState = (state as ResultState) || readPersistedResult() || {};
  const result = typedState.result;
  const totalQuestions = typedState.totalQuestions ?? result?.feedback.question_feedback.length ?? 0;
  const answeredQuestions = typedState.answeredQuestions ?? result?.feedback.question_feedback.length ?? 0;

  const completedAt = formatCompletedAt(result?.completed_at);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <EmptyState
          className="w-full max-w-lg bg-canvas"
          title="No interview report found"
          description="Submit an interview first to see your score and feedback."
          action={
            <Button onClick={() => navigate("/dashboard")}>
              <Home /> Go to dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="wrap py-8">
        <PageHeader
          eyebrow="Interview report"
          title="Interview completed"
          description={result.message}
          actions={
            <>
              <Button
                onClick={() => {
                  resetInterview();
                  sessionStorage.removeItem(RESULT_STORAGE_KEY);
                  navigate("/interview/select-role");
                }}
              >
                <RotateCcw /> New interview
              </Button>
              <Button variant="secondary" onClick={() => navigate("/dashboard")}>
                <Home /> Dashboard
              </Button>
            </>
          }
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel tone="raised" className="lg:col-span-1">
            <p className="overline">Final score</p>
            <p className={`mt-1 text-[3.5rem] font-semibold leading-none tabular-nums ${scoreTone(result.score)}`}>
              {result.score}
            </p>
            <p className="mt-1 text-small text-ink-subtle">out of 100</p>
            <dl className="mt-5 space-y-2 text-small">
              <div className="flex items-center gap-2 text-ink-muted">
                <Award size={14} className="text-ink-subtle" />
                <dt className="sr-only">Status</dt>
                <dd>Status: {result.status}</dd>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Target size={14} className="text-ink-subtle" />
                <dt className="sr-only">Answered</dt>
                <dd>Answered: {answeredQuestions} of {totalQuestions}</dd>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <BarChart3 size={14} className="text-ink-subtle" />
                <dt className="sr-only">Completed</dt>
                <dd>Completed: {completedAt}</dd>
              </div>
            </dl>
          </Panel>

          <Panel tone="raised" className="lg:col-span-2">
            <PanelTitle>Overall feedback</PanelTitle>
            <p className="mt-2 text-body text-ink-muted">{result.feedback.overall_feedback}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-border bg-surface p-4">
                <h3 className="flex items-center gap-2 text-small font-semibold text-success">
                  <CheckCircle2 size={15} />
                  Strengths
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {result.feedback.strengths.map((item, idx) => (
                    <li key={`str-${idx}`} className="text-small text-ink-muted">{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-border bg-surface p-4">
                <h3 className="flex items-center gap-2 text-small font-semibold text-warning">
                  <Target size={15} />
                  Improve next
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {result.feedback.improvements.map((item, idx) => (
                    <li key={`imp-${idx}`} className="text-small text-ink-muted">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>
        </div>

        <Panel tone="raised" className="mt-4">
          <PanelTitle>Question-by-question</PanelTitle>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {result.feedback.question_feedback.map((item) => (
              <div key={item.question_id} className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="text-small font-medium text-ink">{item.question_id.toUpperCase()}</p>
                  <p className={`text-small font-semibold tabular-nums ${scoreTone(item.score)}`}>
                    {item.score}/100
                  </p>
                </div>
                <p className="mt-1 text-small text-ink-subtle">{item.word_count} words</p>
                <p className="mt-2 text-small text-ink-muted">{item.feedback}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel tone="raised" className="mt-4">
          <PanelTitle>Next steps</PanelTitle>
          <ul className="mt-3 space-y-2">
            {result.feedback.next_steps.map((step, idx) => (
              <li key={`step-${idx}`} className="flex gap-2.5 text-body text-ink-muted">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {step}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
