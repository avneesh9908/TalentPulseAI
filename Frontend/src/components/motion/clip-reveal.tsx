import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_OUT, VIEWPORT } from "@/lib/motion";
import { useMotionSafe } from "@/components/motion/use-motion-safe";

interface ClipRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Wipe direction. */
  from?: "left" | "right" | "bottom";
}

const HIDDEN: Record<NonNullable<ClipRevealProps["from"]>, string> = {
  left: "inset(0 100% 0 0)",
  right: "inset(0 0 0 100%)",
  bottom: "inset(100% 0 0 0)",
};

/**
 * Clip-path curtain reveal on scroll (image-effect equivalent of 21st.dev
 * clip-path-image). clipPath isn't covered by MotionConfig's reducedMotion,
 * so it renders statically via useMotionSafe when motion is reduced.
 */
export function ClipReveal({ children, className, delay = 0, from = "left" }: ClipRevealProps) {
  const safe = useMotionSafe();
  if (!safe) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ clipPath: HIDDEN[from] }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
