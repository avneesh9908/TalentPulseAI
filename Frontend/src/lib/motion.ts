/**
 * Motion design tokens — the single source of truth for animation timing.
 * (Phase 1 approved spec: out-quint entrances, springs for interaction,
 * 70ms stagger capped at 600ms, whileInView once at -80px.)
 */
import type { Transition, Variants } from "framer-motion";

/** Durations in seconds (framer-motion units). */
export const DUR = {
  /** hover / micro-interactions */
  fast: 0.15,
  /** element entrances */
  base: 0.3,
  /** section reveals */
  slow: 0.5,
  /** one-time hero choreography */
  hero: 0.8,
} as const;

/** Confident out-quint for entrances. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Spring for interactive hover/tap states. */
export const SPRING: Transition = { type: "spring", stiffness: 260, damping: 22 };

/** Delay between sibling reveals; cap a sequence at ~600ms total. */
export const STAGGER = 0.07;

/** Shared whileInView viewport settings — reveal once, slightly before entry. */
export const VIEWPORT = { once: true, margin: "-80px" } as const;

export const fadeUp = (distance = 24, duration: number = DUR.slow): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: { opacity: 1, y: 0, transition: { duration, ease: EASE_OUT } },
});

export const fadeIn = (duration: number = DUR.slow): Variants => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration, ease: EASE_OUT } },
});

export const scaleIn = (from = 0.92, duration: number = DUR.slow): Variants => ({
  hidden: { opacity: 0, scale: from },
  visible: { opacity: 1, scale: 1, transition: { duration, ease: EASE_OUT } },
});

/** Parent variants that stagger their children (pair with staggerChild). */
export const staggerParent = (stagger: number = STAGGER, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

export const staggerChild = (distance = 24, duration: number = DUR.base): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: { opacity: 1, y: 0, transition: { duration, ease: EASE_OUT } },
});
