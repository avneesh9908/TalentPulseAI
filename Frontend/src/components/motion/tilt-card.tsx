import { useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMotionSafe } from "@/components/motion/use-motion-safe";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  max?: number;
}

/**
 * 3D cursor-rotate: the card tilts toward the pointer (rotateX/rotateY springs).
 * Desktop pointer:fine + motion-safe only; otherwise renders static.
 */
export function TiltCard({ children, className = "", max = 10 }: TiltCardProps) {
  const safe = useMotionSafe();
  const [finePointer] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rxs = useSpring(rx, { stiffness: 180, damping: 20 });
  const rys = useSpring(ry, { stiffness: 180, damping: 20 });
  const enabled = safe && finePointer;

  return (
    <div className={`[perspective:1000px] ${className}`}>
      <motion.div
        className="h-full w-full"
        style={enabled ? { rotateX: rxs, rotateY: rys, transformStyle: "preserve-3d" } : undefined}
        onMouseMove={
          enabled
            ? (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width - 0.5;
                const py = (e.clientY - rect.top) / rect.height - 0.5;
                ry.set(px * max * 2);
                rx.set(-py * max * 2);
              }
            : undefined
        }
        onMouseLeave={
          enabled
            ? () => {
                rx.set(0);
                ry.set(0);
              }
            : undefined
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
