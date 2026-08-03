import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useInterview } from "@/contexts/use-interview";
import {
  ArrowLeft, ChevronRight, Briefcase, Zap, Target,
  Plus, X, Check, AlertCircle, Loader,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Stepper } from "@/components/ui/stepper";
import { Panel, PanelTitle } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TextInput } from "@/components/ui/field";
import { INTERVIEW_STEPS } from "./steps";

const EXPERIENCE_OPTIONS = [
  { id: "0-1", label: "0–1 yrs", sublabel: "Fresher / intern" },
  { id: "1-3", label: "1–3 yrs", sublabel: "Junior" },
  { id: "3-5", label: "3–5 yrs", sublabel: "Mid-level" },
  { id: "5-8", label: "5–8 yrs", sublabel: "Senior" },
  { id: "8+",  label: "8+ yrs",  sublabel: "Lead / staff" },
];

const DIFFICULTY_OPTIONS = [
  { id: "easy", label: "Easy", description: "Fundamentals and basics" },
  { id: "medium", label: "Medium", description: "Real interview level" },
  { id: "hard", label: "Hard", description: "Top-tier, deep follow-ups" },
];

const SUGGESTED_SKILLS = [
  "React", "TypeScript", "JavaScript", "Node.js", "CSS", "HTML",
  "Next.js", "Redux", "GraphQL", "REST APIs", "Git", "Testing",
  "Performance", "Accessibility", "Webpack", "Vite",
];

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent-text">
        <Icon size={14} />
      </span>
      <PanelTitle>{label}</PanelTitle>
    </div>
  );
}

export default function QuickSetupPage() {
  const navigate = useNavigate();
  const { selectedRole, profileOption, submitInterviewSetup, isLoading, error, clearError } = useInterview();

  const [experience, setExperience] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  if (!selectedRole) {
    navigate("/interview/select-role", { replace: true });
    return null;
  }
  if (!profileOption) {
    navigate("/interview/select-profile", { replace: true });
    return null;
  }

  const addSkill = (skill: string) => {
    const t = skill.trim();
    if (t && !skills.includes(t) && skills.length < 12) {
      setSkills((prev) => [...prev, t]);
    }
  };

  const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(customSkill);
      setCustomSkill("");
    }
  };

  const canContinue = experience !== null && difficulty !== null && skills.length > 0;

  const handleContinue = async () => {
    if (!experience || !difficulty || skills.length === 0) return;
    try {
      clearError();

      await submitInterviewSetup({
        experience,
        difficulty,
        skills,
      });

      // Navigate to interview start page
      navigate("/interview/start");
    } catch (err) {
      console.error("Error submitting interview setup:", err);
      // Error is already set in context
    }
  };

  const optionCard = (selected: boolean) =>
    `relative rounded-lg border p-4 text-center transition-[border-color,box-shadow] duration-200 ${
      selected
        ? "border-accent bg-accent-soft/50 shadow-e1"
        : "border-border bg-canvas hover:border-border-strong"
    }`;

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 mb-6"
          onClick={() => navigate("/interview/select-profile")}
        >
          <ArrowLeft /> Back to resume
        </Button>

        <PageHeader
          eyebrow="Step 3 of 4"
          title="Tune the interview"
          description="Experience level, difficulty and the skills you want tested."
        />

        <div className="mt-6">
          <Stepper steps={INTERVIEW_STEPS} current={2} />
        </div>

        {/* ── Experience ── */}
        <Panel className="mt-8">
          <SectionLabel icon={Briefcase} label="Years of experience" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {EXPERIENCE_OPTIONS.map((opt) => {
              const sel = experience === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={sel}
                  onClick={() => setExperience(opt.id)}
                  className={optionCard(sel)}
                >
                  {sel && (
                    <Check size={13} strokeWidth={3} className="absolute right-2 top-2 text-accent-text" />
                  )}
                  <span className={`block text-body font-medium ${sel ? "text-accent-text" : "text-ink"}`}>
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-small text-ink-subtle">{opt.sublabel}</span>
                </button>
              );
            })}
          </div>
        </Panel>

        {/* ── Difficulty ── */}
        <Panel className="mt-4">
          <SectionLabel icon={Target} label="Difficulty" />
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {DIFFICULTY_OPTIONS.map((opt) => {
              const sel = difficulty === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={sel}
                  onClick={() => setDifficulty(opt.id)}
                  className={`${optionCard(sel)} py-5`}
                >
                  {sel && (
                    <Check size={13} strokeWidth={3} className="absolute right-2.5 top-2.5 text-accent-text" />
                  )}
                  <span className={`block text-h4 font-semibold ${sel ? "text-accent-text" : "text-ink"}`}>
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-small text-ink-subtle">{opt.description}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-small text-ink-subtle">
            Whatever you pick, every interview still opens with a couple of fundamentals before it
            ramps up.
          </p>
        </Panel>

        {/* ── Skills ── */}
        <Panel className="mt-4">
          <div className="flex items-center justify-between gap-4">
            <SectionLabel icon={Zap} label="Key skills" />
            <Badge tone="neutral" size="sm">{skills.length}/12</Badge>
          </div>

          <AnimatePresence>
            {skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-small text-accent-text"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      aria-label={`Remove ${skill}`}
                      className="transition-opacity hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative mt-4">
            <Plus
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
            />
            <TextInput
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a skill (press Enter or comma)"
              aria-label="Add a skill"
              className="pl-9"
            />
          </div>

          <p className="mt-5 text-small text-ink-subtle">Suggested — click to add</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                disabled={skills.length >= 12}
                className="rounded-full border border-border px-2.5 py-1 text-small text-ink-muted transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent-text disabled:opacity-40"
              >
                + {skill}
              </button>
            ))}
          </div>
        </Panel>

        {/* Summary preview */}
        <AnimatePresence>
          {canContinue && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Panel tone="muted" className="mt-4">
                <div className="flex items-center gap-2">
                  <Check size={15} strokeWidth={3} className="text-accent-text" />
                  <PanelTitle>Interview preview</PanelTitle>
                </div>
                <dl className="mt-3 space-y-1.5 text-small">
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-ink-subtle">Experience</dt>
                    <dd className="text-ink-muted">
                      {EXPERIENCE_OPTIONS.find((e) => e.id === experience)?.sublabel} (
                      {EXPERIENCE_OPTIONS.find((e) => e.id === experience)?.label})
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-ink-subtle">Difficulty</dt>
                    <dd className="text-ink-muted">
                      {DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)?.label} —{" "}
                      {DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)?.description}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-ink-subtle">Skills</dt>
                    <dd className="text-ink-muted">{skills.join(", ")}</dd>
                  </div>
                </dl>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-end">
          <Button size="lg" disabled={!canContinue || isLoading} onClick={handleContinue}>
            {isLoading ? (
              <>
                <Loader className="animate-spin" /> Submitting…
              </>
            ) : (
              <>
                Start the interview <ChevronRight />
              </>
            )}
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger" />
            <div className="flex-1">
              <p className="text-small font-medium text-danger">Something went wrong</p>
              <p className="mt-0.5 text-small text-ink-muted">{error}</p>
            </div>
            <button
              onClick={clearError}
              aria-label="Dismiss"
              className="text-ink-subtle transition-colors hover:text-ink"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
