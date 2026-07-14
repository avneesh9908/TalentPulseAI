import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { DUR, EASE_OUT, VIEWPORT } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before starting (use for manual sequencing). */
  delay?: number;
  /** Entrance travel in px; 0 = pure fade. */
  y?: number;
  duration?: number;
}

/**
 * Scroll-reveal wrapper: fades/slides children in the first time they enter
 * the viewport. Respects reduced motion via the global MotionConfig.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = DUR.slow,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
