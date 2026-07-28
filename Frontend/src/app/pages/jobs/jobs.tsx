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
  new: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  reviewed: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  pending_apply: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  applied: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  dismissed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
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
        <Loader2 className="animate-spin text-violet-600" size={28} />
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
        <div className="flex w-fit items-center gap-2 rounded-full border border-violet-500/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 px-3 py-1.5">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Job Agent
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-slate-900 md:text-5xl dark:text-white">
          Find Your{" "}
          <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">Next Role</span>
        </h1>
        <p className="max-w-xl text-base text-slate-500 dark:text-slate-400">
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
                    ? "border-violet-400/60 bg-gradient-to-br from-violet-600/15 to-cyan-500/15 dark:border-violet-500/50"
                    : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display font-bold ${
                    state === "todo"
                      ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      : "bg-gradient-to-br from-violet-600 to-cyan-500 text-white"
                  }`}
                >
                  {state === "done" ? <Check size={18} /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {step.desc}
                  </span>
                </span>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {mode === "setup"
            ? "Step 1 — confirm the roles you want to target."
            : `${matches.length} match${matches.length === 1 ? "" : "es"} found so far.`}
        </p>
        {mode === "table" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void enterSetupMode(setup)}
              className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Settings2 size={16} /> Re-setup
            </button>
            <button
              type="button"
              onClick={() => void onSearch()}
              disabled={searching}
              className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {searching ? "Searching…" : "Search Now"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {notice}
        </p>
      )}

      {mode === "setup" && (
        <Reveal>
        <section className="space-y-6 rounded-lg border border-slate-300 p-5 shadow-sm dark:border-slate-700">
          {/* Step 1a — the job side's OWN resume, separate from the interview's */}
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                Resume for job search
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose which resume the agent matches jobs against. This is separate from the
                resume your mock interviews use — you can point each side at a different one.
              </p>
            </div>

            {resumes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-300">
                  No resume indexed yet. Upload one in the interview flow and it becomes available
                  here too.
                </p>
                <a
                  href="/interview/select-role"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-violet-600 hover:underline dark:text-violet-400"
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
                          ? "border-violet-400/70 bg-violet-50 dark:border-violet-500/50 dark:bg-violet-900/20"
                          : "border-slate-200 hover:border-violet-300 dark:border-slate-700 dark:hover:border-violet-500/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate font-medium text-slate-900 dark:text-white">
                          {r.file_name}
                        </span>
                        {selected && <Check size={16} className="shrink-0 text-violet-500" />}
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        {[r.role, r.experience].filter(Boolean).join(" · ") || "Indexed resume"}
                      </p>
                      {r.skills.length > 0 && (
                        <p className="mt-2 truncate text-xs text-slate-400 dark:text-slate-500">
                          {r.skills.slice(0, 4).join(", ")}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-700" />

          <div>
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
              Target designations
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Suggested from your resume — remove any, or add a different role you want to target
              (e.g. switch from Python to Frontend). One resume can target many roles.
            </p>
          </div>

          {suggesting ? (
            <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 size={16} className="animate-spin" /> Analyzing your resume…
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                >
                  {chip}
                  <button
                    type="button"
                    aria-label={`Remove ${chip}`}
                    onClick={() => setChips((prev) => prev.filter((c) => c !== chip))}
                    className="rounded-full p-0.5 hover:bg-violet-200 dark:hover:bg-violet-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {!chips.length && (
                <span className="text-sm text-slate-400">No designations yet — add one below</span>
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
              className="w-full max-w-md rounded-md border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={addChip}
              className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <button
            type="button"
            onClick={() => void onSaveSetup()}
            disabled={saving || suggesting}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save & Continue"}
          </button>
        </section>
        </Reveal>
      )}

      {mode === "table" && (
        <>
          {setup && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Targeting:{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">
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
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void loadMatches()}
              aria-label="Refresh matches"
              className="ml-auto rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <Reveal className="overflow-x-auto rounded-lg border border-slate-300 shadow-sm dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <tr>
                  <th className="p-3 font-medium">Company</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Location</th>
                  <th className="p-3 font-medium">Match</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      {matches.length === 0
                        ? "No matches yet — click Search Now to scan career pages"
                        : "No matches with this status"}
                    </td>
                  </tr>
                )}
                {visible.map((m) => (
                  <tr key={m.id} className="align-top">
                    <td className="p-3 font-medium text-slate-900 dark:text-white">{m.company}</td>
                    <td className="p-3">
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-700 hover:underline dark:text-violet-300"
                      >
                        {m.title}
                      </a>
                      {m.match_reasons?.fits?.length ? (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {m.match_reasons.fits.join(" · ")}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {m.location || "—"}
                      {m.remote ? " (Remote)" : ""}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 dark:text-white">
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
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
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
                          className="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-violet-700"
                        >
                          Apply →
                        </a>
                        {m.status !== "applied" && (
                          <button
                            type="button"
                            onClick={() => void onStatusChange(m, "applied")}
                            className="rounded-md border border-emerald-300 px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                          >
                            Mark Applied
                          </button>
                        )}
                        {m.status !== "dismissed" && (
                          <button
                            type="button"
                            onClick={() => void onStatusChange(m, "dismissed")}
                            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
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
