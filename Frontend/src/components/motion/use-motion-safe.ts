import { useReducedMotion } from "framer-motion";

/**
 * True when it's OK to run decorative motion (ambient loops, parallax, tilt,
 * autoplay, 3D). Under prefers-reduced-motion this returns false — components
 * must then render their static fallback. Transform/opacity entrances are
 * already handled globally by <MotionConfig reducedMotion="user">.
 */
export function useMotionSafe(): boolean {
  return !useReducedMotion();
}
