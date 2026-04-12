import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/App";
import { useInterview } from "@/contexts/interview-context";
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
  AlertCircle,
  Loader,
} from "lucide-react";


interface SectionLabelProps {
  icon: React.ElementType;
  label: string;
  isDark: boolean;
}


const EXPERIENCE_OPTIONS = [
  { id: "0-1", label: "0–1 yrs", sublabel: "Fresher / Intern" },
  { id: "1-3", label: "1–3 yrs", sublabel: "Junior" },
  { id: "3-5", label: "3–5 yrs", sublabel: "Mid-Level" },
  { id: "5-8", label: "5–8 yrs", sublabel: "Senior" },
  { id: "8+",  label: "8+ yrs",  sublabel: "Lead / Staff" },
];

const DIFFICULTY_OPTIONS = [
  {
    id: "easy",
    label: "Easy",
    description: "Fundamentals & basics",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    lightText: "text-emerald-600",
    lightBg: "bg-emerald-50",
    lightBorder: "border-emerald-300",
  },
  {
    id: "medium",
    label: "Medium",
    description: "Real interview level",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    lightText: "text-amber-600",
    lightBg: "bg-amber-50",
    lightBorder: "border-amber-300",
  },
  {
    id: "hard",
    label: "Hard",
    description: "FAANG / Top-tier",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    lightText: "text-rose-600",
    lightBg: "bg-rose-50",
    lightBorder: "border-rose-300",
  },
];

const SUGGESTED_SKILLS = [
  "React", "TypeScript", "JavaScript", "Node.js", "CSS", "HTML",
  "Next.js", "Redux", "GraphQL", "REST APIs", "Git", "Testing",
  "Performance", "Accessibility", "Webpack", "Vite",
];

// ─── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({ icon: Icon, label, isDark }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-violet-500/20" : "bg-violet-50"}`}>
        <Icon size={14} className={isDark ? "text-violet-400" : "text-violet-600"} />
      </div>
      <span className={`text-xs font-semibold tracking-widest uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function QuickSetupPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { saveQuickSetup, isLoading, error, clearError } = useInterview();

  const [experience, setExperience] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [skills, setSkills]         = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  const addSkill = (skill: string) => {
    const t = skill.trim();
    if (t && !skills.includes(t) && skills.length < 12) {
      setSkills((prev) => [...prev, t]);
    }
  };

  const removeSkill = (s: string) =>
    setSkills((prev) => prev.filter((x) => x !== s));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(customSkill);
      setCustomSkill("");
    }
  };

  const canContinue = experience !== null && difficulty !== null && skills.length > 0;

  // Handle continue - save to local state only
  const handleContinue = async () => {
    if (!experience || !difficulty || skills.length === 0) return;
    try {
      clearError();
      // Save to local state only
      saveQuickSetup(experience, difficulty, skills);
      // Navigate to next step
      navigate("/interview/select-role");
    } catch (err) {
      console.error("Error saving quick setup:", err);
    }
  };

  // ── Theme tokens ──
  const pageBg   = isDark
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    : "bg-gradient-to-br from-gray-50 via-white to-gray-100";
  const cardCls  = isDark
    ? "bg-slate-900/60 border-white/[0.08]"
    : "bg-white border-slate-200 shadow-sm";
  const subText  = isDark ? "text-slate-400" : "text-slate-500";
  const textMain = isDark ? "text-white"     : "text-slate-900";
  const inputCls = isDark
    ? "bg-slate-800/60 border-white/[0.08] text-white placeholder-slate-500 focus:border-violet-500/40"
    : "bg-gray-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-violet-400";

  const STEPS = ["Select Role", "Setup Profile", "Quick Setup", "Interview"];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? "bg-violet-500/[0.08]" : "bg-violet-500/5"}`} />
        <div className={`absolute bottom-1/4 right-0 w-[350px] h-[350px] rounded-full blur-3xl ${isDark ? "bg-cyan-500/[0.06]" : "bg-cyan-500/4"}`} style={{ animationDelay: "2s" }} />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-10">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          className={`flex items-center gap-2 text-sm mb-8 transition ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
        >
          <ArrowLeft size={16} />
          Back to Profile Setup
        </motion.button>

        {/* Page header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30">
              <Sparkles size={13} className="text-violet-400" />
              <span className="text-xs font-semibold text-violet-400 tracking-wide uppercase">Step 3 of 4</span>
            </div>
          </div>
          <h1 className={`text-4xl font-bold mb-2 tracking-tight ${textMain}`}>Quick Setup</h1>
          <p className={`text-base ${subText}`}>Help us tailor the interview to your background and goals.</p>
        </motion.div>

        {/* Step pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-8 flex-wrap"
        >
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                i === 2
                  ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-transparent"
                  : i < 2
                  ? isDark
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-emerald-100 text-emerald-600 border-emerald-300"
                  : isDark
                  ? "bg-slate-800/60 text-slate-500 border-white/[0.08]"
                  : "bg-gray-100 text-gray-400 border-gray-200"
              }`}>
                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {i < 2 ? "✓" : i + 1}
                </span>
                {step}
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={12} className={isDark ? "text-slate-700" : "text-gray-300"} />
              )}
            </div>
          ))}
        </motion.div>

        {/* ── Experience ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl p-6 mb-5 border ${cardCls}`}
        >
          <SectionLabel icon={Briefcase} label="Years of Experience" isDark={isDark} />
          <div className="grid grid-cols-5 gap-3">
            {EXPERIENCE_OPTIONS.map((opt) => {
              const sel = experience === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setExperience(opt.id)}
                  className={`relative py-3 px-2 rounded-xl border-2 text-center transition-all duration-200 ${
                    sel
                      ? isDark
                        ? "border-violet-500/50 bg-violet-500/15 shadow-lg"
                        : "border-violet-400/60 bg-violet-50 shadow-sm"
                      : isDark
                      ? "border-white/[0.08] hover:border-white/20 bg-slate-800/40"
                      : "border-gray-200 hover:border-violet-300 bg-gray-50"
                  }`}
                >
                  {sel && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle2 size={11} className={isDark ? "text-violet-400" : "text-violet-600"} />
                    </div>
                  )}
                  <div className={`text-sm font-bold mb-0.5 ${sel ? isDark ? "text-violet-300" : "text-violet-700" : isDark ? "text-slate-200" : "text-gray-700"}`}>
                    {opt.label}
                  </div>
                  <div className={`text-[10px] ${subText}`}>{opt.sublabel}</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Difficulty ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-6 mb-5 border ${cardCls}`}
        >
          <SectionLabel icon={Target} label="Difficulty Level" isDark={isDark} />
          <div className="grid grid-cols-3 gap-4">
            {DIFFICULTY_OPTIONS.map((opt) => {
              const sel = difficulty === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDifficulty(opt.id)}
                  className={`relative py-6 rounded-2xl border-2 text-center transition-all duration-200 ${
                    sel
                      ? isDark
                        ? `${opt.bg} ${opt.border} shadow-lg`
                        : `${opt.lightBg} ${opt.lightBorder} shadow-sm`
                      : isDark
                      ? "border-white/[0.08] hover:border-white/20 bg-slate-800/40"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  }`}
                >
                  {sel && (
                    <div className="absolute top-2.5 right-2.5">
                      <CheckCircle2 size={14} className={isDark ? opt.text : opt.lightText} />
                    </div>
                  )}
                  <div className={`text-base font-bold mb-1 ${sel ? isDark ? opt.text : opt.lightText : isDark ? "text-white" : "text-gray-900"}`}>
                    {opt.label}
                  </div>
                  <div className={`text-xs ${subText}`}>{opt.description}</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Skills ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className={`rounded-2xl p-6 mb-8 border ${cardCls}`}
        >
          <div className="flex items-center justify-between mb-4">
            <SectionLabel icon={Zap} label="Your Key Skills" isDark={isDark} />
            <span className={`text-xs px-2.5 py-1 rounded-full border ${isDark ? "border-white/[0.08] text-slate-500 bg-slate-800/40" : "border-gray-200 text-gray-400 bg-gray-50"}`}>
              {skills.length}/12
            </span>
          </div>

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
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${
                      isDark
                        ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                        : "bg-violet-50 border-violet-200 text-violet-700"
                    }`}
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className={`transition ${isDark ? "text-violet-400 hover:text-white" : "text-violet-400 hover:text-violet-700"}`}
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative mb-5">
            <Plus size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${subText}`} />
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a skill (press Enter or comma)"
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition ${inputCls}`}
            />
          </div>

          <p className={`text-xs mb-3 ${subText}`}>Suggested — click to add:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
              <motion.button
                key={skill}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addSkill(skill)}
                disabled={skills.length >= 12}
                className={`text-xs px-3 py-1.5 rounded-full border transition disabled:opacity-30 ${
                  isDark
                    ? "border-white/[0.08] text-slate-400 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/10"
                    : "border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50"
                }`}
              >
                + {skill}
              </motion.button>
            ))}
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
                <CheckCircle2 size={15} className={isDark ? "text-violet-400" : "text-violet-600"} />
                <span className={`text-sm font-semibold ${textMain}`}>Interview Preview</span>
              </div>
              <div className={`text-sm space-y-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                <p>
                  · <strong>Experience:</strong>{" "}
                  {EXPERIENCE_OPTIONS.find((e) => e.id === experience)?.sublabel}{" "}
                  ({EXPERIENCE_OPTIONS.find((e) => e.id === experience)?.label})
                </p>
                <p>
                  · <strong>Difficulty:</strong>{" "}
                  {DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)?.label}{" "}
                  — {DIFFICULTY_OPTIONS.find((d) => d.id === difficulty)?.description}
                </p>
                <p>· <strong>Skills:</strong> {skills.join(", ")}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <button className={`text-sm transition ${isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"}`}>
            ← Back
          </button>
          <motion.button
            whileHover={canContinue && !isLoading ? { scale: 1.04 } : {}}
            whileTap={canContinue && !isLoading ? { scale: 0.97 } : {}}
            disabled={!canContinue || isLoading}
            onClick={handleContinue}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition bg-gradient-to-r from-violet-600 to-cyan-600 ${
              canContinue && !isLoading ? "hover:shadow-xl cursor-pointer" : "opacity-40 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Continue
                <ChevronRight size={16} />
              </>
            )}
          </motion.button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mt-4 flex items-start gap-3 p-4 rounded-lg ${
                isDark
                  ? "bg-red-500/10 border border-red-500/30"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <AlertCircle size={16} className={isDark ? "text-red-400 mt-0.5" : "text-red-600 mt-0.5"} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isDark ? "text-red-300" : "text-red-700"}`}>
                  Error
                </p>
                <p className={`text-sm ${isDark ? "text-red-200/70" : "text-red-600/70"}`}>
                  {error}
                </p>
              </div>
              <button
                onClick={clearError}
                className={`text-lg transition ${isDark ? "text-red-300 hover:text-red-200" : "text-red-400 hover:text-red-600"}`}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}