/**
 * Workspace switcher — the app has two sides (Interview practice and Job
 * Search). A segmented control in the top bar is the conventional home for a
 * global mode switch: both options always visible, one tap to flip, the
 * active side obvious. A gradient pill slides between segments (layoutId).
 */
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Mic } from "lucide-react";
import { SPRING } from "@/lib/motion";

const MODES = [
  { id: "interview", label: "Interview", icon: Mic, home: "/interview/select-role", match: "/interview" },
  { id: "jobs", label: "Jobs", icon: Briefcase, home: "/jobs", match: "/jobs" },
] as const;

interface ModeSwitchProps {
  className?: string;
  /** Full-width stacked layout for the mobile menu. */
  stacked?: boolean;
  onNavigate?: () => void;
}

export default function ModeSwitch({ className = "", stacked = false, onNavigate }: ModeSwitchProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeId = pathname.startsWith("/jobs") ? "jobs" : "interview";

  return (
    <div
      role="tablist"
      aria-label="Switch workspace"
      className={`flex gap-1 rounded-full border p-1 backdrop-blur-xl border-slate-200 bg-slate-100/70 dark:border-white/10 dark:bg-white/5 ${
        stacked ? "w-full" : ""
      } ${className}`}
    >
      {MODES.map((mode) => {
        const active = mode.id === activeId;
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              // Already here? don't reset the user's place in that flow.
              if (!pathname.startsWith(mode.match)) navigate(mode.home);
              onNavigate?.();
            }}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {active && (
              <motion.span
                layoutId="mode-switch-pill"
                transition={SPRING}
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 shadow-[0_0_20px_-4px_rgba(139,92,246,0.8)]"
              />
            )}
            <Icon size={16} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
