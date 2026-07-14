/**
 * Limelight nav — a light-bar indicator glides to the hovered/active item.
 * Equivalent of 21st.dev @easemize/limelight-nav, on our motion tokens.
 * Renders plain <a href> so existing full-page navigation behavior is kept.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { SPRING } from "@/lib/motion";

export interface LimelightNavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
}

interface LimelightNavProps {
  items: LimelightNavItem[];
  activeId?: string;
  className?: string;
}

export function LimelightNav({ items, activeId, className = "" }: LimelightNavProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const litId = hoveredId ?? activeId;

  return (
    <nav
      className={`relative flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 px-1.5 py-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 ${className}`}
      onMouseLeave={() => setHoveredId(null)}
    >
      {items.map((item) => {
        const lit = litId === item.id;
        return (
          <a
            key={item.id}
            href={item.href}
            onMouseEnter={() => setHoveredId(item.id)}
            onFocus={() => setHoveredId(item.id)}
            className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              lit
                ? "text-slate-900 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
          >
            {lit && (
              <motion.span
                layoutId="limelight"
                transition={SPRING}
                className="absolute inset-0 -z-10 rounded-full bg-slate-900/5 dark:bg-white/10"
              >
                {/* the light bar + glow cone */}
                <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
                <span className="absolute left-1/2 top-0 h-6 w-10 -translate-x-1/2 rounded-b-full bg-gradient-to-b from-violet-500/25 to-transparent blur-sm" />
              </motion.span>
            )}
            <span className="flex items-center gap-1.5">
              {item.icon}
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
