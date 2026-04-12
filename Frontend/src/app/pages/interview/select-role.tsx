import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/App";
import { useInterview } from "@/contexts/interview-context";
import {
  Code2,
  Server,
  Brain,
  Layers,
  Database,
  Smartphone,
  Shield,
  Cloud,
  ChevronRight,
  Search,
  Sparkles,
  ArrowLeft,
  Loader,
  AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────
// Role Data
// ─────────────────────────────────────────
const roles = [
  {
    id: "frontend",
    title: "Frontend Developer",
    description: "React, Vue, TypeScript, CSS, performance & UI architecture",
    icon: Code2,
    gradient: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-500/25",
    tags: ["React", "TypeScript", "CSS", "Next.js"],
    level: "Beginner → Senior",
    questions: 120,
  },
  {
    id: "backend",
    title: "Backend Developer",
    description: "Node.js, REST APIs, microservices, auth & scalability",
    icon: Server,
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/25",
    tags: ["Node.js", "APIs", "SQL", "Redis"],
    level: "Beginner → Senior",
    questions: 140,
  },
  {
    id: "ml",
    title: "ML / AI Engineer",
    description: "Machine learning, deep learning, NLP, model deployment",
    icon: Brain,
    gradient: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/25",
    tags: ["Python", "PyTorch", "LLMs", "MLOps"],
    level: "Intermediate → Senior",
    questions: 95,
  },
  {
    id: "fullstack",
    title: "Full Stack Developer",
    description: "End-to-end development across frontend and backend",
    icon: Layers,
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/25",
    tags: ["React", "Node.js", "PostgreSQL", "Docker"],
    level: "Beginner → Senior",
    questions: 160,
  },
  {
    id: "data",
    title: "Data Engineer",
    description: "Pipelines, warehouses, ETL, Spark, Kafka & analytics",
    icon: Database,
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/25",
    tags: ["Python", "Spark", "Kafka", "Airflow"],
    level: "Intermediate → Senior",
    questions: 88,
  },
  {
    id: "mobile",
    title: "Mobile Developer",
    description: "iOS & Android, React Native, Flutter, app store deployment",
    icon: Smartphone,
    gradient: "from-indigo-500 to-blue-600",
    glow: "shadow-indigo-500/25",
    tags: ["React Native", "Flutter", "Swift", "Kotlin"],
    level: "Beginner → Senior",
    questions: 75,
  },
  {
    id: "devops",
    title: "DevOps / SRE",
    description: "CI/CD, Kubernetes, cloud infra, monitoring & reliability",
    icon: Cloud,
    gradient: "from-sky-500 to-cyan-600",
    glow: "shadow-sky-500/25",
    tags: ["Docker", "K8s", "AWS", "Terraform"],
    level: "Intermediate → Senior",
    questions: 110,
  },
  {
    id: "security",
    title: "Security Engineer",
    description: "AppSec, pen testing, OWASP, threat modeling & compliance",
    icon: Shield,
    gradient: "from-red-500 to-rose-600",
    glow: "shadow-red-500/25",
    tags: ["OWASP", "PenTest", "Auth", "Compliance"],
    level: "Intermediate → Expert",
    questions: 68,
  },
];

// ─────────────────────────────────────────
// Role Card
// ─────────────────────────────────────────
function RoleCard({
  role,
  selected,
  onClick,
  isDark,
}: {
  role: (typeof roles)[0];
  selected: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  const Icon = role.icon;

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-5 cursor-pointer border-2 transition-all duration-300
        ${selected
          ? `border-transparent ring-2 ${
              isDark
                ? "ring-white/40 bg-gradient-to-br from-slate-800 to-slate-700"
                : "ring-gray-400 bg-white shadow-xl"
            }`
          : isDark
          ? "border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/60 hover:border-white/20"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        }
        shadow-lg ${selected ? `shadow-xl ${role.glow}` : ""}
      `}
    >
      {/* Selection glow overlay */}
      {selected && (
        <motion.div
          layoutId="selected-glow"
          className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-10 pointer-events-none`}
          initial={false}
        />
      )}

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${role.gradient} shadow-lg`}
        >
          <Icon size={22} className="text-white" />
        </div>

        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-6 h-6 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-md`}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </motion.div>
        )}
      </div>

      {/* Title & desc */}
      <div className={`font-bold text-base mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
        {role.title}
      </div>
      <p className={`text-xs leading-relaxed mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
        {role.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {role.tags.map((tag) => (
          <span
            key={tag}
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              isDark
                ? "bg-white/10 text-slate-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between text-xs ${isDark ? "text-slate-500" : "text-gray-400"}`}>
        <span>{role.level}</span>
        <span
          className={`font-semibold bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent`}
        >
          {role.questions} Qs
        </span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────
export default function SelectRolePage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { saveRole, isLoading, error, clearError } = useInterview();

  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = roles.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedRole = roles.find((r) => r.id === selected);

  // Handle continue - save to local state only
  const handleContinue = async () => {
    if (!selected) return;
    try {
      clearError();
      // Save role to local state only
      saveRole(selected);
      // Navigate to next step
      navigate("/interview/select-profile");
    } catch (err) {
      console.error("Error saving role:", err);
    }
  };

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
          className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-violet-500/8" : "bg-violet-500/5"
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-cyan-500/8" : "bg-cyan-500/4"
          }`}
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className={`absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-pink-500/6" : "bg-pink-500/3"
          }`}
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Back nav */}
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
          Back to Dashboard
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
                AI Interview
              </span>
            </div>
          </div>

          <h1
            className={`text-4xl font-bold mb-3 tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Select Your Role
          </h1>
          <p className={`text-base max-w-xl ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            Choose the role you're interviewing for. We'll tailor questions to
            your experience and target company.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8 max-w-sm"
        >
          <Search
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDark ? "text-slate-500" : "text-gray-400"
            }`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles or skills…"
            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition border ${
              isDark
                ? "bg-slate-800/60 border-white/10 text-white placeholder-slate-500 focus:border-violet-500/50 focus:bg-slate-800"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 shadow-sm"
            }`}
          />
        </motion.div>

        {/* Step indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 mb-8"
        >
          {["Select Role", "Setup Profile", "Quick Setup", "Interview"].map(
            (step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                    i === 0
                      ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md"
                      : isDark
                      ? "bg-slate-800/60 text-slate-500 border border-white/10"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      i === 0
                        ? "bg-white/20"
                        : isDark
                        ? "bg-slate-700"
                        : "bg-gray-200"
                    }`}
                  >
                    {i + 1}
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

        {/* Role grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {filtered.map((role, i) => (
              <motion.div
                key={role.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <RoleCard
                  role={role}
                  selected={selected === role.id}
                  onClick={() =>
                    setSelected(selected === role.id ? null : role.id)
                  }
                  isDark={isDark}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className={`text-lg ${isDark ? "text-slate-500" : "text-gray-400"}`}>
              No roles found for "{search}"
            </p>
          </motion.div>
        )}

        {/* Bottom CTA bar */}
        <AnimatePresence>
          {selected && selectedRole && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
            >
              <div
                className={`flex items-center justify-between gap-4 rounded-2xl px-6 py-4 shadow-2xl border backdrop-blur-xl ${
                  isDark
                    ? "bg-slate-900/90 border-white/10"
                    : "bg-white/90 border-gray-200"
                }`}
              >
                {/* Selected role info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${selectedRole.gradient} shadow-md`}
                  >
                    <selectedRole.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <div
                      className={`text-sm font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedRole.title}
                    </div>
                    <div
                      className={`text-xs ${
                        isDark ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      {selectedRole.questions} questions · {selectedRole.level}
                    </div>
                  </div>
                </div>

                {/* Continue button */}
                <motion.button
                  whileHover={!isLoading ? { scale: 1.04 } : {}}
                  whileTap={!isLoading ? { scale: 0.97 } : {}}
                  disabled={isLoading}
                  onClick={handleContinue}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg bg-gradient-to-r ${selectedRole.gradient} transition ${
                    isLoading ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl cursor-pointer"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight size={16} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`fixed bottom-6 left-6 z-50 flex items-start gap-3 p-4 rounded-lg max-w-sm ${
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

        {/* Bottom padding for CTA */}
        {selected && <div className="h-24" />}
      </div>
    </div>
  );
}