import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/App";
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Briefcase,
  Zap,
  Target,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const EXPERIENCE_OPTIONS = [
  { id: "0-1", label: "0–1 yrs", sublabel: "Fresher / Intern" },
  { id: "1-3", label: "1–3 yrs", sublabel: "Junior" },
  { id: "3-5", label: "3–5 yrs", sublabel: "Mid-Level" },
  { id: "5-8", label: "5–8 yrs", sublabel: "Senior" },
  { id: "8+", label: "8+ yrs", sublabel: "Lead / Staff" },
];

const DIFFICULTY_OPTIONS = [
  {
    id: "easy",
    label: "Easy",
    description: "Fundamentals & basics",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
  },
  {
    id: "medium",
    label: "Medium",
    description: "Real interview level",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  {
    id: "hard",
    label: "Hard",
    description: "FAANG / Top-tier",
    gradient: "from-rose-500 to-red-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
  },
];

const SUGGESTED_SKILLS = [
  "React", "TypeScript", "JavaScript", "Node.js", "CSS", "HTML",
  "Next.js", "Redux", "GraphQL", "REST APIs", "Git", "Testing",
  "Performance", "Accessibility", "Webpack", "Vite",
];

// ─────────────────────────────────────────
// Label
// ─────────────────────────────────────────
function SectionLabel({
  icon: Icon,
  label,
  isDark,
}: {
  icon: any;
  label: string;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-violet-400" />
      <span
        className={`text-sm font-semibold tracking-wide ${
          isDark ? "text-slate-300" : "text-gray-700"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────
export default function QuickSetupPage() {
  const { isDark } = useTheme();
  const [experience, setExperience] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 12)
      setSkills((prev) => [...prev, trimmed]);
  };

  const removeSkill = (skill: string) =>
    setSkills((prev) => prev.filter((s) => s !== skill));

  const handleCustomSkillKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(customSkill);
      setCustomSkill("");
    }
  };

  const canContinue = experience !== null && difficulty !== null && skills.length > 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-violet-500/8" : "bg-violet-500/5"
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-0 w-[350px] h-[350px] rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-cyan-500/6" : "bg-cyan-500/4"
          }`}
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          className={`flex items-center gap-2 text-sm mb-8 transition ${
            isDark
              ? "text-slate-400 hover:text-white"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <ArrowLeft size={16} />
          Back to Profile Setup
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30">
              <Sparkles size={14} className="text-violet-400" />
              <span className="text-xs font-semibold text-violet-400 tracking-wide uppercase">
                Step 3 of 4
              </span>
            </div>
          </div>
          <h1
            className={`text-4xl font-bold mb-3 tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Quick Setup
          </h1>
          <p
            className={`text-base ${
              isDark ? "text-slate-400" : "text-gray-500"
            }`}
          >
            Help us tailor the interview to your background and goals.
          </p>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-10"
        >
          {["Select Role", "Setup Profile", "Quick Setup", "Interview"].map(
            (step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                    i === 2
                      ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md"
                      : i < 2
                      ? isDark
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-emerald-100 text-emerald-600 border border-emerald-300"
                      : isDark
                      ? "bg-slate-800/60 text-slate-500 border border-white/10"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold`}
                  >
                    {i < 2 ? "✓" : i + 1}
                  </span>
                  {step}
                </div>
                {i < 3 && (
                  <ChevronRight
                    size={12}
                    className={isDark ? "text-slate-700" : "text-gray-300"}
                  />
                )}
              </div>
            )
          )}
        </motion.div>

        {/* ── Experience ──────────────────── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl p-6 mb-5 border ${
            isDark
              ? "bg-slate-900/60 border-white/10"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <SectionLabel
            icon={Briefcase}
            label="Years of Experience"
            isDark={isDark}
          />
          <div className="grid grid-cols-5 gap-3">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <motion.button
                key={opt.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setExperience(opt.id)}
                className={`
                  relative py-3 px-2 rounded-xl border-2 text-center transition-all duration-200
                  ${
                    experience === opt.id
                      ? "border-transparent ring-2 ring-violet-500/60 bg-gradient-to-br from-violet-600/20 to-cyan-600/10 shadow-lg"
                      : isDark
                      ? "border-white/10 hover:border-white/20 bg-slate-800/40"
                      : "border-gray-200 hover:border-violet-300 bg-gray-50"
                  }
                `}
              >
                {experience === opt.id && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle2 size={12} className="text-violet-400" />
                  </div>
                )}
                <div
                  className={`text-sm font-bold mb-0.5 ${
                    experience === opt.id
                      ? isDark
                        ? "text-white"
                        : "text-violet-700"
                      : isDark
                      ? "text-slate-300"
                      : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </div>
                <div
                  className={`text-[10px] ${
                    isDark ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  {opt.sublabel}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Difficulty ──────────────────── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 mb-5 border ${
            isDark
              ? "bg-slate-900/60 border-white/10"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <SectionLabel
            icon={Target}
            label="Difficulty Level"
            isDark={isDark}
          />
          <div className="grid grid-cols-3 gap-4">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <motion.button
                key={opt.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDifficulty(opt.id)}
                className={`
                  relative py-5 rounded-2xl border-2 text-center transition-all duration-200
                  ${
                    difficulty === opt.id
                      ? `${opt.bg} ${opt.border} shadow-lg ring-2 ring-offset-0`
                      : isDark
                      ? "border-white/10 hover:border-white/20 bg-slate-800/40"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }
                `}
                style={
                  difficulty === opt.id
                    ? {
                        boxShadow: `0 0 20px var(--tw-shadow-color)`,
                      }
                    : {}
                }
              >
                {difficulty === opt.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 size={14} className={opt.text} />
                  </div>
                )}
                <div
                  className={`text-base font-bold mb-1 ${
                    difficulty === opt.id
                      ? opt.text
                      : isDark
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  {opt.label}
                </div>
                <div
                  className={`text-xs ${
                    isDark ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  {opt.description}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Skills ──────────────────────── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className={`rounded-2xl p-6 mb-8 border ${
            isDark
              ? "bg-slate-900/60 border-white/10"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <SectionLabel icon={Zap} label="Your Key Skills" isDark={isDark} />
            <span
              className={`text-xs ${
                isDark ? "text-slate-500" : "text-gray-400"
              }`}
            >
              {skills.length}/12
            </span>
          </div>

          {/* Selected skills */}
          <AnimatePresence>
            {skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {skills.map((skill) => (
                  <motion.span
                    key={skill}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-violet-500/30 text-xs font-medium text-violet-300"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-violet-400 hover:text-white transition"
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom skill input */}
          <div className="relative mb-5">
            <Plus
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isDark ? "text-slate-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={handleCustomSkillKeyDown}
              placeholder="Add a skill (press Enter or comma)"
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition border ${
                isDark
                  ? "bg-slate-800/60 border-white/10 text-white placeholder-slate-500 focus:border-violet-500/50"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400"
              }`}
            />
          </div>

          {/* Suggested skills */}
          <div>
            <p
              className={`text-xs mb-3 ${
                isDark ? "text-slate-500" : "text-gray-400"
              }`}
            >
              Suggested skills — click to add:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map(
                (skill) => (
                  <motion.button
                    key={skill}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addSkill(skill)}
                    disabled={skills.length >= 12}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      isDark
                        ? "border-white/10 text-slate-400 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/10 disabled:opacity-30"
                        : "border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 disabled:opacity-30"
                    }`}
                  >
                    + {skill}
                  </motion.button>
                )
              )}
            </div>
          </div>
        </motion.div>

        {/* Summary preview */}
        <AnimatePresence>
          {canContinue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`rounded-2xl p-5 mb-8 border ${
                isDark
                  ? "bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border-violet-500/20"
                  : "bg-gradient-to-br from-violet-50 to-cyan-50 border-violet-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={16} className="text-violet-400" />
                <span
                  className={`text-sm font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Interview Preview
                </span>
              </div>
              <div
                className={`text-sm space-y-1 ${
                  isDark ? "text-slate-300" : "text-gray-600"
                }`}
              >
                <p>
                  · <strong>Experience:</strong>{" "}
                  {
                    EXPERIENCE_OPTIONS.find((e) => e.id === experience)
                      ?.sublabel
                  }{" "}
                  (
                  {
                    EXPERIENCE_OPTIONS.find((e) => e.id === experience)?.label
                  }
                  )
                </p>
                <p>
                  · <strong>Difficulty:</strong>{" "}
                  {
                    DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)?.label
                  }{" "}
                  —{" "}
                  {
                    DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)
                      ?.description
                  }
                </p>
                <p>
                  · <strong>Skills:</strong> {skills.join(", ")}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <button
            className={`text-sm transition ${
              isDark
                ? "text-slate-500 hover:text-slate-300"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            ← Back
          </button>

          <motion.button
            whileHover={canContinue ? { scale: 1.04 } : {}}
            whileTap={canContinue ? { scale: 0.97 } : {}}
            disabled={!canContinue}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition ${
              canContinue
                ? "bg-gradient-to-r from-violet-600 to-cyan-600 hover:shadow-xl cursor-pointer"
                : "opacity-40 cursor-not-allowed bg-gradient-to-r from-violet-600 to-cyan-600"
            }`}
          >
            Start Interview
            <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}