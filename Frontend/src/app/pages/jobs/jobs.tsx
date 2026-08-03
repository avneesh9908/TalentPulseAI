/**
 * Job Search Agent — setup + match status table.
 *
 * Flow: on load, try GET /jobs/setup. 404 → one-time setup (Gemini-suggested
 * designations as editable chips; user can add a totally different role).
 * Otherwise show the saved setup with [Re-setup] and the match table.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { motion } from "framer-motion";
import { Check, Loader2, Plus, RefreshCw, Search, Settings2, Sparkles, X } from "lucide-react";
import {
  getJobMatches,
  getJobResumes,
  getJobSetup,
  runJobSearch,
  saveJobSetup,
  suggestDesignations,
  updateJobMatchStatus,
  type JobMatch,
  type JobSetup,
  type MatchStatus,
  type ResumeOption,
} from "@/api/jobService";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";

type Mode = "loading" | "setup" | "table";

const STATUS_LABELS: Record<MatchStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  pending_apply: "Pending",
  applied: "Applied",
  dismissed: "Dismissed",
};

const STATUS_BADGE: Record<MatchStatus, string> = {
  new: "bg-accent-soft text-accent-text",
  reviewed: "bg-accent-soft text-accent-text",
  pending_apply: "bg-warning-soft text-warning",
  applied: "bg-success-soft text-success",
  dismissed: "bg-surface-strong text-ink-subtle",
};

const FLOW_STEPS = [
  { title: "Resume & targets", desc: "Pick a resume, confirm the roles" },
  { title: "Agent searches", desc: "Company career pages, ranked" },
  { title: "Review & apply", desc: "Open, apply, track status" },
];

const FILTERS: Array<{ label: string; value: MatchStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Pending", value: "pending_apply" },
  { label: "Applied", value: "applied" },
  { label: "Dismissed", value: "dismissed" },
];

const errMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
    if (detail) return detail;
  }
  return err instanceof Error ? err.message : fallback;
};

export default function JobsPage() {
  const [mode, setMode] = useState<Mode>("loading");
  const [setup, setSetup] = useState<JobSetup | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [filter, setFilter] = useState<MatchStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Setup-mode state
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  // The job agent uses its OWN resume choice, independent of the interview flow.
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [chipInput, setChipInput] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

  const loadMatches = useCallback(async () => {
    try {
      const data = await getJobMatches();
      setMatches(data.matches);
    } catch (err) {
      setError(errMessage(err, "Failed to load matches"));
    }
  }, []);

  const enterSetupMode = useCallback(async (existing?: JobSetup | null) => {
    setMode("setup");

    // The job side picks its own resume — load the choices, defaulting to the
    // one already saved for jobs (not whatever the interview flow last used).
    try {
      const available = await getJobResumes();
      setResumes(available);
      setResumeId(existing?.resume_document_id ?? available[0]?.id ?? null);
    } catch {
      // Non-fatal: the backend still falls back to the latest resume.
    }

    if (existing?.target_designations?.length) {
      setChips(existing.target_designations);
      return;
    }
    setSuggesting(true);
    try {
      const suggestion = await suggestDesignations();
      setChips(suggestion.designations);
    } catch (err) {
      setError(errMessage(err, "Could not suggest designations — add them manually"));
    } finally {
      setSuggesting(false);
    }
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        const existing = await getJobSetup();
        setSetup(existing);
        setMode("table");
        await loadMatches();
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          await enterSetupMode();
        } else {
          setError(errMessage(err, "Failed to load job search"));
          setMode("setup");
        }
      }
    };
    void boot();
  }, [enterSetupMode, loadMatches]);

  const addChip = () => {
    const value = chipInput.trim();
    if (value && !chips.some((c) => c.toLowerCase() === value.toLowerCase())) {
      setChips((prev) => [...prev, value]);
    }
    setChipInput("");
  };

  const onSaveSetup = async () => {
    if (!chips.length) {
      setError("Add at least one target designation");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await saveJobSetup({
        target_designations: chips,
        resume_document_id: resumeId,
      });
      setSetup(saved);
      setMode("table");
      await loadMatches();
      setNotice("Setup saved — run a search to find matching jobs");
    } catch (err) {
      setError(errMessage(err, "Failed to save setup"));
    } finally {
      setSaving(false);
    }
  };

  const onSearch = async () => {
    setSearching(true);
    setError(null);
    setNotice(null);
    try {
      const run = await runJobSearch();
      setNotice(
        run.companies_checked === 0
          ? run.message
          : `Checked ${run.companies_checked} companies · ${run.listings_fetched} listings · ${run.new_matches} new matches`
      );
      await loadMatches();
    } catch (err) {
      setError(errMessage(err, "Search failed"));
    } finally {
      setSearching(false);
    }
  };

  const onStatusChange = async (match: JobMatch, status: MatchStatus) => {
    try {
      const updated = await updateJobMatchStatus(match.id, status);
      setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err) {
      setError(errMessage(err, "Failed to update status"));
    }
  };

  const visible = useMemo(
    () => (filter === "all" ? matches : matches.filter((m) => m.status === filter)),
    [matches, filter]
  );

  // Which flow step the user is on: setup → search → review.
  const activeStep = mode === "setup" ? 0 : matches.length === 0 ? 1 : 2;

  if (mode === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent-text" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Flow header — mirrors the interview side's step pages */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-3"
      >
        <div className="flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-3 py-1.5">
          <Sparkles size={14} className="text-accent-text" />
          <span className="text-xs font-semibold uppercase tracking-wide text-accent-text">
            Job Agent
          </span>
        </div>
        <h1 className="text-h1 font-semibold text-ink">
          Find Your{" "}
          <span className="text-accent-text">Next Role</span>
        </h1>
        <p className="max-w-xl text-base text-ink-subtle">
          Your resume, matched against live openings on company career pages — ranked, explained,
          and ready to apply.
        </p>
      </motion.div>

      {/* Step rail */}
      <StaggerGroup className="grid gap-3 sm:grid-cols-3">
        {FLOW_STEPS.map((step, i) => {
          const state = i === activeStep ? "active" : i < activeStep ? "done" : "todo";
          return (
            <StaggerItem key={step.title}>
              <div
                className={`flex h-full items-center gap-3 rounded-2xl border p-4 transition ${
                  state === "active"
                    ? "border-accent/40 bg-accent-soft"
                    : "border-border bg-canvas"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-semibold ${
                    state === "todo"
                      ? "bg-surface-strong text-ink-subtle"
                      : "bg-accent text-white"
                  }`}
                >
                  {state === "done" ? <Check size={18} /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">
                    {step.title}
                  </span>
                  <span className="block truncate text-xs text-ink-subtle">
                    {step.desc}
                  </span>
                </span>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-subtle">
          {mode === "setup"
            ? "Step 1 — confirm the roles you want to target."
            : `${matches.length} match${matches.length === 1 ? "" : "es"} found so far.`}
        </p>
        {mode === "table" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void enterSetupMode(setup)}
              className="flex items-center gap-2 rounded-md border border-border-strong px-3 py-2 text-sm text-ink-muted hover:bg-surface"
            >
              <Settings2 size={16} /> Re-setup
            </button>
            <button
              type="button"
              onClick={() => void onSearch()}
              disabled={searching}
              className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent disabled:opacity-60"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {searching ? "Searching…" : "Search Now"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-md bg-success-soft p-3 text-sm text-success">
          {notice}
        </p>
      )}

      {mode === "setup" && (
        <Reveal>
        <section className="space-y-6 rounded-lg border border-border-strong p-5 shadow-sm">
          {/* Step 1a — the job side's OWN resume, separate from the interview's */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-medium text-ink">
                Resume for job search
              </h2>
              <p className="text-sm text-ink-subtle">
                Choose which resume the agent matches jobs against. This is separate from the
                resume your mock interviews use — you can point each side at a different one.
              </p>
            </div>

            {resumes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border-strong p-4 text-sm">
                <p className="text-ink-muted">
                  No resume indexed yet. Upload one in the interview flow and it becomes available
                  here too.
                </p>
                <a
                  href="/interview/select-role"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-accent-text hover:underline"
                >
                  Upload a resume →
                </a>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {resumes.map((r) => {
                  const selected = r.id === resumeId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setResumeId(r.id)}
                      aria-pressed={selected}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-accent/40 bg-accent-soft"
                          : "border-border hover:border-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate font-medium text-ink">
                          {r.file_name}
                        </span>
                        {selected && <Check size={16} className="shrink-0 text-accent-text" />}
                      </div>
                      <p className="mt-1 truncate text-xs text-ink-subtle">
                        {[r.role, r.experience].filter(Boolean).join(" · ") || "Indexed resume"}
                      </p>
                      {r.skills.length > 0 && (
                        <p className="mt-2 truncate text-xs text-ink-subtle">
                          {r.skills.slice(0, 4).join(", ")}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          <div>
            <h2 className="text-lg font-medium text-ink">
              Target designations
            </h2>
            <p className="text-sm text-ink-subtle">
              Suggested from your resume — remove any, or add a different role you want to target
              (e.g. switch from Python to Frontend). One resume can target many roles.
            </p>
          </div>

          {suggesting ? (
            <p className="flex items-center gap-2 text-sm text-ink-subtle">
              <Loader2 size={16} className="animate-spin" /> Analyzing your resume…
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm text-accent-text"
                >
                  {chip}
                  <button
                    type="button"
                    aria-label={`Remove ${chip}`}
                    onClick={() => setChips((prev) => prev.filter((c) => c !== chip))}
                    className="rounded-full p-0.5 hover:bg-accent-soft"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {!chips.length && (
                <span className="text-sm text-ink-subtle">No designations yet — add one below</span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={chipInput}
              onChange={(e) => setChipInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChip();
                }
              }}
              placeholder="Add a designation (e.g. Frontend Developer)"
              className="w-full max-w-md rounded-md border border-border-strong p-2 text-sm"
            />
            <button
              type="button"
              onClick={addChip}
              className="flex items-center gap-1 rounded-md border border-border-strong px-3 py-2 text-sm text-ink-muted hover:bg-surface"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <button
            type="button"
            onClick={() => void onSaveSetup()}
            disabled={saving || suggesting}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save & Continue"}
          </button>
        </section>
        </Reveal>
      )}

      {mode === "table" && (
        <>
          {setup && (
            <p className="text-sm text-ink-subtle">
              Targeting:{" "}
              <span className="font-medium text-ink-muted">
                {setup.target_designations.join(" · ") || "—"}
              </span>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-3 py-1 text-sm ${
                  filter === f.value
                    ? "bg-accent text-white"
                    : "bg-surface-strong text-ink-muted hover:bg-surface-strong"
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void loadMatches()}
              aria-label="Refresh matches"
              className="ml-auto rounded-full p-2 text-ink-subtle hover:bg-surface-strong"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <Reveal className="overflow-x-auto rounded-lg border border-border-strong shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-ink-muted">
                <tr>
                  <th className="p-3 font-medium">Company</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Location</th>
                  <th className="p-3 font-medium">Match</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-ink-subtle">
                      {matches.length === 0
                        ? "No matches yet — click Search Now to scan career pages"
                        : "No matches with this status"}
                    </td>
                  </tr>
                )}
                {visible.map((m) => (
                  <tr key={m.id} className="align-top">
                    <td className="p-3 font-medium text-ink">{m.company}</td>
                    <td className="p-3">
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-text hover:underline"
                      >
                        {m.title}
                      </a>
                      {m.match_reasons?.fits?.length ? (
                        <p className="mt-1 text-xs text-ink-subtle">
                          {m.match_reasons.fits.join(" · ")}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-3 text-ink-muted">
                      {m.location || "—"}
                      {m.remote ? " (Remote)" : ""}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-ink">
                        {Math.round(m.match_score)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[m.status]}`}
                      >
                        {STATUS_LABELS[m.status]}
                      </span>
                      {m.status === "pending_apply" && m.pending_reason ? (
                        <p className="mt-1 text-xs text-warning">
                          {m.pending_reason}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={m.apply_url || m.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            if (m.status === "new") void onStatusChange(m, "reviewed");
                          }}
                          className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white hover:bg-accent"
                        >
                          Apply →
                        </a>
                        {m.status !== "applied" && (
                          <button
                            type="button"
                            onClick={() => void onStatusChange(m, "applied")}
                            className="rounded-md border border-success/30 px-2.5 py-1 text-xs text-success hover:bg-success-soft"
                          >
                            Mark Applied
                          </button>
                        )}
                        {m.status !== "dismissed" && (
                          <button
                            type="button"
                            onClick={() => void onStatusChange(m, "dismissed")}
                            className="rounded-md border border-border-strong px-2.5 py-1 text-xs text-ink-subtle hover:bg-surface"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </>
      )}
    </div>
  );
}
