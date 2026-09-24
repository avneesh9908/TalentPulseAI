/**
 * The landing hero's visual: an original phosphor scene drawn on a canvas.
 *
 * Subject is TalentPulse's own — a voice waveform being scanned and read, which
 * is literally what the product does to an answer. A column grid of dots is
 * driven by a layered pseudo-waveform, a brighter scan head sweeps across it,
 * and the pointer pushes and ignites the dots it passes near.
 *
 * Deliberately cheap: one 2D context, ~1.2k dots, no images and no libraries.
 * Honours `prefers-reduced-motion` by drawing a single static frame, and stops
 * the loop when the tab is hidden or the element scrolls out of view.
 */
import { useEffect, useRef } from "react";

const ACCENT = "0, 255, 65";
const SOFT = "74, 222, 128";

export function HeroCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /** Pointer in canvas space; -1 means "no pointer", which idles the effect. */
  const pointer = useRef({ x: -1, y: -1, strength: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Layered sines — an answer never has one clean frequency. */
    const wave = (x: number, t: number) =>
      Math.sin(x * 0.012 + t) * 0.5 +
      Math.sin(x * 0.031 - t * 1.7) * 0.3 +
      Math.sin(x * 0.005 + t * 0.4) * 0.2;

    const draw = (time: number) => {
      const t = reduced ? 0 : time / 1000;
      ctx.clearRect(0, 0, width, height);

      const stepX = 14;
      const stepY = 12;
      const midY = height * 0.5;
      // The scan head runs left to right and wraps, like a tape being read.
      const scanX = reduced ? width * 0.62 : ((t * 150) % (width + 320)) - 160;
      const p = pointer.current;

      for (let x = 0; x < width; x += stepX) {
        const amp = wave(x, t) * height * 0.22;
        const columnTop = midY - Math.abs(amp);
        const columnBottom = midY + Math.abs(amp);

        for (let y = columnTop; y <= columnBottom; y += stepY) {
          // Distance from the vertical centre → the column fades at its tips.
          const spread = Math.abs(y - midY) / Math.max(Math.abs(amp), 1);
          let alpha = (1 - spread) * 0.5 + 0.08;

          // The scan head ignites whatever it is passing over.
          const scanDist = Math.abs(x - scanX);
          const scanHit = scanDist < 90 ? 1 - scanDist / 90 : 0;
          alpha += scanHit * 0.55;

          let dx = 0;
          let dy = 0;
          // Pointer proximity pushes dots outward and brightens them.
          if (p.x >= 0) {
            const vx = x - p.x;
            const vy = y - p.y;
            const dist = Math.hypot(vx, vy);
            if (dist < 150) {
              const force = (1 - dist / 150) * p.strength;
              dx = (vx / (dist || 1)) * force * 26;
              dy = (vy / (dist || 1)) * force * 26;
              alpha += force * 0.7;
            }
          }

          if (alpha <= 0.04) continue;
          const bright = scanHit > 0.35 || alpha > 0.75;
          ctx.fillStyle = `rgba(${bright ? ACCENT : SOFT}, ${Math.min(alpha, 1)})`;
          const size = bright ? 2.2 : 1.6;
          ctx.fillRect(x + dx, y + dy, size, size);
        }
      }

      // The scan head itself: a soft vertical bar of light.
      if (!reduced) {
        const grad = ctx.createLinearGradient(scanX - 60, 0, scanX + 60, 0);
        grad.addColorStop(0, `rgba(${ACCENT}, 0)`);
        grad.addColorStop(0.5, `rgba(${ACCENT}, 0.16)`);
        grad.addColorStop(1, `rgba(${ACCENT}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(scanX - 60, 0, 120, height);
      }

      // Pointer decays back to idle so the effect settles after the cursor leaves.
      if (p.strength > 0 && p.x < 0) p.strength = Math.max(0, p.strength - 0.04);

      if (running && !reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    /*
     * Paint one frame synchronously before the loop starts. rAF does not fire
     * at all in a background tab, so without this the hero is an empty black
     * rectangle until the tab is focused.
     */
    draw(0);
    raf = requestAnimationFrame(draw);

    const onResize = () => {
      resize();
      if (reduced) draw(0);
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current.x = e.clientX - rect.left;
      pointer.current.y = e.clientY - rect.top;
      pointer.current.strength = 1;
      if (reduced) draw(0);
    };
    const onPointerLeave = () => {
      pointer.current.x = -1;
      pointer.current.y = -1;
    };
    const onVisibility = () => {
      running = !document.hidden;
      if (running && !reduced) raf = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", onResize);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block h-full w-full touch-none ${className}`}
    />
  );
}
