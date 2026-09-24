/**
 * Job Search Agent — setup + match status table.
 *
 * Flow: on load, try GET /jobs/setup. 404 → one-time setup (Gemini-suggested
 * designations as editable chips; user can add a totally different role).
 * Otherwise show the saved setup with [Re-setup] and the match table.
 *
 * UI: the phosphor-terminal design (2026-09-24) — restyle only. Content, data
 * and behaviour are unchanged: everything above `if (mode === "loading")` is
 * byte-identical to docs/backup/jobs-before-phosphor.tsx.txt except the import
 * list, the STATUS_BADGE tones and the style constants. Matches stay
 * requisition cards, now on the shared card hover.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  FileText,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
  Target,
  X,
} from "lucide-react";
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
import { PH_CARD_HOVER, PH_MONO, PH_MONO_RAW } from "@/components/phos/tokens";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";

type Mode = "loading" | "setup" | "table";

const STATUS_LABELS: Record<MatchStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  pending_apply: "Pending",
  applied: "Applied",
  dismissed: "Dismissed",
};

/*
 * Two colours only, so status is carried by fill and weight: applied is filled
 * phosphor, pending a cream outline, new/reviewed a hairline chip, dismissed
 * the dimmest of all.
 */
const STATUS_BADGE: Record<MatchStatus, string> = {
  new: "border-ph-green/45 bg-ph-green/10 text-ph-green",
  reviewed: "border-ph-line-bright bg-ph-surface text-ph-ink-muted",
  pending_apply: "border-ph-ink/30 bg-ph-ink/[0.06] text-ph-ink",
  applied: "border-ph-green/60 bg-ph-green/[0.14] text-ph-green",
  dismissed: "border-ph-line bg-black text-ph-ink-soft",
};

// ---------- Phosphor styling ----------
const CARD = "rounded-[16px] border border-ph-line-strong bg-ph-surface p-5 sm:p-6";
const CARD_FLAT = "rounded-[16px] border border-ph-line bg-ph-surface";
const CTA =
  "bg-ph-ink font-semibold text-black transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,255,65,0.35)] active:translate-y-0";
const LABEL_MD = "text-[13px] leading-4 tracking-[0.02em] font-medium";
const BODY_SM = "text-[12px] leading-[18px] tracking-[0.01em]";
const BODY_LG = "text-[15px] leading-6 tracking-[-0.01em]";
const H_SM = "font-st-display text-[17px] leading-6 tracking-[-0.01em] font-medium";
const H_MD = "font-st-display text-[22px] leading-7 tracking-[-0.02em] font-semibold";

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
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-ph-bg">
        <Loader2 className="animate-spin text-ph-green" size={28} />
      </div>
    );
  }

  const stepRail = (
    <div className={`flex flex-col gap-4 ${CARD}`}>
      <div className="flex items-center justify-between">
        <span className={`${H_SM} text-ph-ink`}>Flow</span>
        <span className={`${PH_MONO_RAW} tnum text-ph-ink-soft`}>
          {Math.min(activeStep + 1, FLOW_STEPS.length)} / {FLOW_STEPS.length}
        </span>
      </div>
      <StaggerGroup className="flex flex-col gap-2">
        {FLOW_STEPS.map((step, i) => {
          const state = i === activeStep ? "active" : i < activeStep ? "done" : "todo";
          return (
            <StaggerItem key={step.title}>
              <div
                className={`flex items-center gap-2.5 rounded-[12px] border p-2.5 transition-all ${
                  state === "active"
                    ? "border-ph-green/40 bg-ph-green/[0.06]"
                    : "border-ph-line bg-black"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-ph-mono text-[12px] ${
                    state === "todo"
                      ? "border-ph-line bg-black text-ph-ink-soft"
                      : "border-ph-green/45 bg-ph-green/10 text-ph-green"
                  }`}
                >
                  {state === "done" ? <Check size={15} /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={`${LABEL_MD} block truncate font-medium ${state === "active" ? "text-ph-green" : "text-ph-ink"}`}>
                    {step.title}
                  </span>
                  <span className={`${PH_MONO_RAW} block truncate text-ph-ink-soft`}>{step.desc}</span>
                </span>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );

  return (
    <div className="ph-grid relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-ph-bg font-st-body text-[14px] leading-5 text-ph-ink antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-10 h-96 w-96 rounded-full bg-ph-green/[0.06] blur-[130px]"
      />

      <div className="relative mx-auto flex w-full max-w-[90rem] flex-col gap-5 px-4 py-6 sm:px-8">
        {/* Header & status capsule */}
        <motion.section
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex w-full flex-col justify-between gap-4 xl:flex-row xl:items-end"
        >
          <div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-ph-green/40 bg-ph-green/[0.06] px-3 py-1">
              <Sparkles size={12} className="text-ph-green" />
              <span className={`${PH_MONO} text-ph-green`}>Job Agent</span>
            </span>
            <h1 className="font-st-display text-[28px] font-semibold leading-9 tracking-[-0.025em] text-ph-ink md:text-[34px] md:leading-[42px]">
              Find Your <span className="ph-glow text-ph-green">Next Role</span>
            </h1>
            <p className={`${BODY_LG} max-w-2xl text-ph-ink-muted`}>
              Your resume, matched against live openings on company career pages — ranked, explained,
              and ready to apply.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-[16px] border border-ph-line bg-ph-surface p-2 xl:shrink-0 xl:flex-nowrap xl:rounded-full">
            <div className="flex items-center gap-2 rounded-full border border-ph-line bg-black px-4 py-1.5">
              <BadgeCheck size={16} className="shrink-0 text-ph-green" />
              <span className={`${LABEL_MD} text-ph-ink`}>
                {mode === "setup"
                  ? "Step 1 — confirm the roles you want to target."
                  : `${matches.length} match${matches.length === 1 ? "" : "es"} found so far.`}
              </span>
            </div>
            {mode === "table" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void enterSetupMode(setup)}
                  className={`${LABEL_MD} flex items-center gap-1.5 rounded-full border border-ph-line-strong px-4 py-1.5 text-ph-ink transition-colors hover:border-ph-green hover:text-ph-green`}
                >
                  <Settings2 size={16} /> Re-setup
                </button>
                <button
                  type="button"
                  onClick={() => void onSearch()}
                  disabled={searching}
                  className={`${LABEL_MD} ${CTA} flex items-center gap-1.5 rounded-full px-4 py-1.5 disabled:opacity-60`}
                >
                  {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  {searching ? "Searching…" : "Search Now"}
                </button>
              </div>
            )}
          </div>
        </motion.section>

        {error && (
          <p className={`${BODY_SM} rounded-[12px] border border-ph-ink/30 bg-ph-ink/[0.06] px-4 py-3 text-ph-ink`}>
            {error}
          </p>
        )}
        {notice && (
          <p className={`${BODY_SM} rounded-[12px] border border-ph-green/40 bg-ph-green/[0.06] px-4 py-3 text-ph-green`}>
            {notice}
          </p>
        )}

        {mode === "table" && (
          /* Query bar: current targets + status filters */
          <section className={`flex w-full flex-col items-stretch gap-4 p-4 lg:flex-row lg:items-center ${CARD_FLAT}`}>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-ph-line bg-black px-4 py-2">
              <Filter size={16} className="shrink-0 text-ph-ink-soft" />
              <span className={`${PH_MONO_RAW} truncate text-ph-ink-soft`}>
                Targeting:{" "}
                <span className="text-ph-green">{setup?.target_designations.join(" · ") || "—"}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {FILTERS.map((f) => {
                const active = filter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    aria-pressed={active}
                    className={`${PH_MONO} flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 transition-colors ${
                      active
                        ? "border-ph-green/50 bg-ph-green/10 text-ph-green"
                        : "border-ph-line text-ph-ink-soft hover:border-ph-line-bright hover:text-ph-ink"
                    }`}
                  >
                    {active && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ph-green" />}
                    {f.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => void loadMatches()}
                aria-label="Refresh matches"
                className="ml-1 rounded-full border border-ph-line p-2 text-ph-ink-soft transition-colors hover:border-ph-green hover:text-ph-green"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </section>
        )}

        {/* Master-detail surface */}
        <section className="grid w-full grid-cols-1 items-start gap-5 xl:grid-cols-12">
          <aside className="flex flex-col gap-4 xl:col-span-3">
            {stepRail}

            {mode === "table" && setup && (
              <div className={`flex flex-col gap-4 ${CARD}`}>
                <div className="flex items-center justify-between">
                  <span className={`${H_SM} text-ph-ink`}>Target designations</span>
                  <Target size={16} className="text-ph-green" />
                </div>
                <div className="flex flex-col gap-2">
                  {setup.target_designations.length === 0 && <span className={`${BODY_SM} text-ph-ink-soft`}>—</span>}
                  {setup.target_designations.map((d) => (
                    <div key={d} className="flex items-center gap-2.5 rounded-[10px] border border-ph-line bg-black px-3 py-2">
                      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rotate-45 bg-ph-green" />
                      <span className={`${PH_MONO_RAW} truncate text-ph-ink`}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="flex flex-col gap-5 xl:col-span-9">
            {mode === "setup" && (
              <Reveal className="flex flex-col gap-4">
                {/* Step 1a — the job side's OWN resume, separate from the interview's */}
                <div className={`flex flex-col gap-4 ${CARD}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-ph-green/30 bg-ph-green/[0.06]">
                      <FileText size={18} className="text-ph-green" />
                    </div>
                    <div>
                      <h2 className={`${H_MD} text-ph-ink`}>Resume for job search</h2>
                      <p className={`${BODY_SM} mt-1 text-ph-ink-muted`}>
                        Choose which resume the agent matches jobs against. This is separate from the
                        resume your mock interviews use — you can point each side at a different one.
                      </p>
                    </div>
                  </div>

                  {resumes.length === 0 ? (
                    <div className="rounded-[12px] border border-dashed border-ph-line-strong bg-black p-4">
                      <p className={`${BODY_SM} text-ph-ink-muted`}>
                        No resume indexed yet. Upload one in the interview flow and it becomes available
                        here too.
                      </p>
                      <a
                        href="/interview/select-role"
                        className={`${PH_MONO} mt-3 inline-flex items-center gap-1.5 text-ph-green hover:underline`}
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
                            className={`rounded-[12px] border p-4 text-left ${PH_CARD_HOVER} ${
                              selected
                                ? "border-ph-green/60 bg-ph-green/[0.07]"
                                : "border-ph-line bg-black"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className={`${LABEL_MD} truncate font-medium text-ph-ink`}>{r.file_name}</span>
                              {selected && <Check size={16} className="shrink-0 text-ph-green" />}
                            </div>
                            <p className={`${BODY_SM} mt-1 truncate text-ph-ink-muted`}>
                              {[r.role, r.experience].filter(Boolean).join(" · ") || "Indexed resume"}
                            </p>
                            {r.skills.length > 0 && (
                              <p className={`${PH_MONO_RAW} mt-2 truncate text-ph-ink-soft`}>{r.skills.slice(0, 4).join(", ")}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={`flex flex-col gap-4 ${CARD}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-ph-green/30 bg-ph-green/[0.06]">
                      <Target size={18} className="text-ph-green" />
                    </div>
                    <div>
                      <h2 className={`${H_MD} text-ph-ink`}>Target designations</h2>
                      <p className={`${BODY_SM} mt-1 text-ph-ink-muted`}>
                        Suggested from your resume — remove any, or add a different role you want to target
                        (e.g. switch from Python to Frontend). One resume can target many roles.
                      </p>
                    </div>
                  </div>

                  {suggesting ? (
                    <p className={`${BODY_SM} flex items-center gap-2 text-ph-ink-muted`}>
                      <Loader2 size={16} className="animate-spin text-ph-green" /> Analyzing your resume…
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {chips.map((chip) => (
                        <span
                          key={chip}
                          className={`${PH_MONO_RAW} flex items-center gap-1 rounded-full border border-ph-line-strong bg-black py-1.5 pl-3 pr-1.5 text-ph-ink`}
                        >
                          {chip}
                          <button
                            type="button"
                            aria-label={`Remove ${chip}`}
                            onClick={() => setChips((prev) => prev.filter((c) => c !== chip))}
                            className="rounded-full p-0.5 text-ph-ink-soft transition-colors hover:bg-ph-surface-2 hover:text-ph-ink"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                      {!chips.length && (
                        <span className={`${BODY_SM} text-ph-ink-soft`}>No designations yet — add one below</span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <div className="flex min-w-0 max-w-md flex-1 items-center gap-2 rounded-full border border-ph-line-strong bg-black px-4 py-2 transition-colors focus-within:border-ph-green">
                      <Plus size={15} className="shrink-0 text-ph-ink-soft" />
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
                        className="w-full border-0 bg-transparent text-[13px] text-ph-ink outline-none placeholder:text-ph-ink-soft/70"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addChip}
                      className={`${LABEL_MD} flex items-center gap-1 rounded-full border border-ph-line-strong px-4 py-2 text-ph-ink transition-colors hover:border-ph-green hover:text-ph-green`}
                    >
                      <Plus size={15} /> Add
                    </button>
                  </div>

                  <div className="flex justify-end border-t border-ph-line pt-4">
                    <button
                      type="button"
                      onClick={() => void onSaveSetup()}
                      disabled={saving || suggesting}
                      className={`${LABEL_MD} ${CTA} rounded-full px-6 py-2 disabled:opacity-60`}
                    >
                      {saving ? "Saving…" : "Save & Continue"}
                    </button>
                  </div>
                </div>
              </Reveal>
            )}

            {mode === "table" && (
              <div className="flex flex-col gap-4">
                {visible.length === 0 && (
                  <div className={`${CARD} p-8 text-center text-ph-ink-muted`}>
                    {matches.length === 0
                      ? "No matches yet — click Search Now to scan career pages"
                      : "No matches with this status"}
                  </div>
                )}

                {visible.map((m, idx) => {
                  const top = idx === 0;
                  return (
                    <Reveal
                      key={m.id}
                      delay={Math.min(idx, 6) * 0.04}
                      className={`relative overflow-hidden rounded-[16px] border border-ph-line-strong bg-ph-surface ${PH_CARD_HOVER} ${
                        m.status === "dismissed" ? "opacity-55" : ""
                      }`}
                    >
                      {top && (
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-ph-green to-transparent" />
                      )}
                      <div className="flex flex-col gap-4 p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-ph-green/30 bg-ph-green/[0.06]">
                              <span className="font-st-display text-[17px] font-semibold text-ph-green">
                                {m.company.trim().charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-col gap-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className={`${H_MD} text-ph-ink`}>{m.company}</h2>
                                <span
                                  className={`${PH_MONO} inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${STATUS_BADGE[m.status]}`}
                                >
                                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                                  {STATUS_LABELS[m.status]}
                                </span>
                              </div>
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`${H_SM} text-ph-ink transition-colors hover:text-ph-green hover:underline`}
                              >
                                {m.title}
                              </a>
                              <span className={`${PH_MONO_RAW} text-ph-ink-soft`}>
                                {m.location || "—"}
                                {m.remote ? " (Remote)" : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 lg:flex-col lg:items-end lg:gap-1">
                            <div className="flex items-baseline gap-1 rounded-[12px] border border-ph-line bg-black px-4 py-1.5">
                              <span className="tnum font-st-display text-[36px] font-semibold leading-[44px] tracking-[-0.03em] text-ph-green">
                                {Math.round(m.match_score)}
                              </span>
                              <span className={`${H_SM} text-ph-green`}>%</span>
                            </div>
                            <span className={`${PH_MONO} text-ph-ink-soft`}>Match</span>
                          </div>
                        </div>

                        {m.match_reasons?.fits?.length ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {m.match_reasons.fits.map((fit) => (
                              <span
                                key={fit}
                                className={`${PH_MONO_RAW} rounded-full border border-ph-line bg-black px-2.5 py-1 text-ph-ink-muted`}
                              >
                                {fit}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="flex flex-col justify-between gap-3 border-t border-ph-line pt-4 sm:flex-row sm:items-center">
                          <div className={`${BODY_SM} flex min-w-0 items-center gap-2`}>
                            {m.status === "pending_apply" && m.pending_reason ? (
                              <>
                                <AlertTriangle size={15} className="shrink-0 text-ph-ink" />
                                <span className="text-ph-ink">{m.pending_reason}</span>
                              </>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {m.status !== "dismissed" && (
                              <button
                                type="button"
                                onClick={() => void onStatusChange(m, "dismissed")}
                                className={`${LABEL_MD} rounded-full border border-ph-line px-4 py-1.5 text-ph-ink-soft transition-colors hover:border-ph-line-bright hover:text-ph-ink`}
                              >
                                Dismiss
                              </button>
                            )}
                            {m.status !== "applied" && (
                              <button
                                type="button"
                                onClick={() => void onStatusChange(m, "applied")}
                                className={`${LABEL_MD} flex items-center gap-1.5 rounded-full border border-ph-green/45 px-4 py-1.5 text-ph-green transition-colors hover:bg-ph-green/10`}
                              >
                                <CircleCheck size={14} /> Mark Applied
                              </button>
                            )}
                            <a
                              href={m.apply_url || m.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => {
                                if (m.status === "new") void onStatusChange(m, "reviewed");
                              }}
                              className={`${LABEL_MD} ${CTA} flex items-center gap-1.5 rounded-full px-5 py-1.5`}
                            >
                              Apply <ArrowRight size={14} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
