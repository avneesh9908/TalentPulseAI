import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { STAGGER, VIEWPORT, staggerChild, staggerParent } from "@/lib/motion";

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  /** Seconds between siblings. */
  stagger?: number;
  delay?: number;
}

/**
 * Parent/child pair for staggered reveals. Children must be <StaggerItem>.
 *
 *   <StaggerGroup className="grid ...">
 *     {items.map((it) => <StaggerItem key={it.id}>…</StaggerItem>)}
 *   </StaggerGroup>
 */
export function StaggerGroup({
  children,
  className,
  stagger = STAGGER,
  delay = 0,
}: StaggerGroupProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={staggerParent(stagger, delay)}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  /** Entrance travel in px; 0 = pure fade. */
  y?: number;
}

export function StaggerItem({ children, className, y = 24 }: StaggerItemProps) {
  return (
    <motion.div className={className} variants={staggerChild(y)}>
      {children}
    </motion.div>
  );
}
