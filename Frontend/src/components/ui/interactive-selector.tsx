/**
 * Interactive selector — horizontal expanding panels; the active one grows.
 * Equivalent of 21st.dev @thanh/interactive-selector, on our motion tokens.
 * Collapses to a vertical accordion on small screens.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { DUR, SPRING } from "@/lib/motion";

export interface SelectorOption {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  footer?: ReactNode;
}

interface InteractiveSelectorProps {
  options: SelectorOption[];
  defaultActiveId?: string;
  className?: string;
}

export function InteractiveSelector({
  options,
  defaultActiveId,
  className = "",
}: InteractiveSelectorProps) {
  const [activeId, setActiveId] = useState(defaultActiveId ?? options[0]?.id);

  return (
    <div className={`flex flex-col gap-3 md:h-80 md:flex-row ${className}`}>
      {options.map((opt) => {
        const active = opt.id === activeId;
        return (
          <motion.button
            key={opt.id}
            type="button"
            layout
            transition={SPRING}
            onClick={() => setActiveId(opt.id)}
            onMouseEnter={() => setActiveId(opt.id)}
            onFocus={() => setActiveId(opt.id)}
            aria-expanded={active}
            className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-colors md:h-full ${
              active
                ? "border-violet-400/50 bg-gradient-to-br from-violet-600/10 to-cyan-500/10 md:flex-[3.5] dark:border-violet-500/40"
                : "border-slate-200 bg-white hover:border-violet-300 md:flex-[1] dark:border-white/10 dark:bg-slate-900/70 dark:hover:border-violet-500/30"
            }`}
          >
            <span className="flex items-start gap-3 md:h-full md:flex-col md:justify-between">
              <span className="text-3xl" aria-hidden="true">
                {opt.icon}
              </span>
              <span className="min-w-0">
                <span
                  className={`block truncate text-lg font-bold ${
                    active ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {opt.title}
                </span>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.span
                      className="mt-2 block"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: DUR.base, delay: 0.1 } }}
                      exit={{ opacity: 0, transition: { duration: DUR.fast } }}
                    >
                      <span className="block text-sm text-slate-600 dark:text-slate-400">
                        {opt.description}
                      </span>
                      {opt.footer ? <span className="mt-3 block">{opt.footer}</span> : null}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
