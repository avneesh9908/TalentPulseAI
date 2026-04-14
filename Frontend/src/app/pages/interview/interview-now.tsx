import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/use-theme";
import { useInterview } from "@/contexts/use-interview";
import { ArrowLeft, PlayCircle, CheckCircle2 } from "lucide-react";

export default function InterviewNowPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const {
    interviewId,
    interviewSetup,
    selectedRole,
    profileOption,
    experience,
    difficulty,
    skills,
  } = useInterview();

  const payloadPreview = useMemo(
    () => ({
      setup_id: 0,
      role: selectedRole,
      profile_option: profileOption,
      experience,
      difficulty,
      skills,
    }),
    [difficulty, experience, profileOption, selectedRole, skills]
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-10">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate("/interview/quick-setup")}
          className={`flex items-center gap-2 text-sm mb-8 transition ${
            isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ArrowLeft size={16} />
          Back to Quick Search
        </motion.button>

        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Interview Now
          </h1>
          <p className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Interview session is initialized. Live interview UI will be attached on this page.
          </p>
        </motion.div>

        <div className={`rounded-2xl p-6 border mb-5 ${isDark ? "bg-slate-900/60 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Setup Saved
            </h2>
          </div>
          <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Interview ID:{" "}
            <span className={`font-semibold ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
              {interviewId || "Not available"}
            </span>
          </p>
          <p className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Status: {interviewSetup?.status || "initialized"}
          </p>
        </div>

        <div className={`rounded-2xl p-6 border ${isDark ? "bg-slate-900/60 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
          <h3 className={`text-base font-semibold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
            Saved Payload JSON
          </h3>
          <pre
            className={`text-xs p-4 rounded-xl overflow-x-auto ${
              isDark ? "bg-slate-950 text-slate-300" : "bg-slate-50 text-slate-700"
            }`}
          >
            {JSON.stringify(payloadPreview, null, 2)}
          </pre>
        </div>

        <div className="flex items-center justify-end mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition bg-gradient-to-r from-violet-600 to-cyan-600 hover:shadow-xl"
          >
            <PlayCircle size={16} />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
