import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, BarChart3, CheckCircle2, Home, RotateCcw, Sparkles, Target } from "lucide-react";
import { useTheme } from "@/contexts/use-theme";
import type { InterviewSubmitResponse } from "@/types/api";

type ResultState = {
  result?: InterviewSubmitResponse;
  totalQuestions?: number;
  answeredQuestions?: number;
};

const scoreTone = (score: number) => {
  if (score >= 80) return "text-emerald-500";
  if (score >= 65) return "text-cyan-500";
  return "text-amber-500";
};

export default function InterviewResultPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { state } = useLocation();
  const typedState = (state as ResultState) || {};
  const result = typedState.result;
  const totalQuestions = typedState.totalQuestions ?? result?.feedback.question_feedback.length ?? 0;
  const answeredQuestions = typedState.answeredQuestions ?? result?.feedback.question_feedback.length ?? 0;

  const completedAt = useMemo(() => {
    if (!result?.completed_at) return "N/A";
    const date = new Date(result.completed_at);
    return Number.isNaN(date.getTime()) ? result.completed_at : date.toLocaleString();
  }, [result?.completed_at]);

  if (!result) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"}`}>
        <div className={`max-w-lg w-full rounded-2xl border p-6 text-center ${isDark ? "bg-slate-900 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
          <h1 className="text-2xl font-bold mb-2">No Interview Result Found</h1>
          <p className={`${isDark ? "text-slate-400" : "text-slate-600"} mb-4`}>
            Submit an interview first to view your final score and detailed feedback.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700"
          >
            <Home size={16} />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-slate-50 via-white to-slate-100"}`}>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-violet-500/10 text-violet-500">
            <Sparkles size={14} />
            AI Interview Report
          </div>
          <h1 className={`text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Interview Completed</h1>
          <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{result.message}</p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`lg:col-span-1 rounded-2xl border p-6 ${isDark ? "bg-slate-900/60 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
            <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Final Score</p>
            <p className={`text-6xl font-bold ${scoreTone(result.score)}`}>{result.score}</p>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>out of 100</p>
            <div className="mt-5 space-y-2 text-sm">
              <p className={`${isDark ? "text-slate-300" : "text-slate-700"}`}><Award size={14} className="inline mr-2" />Status: {result.status}</p>
              <p className={`${isDark ? "text-slate-300" : "text-slate-700"}`}><Target size={14} className="inline mr-2" />Answered: {answeredQuestions}/{totalQuestions}</p>
              <p className={`${isDark ? "text-slate-300" : "text-slate-700"}`}><BarChart3 size={14} className="inline mr-2" />Completed: {completedAt}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`lg:col-span-2 rounded-2xl border p-6 ${isDark ? "bg-slate-900/60 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
            <h2 className={`text-xl font-semibold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>Overall Feedback</h2>
            <p className={`${isDark ? "text-slate-300" : "text-slate-700"} leading-relaxed mb-6`}>{result.feedback.overall_feedback}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className={`rounded-xl p-4 ${isDark ? "bg-slate-950" : "bg-slate-50 border border-slate-200"}`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}><CheckCircle2 size={16} />Strengths</h3>
                <ul className="space-y-2 text-sm">
                  {result.feedback.strengths.map((item, idx) => (
                    <li key={`str-${idx}`} className={isDark ? "text-slate-300" : "text-slate-700"}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-xl p-4 ${isDark ? "bg-slate-950" : "bg-slate-50 border border-slate-200"}`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-amber-300" : "text-amber-700"}`}><Target size={16} />Improve Next</h3>
                <ul className="space-y-2 text-sm">
                  {result.feedback.improvements.map((item, idx) => (
                    <li key={`imp-${idx}`} className={isDark ? "text-slate-300" : "text-slate-700"}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`rounded-2xl border p-6 mt-5 ${isDark ? "bg-slate-900/60 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Question-wise Feedback</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {result.feedback.question_feedback.map((item) => (
              <div key={item.question_id} className={`rounded-xl p-4 ${isDark ? "bg-slate-950" : "bg-slate-50 border border-slate-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{item.question_id.toUpperCase()}</p>
                  <p className={`text-sm font-bold ${scoreTone(item.score)}`}>{item.score}/100</p>
                </div>
                <p className={`text-xs mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Word count: {item.word_count}</p>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>{item.feedback}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={`rounded-2xl border p-6 mt-5 ${isDark ? "bg-slate-900/60 border-white/[0.08]" : "bg-white border-slate-200 shadow-sm"}`}>
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>Next Steps</h2>
          <ul className="space-y-2 text-sm">
            {result.feedback.next_steps.map((step, idx) => (
              <li key={`step-${idx}`} className={isDark ? "text-slate-300" : "text-slate-700"}>{step}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => navigate("/interview/select-role")}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700"
            >
              <RotateCcw size={16} />
              Start New Interview
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800"
            >
              <Home size={16} />
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
