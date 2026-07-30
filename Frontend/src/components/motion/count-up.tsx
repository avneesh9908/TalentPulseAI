import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  /** Display value like "50K+", "85%", "4.9★", "24/7" — leading number animates, suffix stays. */
  value: string;
  className?: string;
  duration?: number;
}

/**
 * Counts the leading number of `value` up from 0 when scrolled into view.
 * Renders the static value under reduced motion or for non-numeric values.
 */
export function CountUp({ value, className, duration = 1.4 }: CountUpProps) {
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(value);
  const target = match ? parseFloat(match[1]) : null;
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const suffix = match ? match[2] : "";

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const animatable = target !== null && !reduced;
  const [display, setDisplay] = useState(() => "0" + suffix);

  useEffect(() => {
    if (!animatable || !inView || target === null) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v.toFixed(decimals) + suffix),
    });
    return () => controls.stop();
  }, [animatable, inView, target, suffix, decimals, duration]);

  return (
    <span ref={ref} className={className}>
      {animatable ? display : value}
    </span>
  );
}
