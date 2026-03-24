import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/App";
import {
  UserCircle2,
  Upload,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
type ProfileOption = "existing" | "upload" | null;

// ─────────────────────────────────────────
// Option Card
// ─────────────────────────────────────────
function ProfileOptionCard({
  id,
  icon: Icon,
  title,
  description,
  badge,
  disabled,
  selected,
  gradient,
  onClick,
  isDark,
}: {
  id: ProfileOption;
  icon: any;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
  selected: boolean;
  gradient: string;
  onClick: () => void;
  isDark: boolean;
}) {
  return (
    <motion.div
      whileHover={!disabled ? { y: -4, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`
        relative overflow-hidden rounded-2xl p-7 border-2 transition-all duration-300
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${
          selected
            ? isDark
              ? `border-transparent ring-2 ring-white/40 bg-gradient-to-br from-slate-800 to-slate-700 shadow-xl`
              : `border-transparent ring-2 ring-gray-400 bg-white shadow-xl`
            : isDark
            ? "border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/60 hover:border-white/20 shadow-lg"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md shadow-sm"
        }
      `}
    >
      {/* Selected glow */}
      {selected && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 pointer-events-none`}
        />
      )}

      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4">
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
              badge === "Coming Soon"
                ? isDark
                  ? "bg-slate-700 text-slate-400 border border-slate-600"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-5`}
        >
          <Icon size={26} className="text-white" />
        </div>

        {/* Selected check */}
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-0 right-0"
          >
            <CheckCircle2 size={24} className="text-white" />
          </motion.div>
        )}

        <h3
          className={`text-xl font-bold mb-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-sm leading-relaxed ${
            isDark ? "text-slate-400" : "text-gray-500"
          }`}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Upload Zone
// ─────────────────────────────────────────
function UploadZone({
  isDark,
  file,
  onFile,
  onClear,
}: {
  isDark: boolean;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") onFile(dropped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-4 rounded-2xl px-5 py-4 border ${
          isDark
            ? "bg-emerald-500/10 border-emerald-500/30"
            : "bg-emerald-50 border-emerald-300"
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
          <FileText size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold truncate ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {file.name}
          </p>
          <p
            className={`text-xs ${
              isDark ? "text-emerald-400" : "text-emerald-600"
            }`}
          >
            {(file.size / 1024).toFixed(1)} KB · Ready to analyze
          </p>
        </div>
        <button
          onClick={onClear}
          className={`p-1.5 rounded-lg transition ${
            isDark
              ? "hover:bg-white/10 text-slate-400"
              : "hover:bg-gray-200 text-gray-500"
          }`}
        >
          <X size={16} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`
        relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer
        transition-all duration-200
        ${
          dragging
            ? isDark
              ? "border-violet-500 bg-violet-500/10"
              : "border-violet-400 bg-violet-50"
            : isDark
            ? "border-white/15 hover:border-white/30 hover:bg-white/5"
            : "border-gray-300 hover:border-violet-400 hover:bg-violet-50/50"
        }
      `}
    >
      <input
        ref={ref}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />

      <div
        className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
          isDark ? "bg-white/10" : "bg-gray-100"
        }`}
      >
        <Upload
          size={24}
          className={isDark ? "text-slate-400" : "text-gray-500"}
        />
      </div>

      <p
        className={`text-base font-semibold mb-1 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Drop your resume here
      </p>
      <p
        className={`text-sm ${isDark ? "text-slate-500" : "text-gray-400"}`}
      >
        or{" "}
        <span className="text-violet-500 font-medium">click to browse</span>
      </p>
      <p
        className={`text-xs mt-2 ${isDark ? "text-slate-600" : "text-gray-400"}`}
      >
        PDF only · Max 5MB
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────
export default function SelectProfilePage() {
  const { isDark } = useTheme();
  const [selected, setSelected] = useState<ProfileOption>(null);
  const [file, setFile] = useState<File | null>(null);

  const canContinue =
    selected === "existing" || (selected === "upload" && file !== null);

  const options = [
    {
      id: "existing" as ProfileOption,
      icon: UserCircle2,
      title: "Use Existing Profile",
      description:
        "Load your saved resume and skills. Instantly pick up from where you left off.",
      badge: "Coming Soon",
      disabled: true,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      id: "upload" as ProfileOption,
      icon: Upload,
      title: "Upload New Resume",
      description:
        "Upload a fresh PDF resume and let our AI extract your skills and tailor questions.",
      badge: "Active",
      disabled: false,
      gradient: "from-violet-500 to-purple-600",
    },
  ];

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
          className={`absolute top-0 right-1/3 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-violet-500/8" : "bg-violet-500/5"
          }`}
        />
        <div
          className={`absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full blur-3xl animate-pulse ${
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
          Back to Role Selection
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
                Step 2 of 4
              </span>
            </div>
          </div>
          <h1
            className={`text-4xl font-bold mb-3 tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Setup Your Profile
          </h1>
          <p
            className={`text-base max-w-lg ${
              isDark ? "text-slate-400" : "text-gray-500"
            }`}
          >
            We'll use your profile to personalize questions. Choose how you'd
            like to proceed.
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
                    i === 1
                      ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md"
                      : i === 0
                      ? isDark
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-emerald-100 text-emerald-600 border border-emerald-300"
                      : isDark
                      ? "bg-slate-800/60 text-slate-500 border border-white/10"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      i === 1
                        ? "bg-white/20"
                        : i === 0
                        ? isDark
                          ? "bg-emerald-500/30"
                          : "bg-emerald-200"
                        : isDark
                        ? "bg-slate-700"
                        : "bg-gray-200"
                    }`}
                  >
                    {i === 0 ? "✓" : i + 1}
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

        {/* Option cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8"
        >
          {options.map((opt) => (
            <ProfileOptionCard
              key={opt.id}
              {...opt}
              selected={selected === opt.id}
              onClick={() => {
                if (!opt.disabled) {
                  setSelected(opt.id);
                  setFile(null);
                }
              }}
              isDark={isDark}
            />
          ))}
        </motion.div>

        {/* Upload zone — shown when upload is selected */}
        <AnimatePresence>
          {selected === "upload" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <UploadZone
                isDark={isDark}
                file={file}
                onFile={setFile}
                onClear={() => setFile(null)}
              />

              {/* Info note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`flex items-start gap-2.5 mt-4 p-4 rounded-xl ${
                  isDark
                    ? "bg-blue-500/10 border border-blue-500/20"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <AlertCircle
                  size={16}
                  className={`mt-0.5 flex-shrink-0 ${
                    isDark ? "text-blue-400" : "text-blue-500"
                  }`}
                />
                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  AI parsing will extract your skills, experience, and tech
                  stack automatically. You can review and edit before the
                  interview starts.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-between"
        >
          <button
            className={`text-sm transition ${
              isDark
                ? "text-slate-500 hover:text-slate-300"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Skip for now
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
            Continue to Quick Setup
            <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}