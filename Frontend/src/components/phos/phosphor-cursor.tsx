/**
 * A phosphor cursor for the whole site.
 *
 * The hero portrait's reveal lens only exists inside that one canvas, so the
 * pointer stops meaning anything the moment you leave it. This puts the same
 * language everywhere: wherever the cursor goes it drags a short phosphor
 * trail, sits inside a soft bloom, and carries a terminal crosshair and ring —
 * so the whole page reads as one screen being pointed at, not just the hero.
 *
 * One fixed canvas over the document, `pointer-events-none`, so it never
 * intercepts a click. It costs a radial gradient and ~18 small fills a frame,
 * and it parks itself two seconds after the pointer stops.
 *
 * Only mounted for a fine pointer (mouse/trackpad) and only when the reader has
 * not asked for reduced motion — a trail chasing a finger on a touchscreen is
 * noise, and a decaying comet is exactly the kind of motion that setting means.
 */
import { useEffect, useRef } from "react";

const ACCENT = "0, 255, 65";
/** Trail length. Each entry is one past pointer position, newest first. */
const TRAIL = 18;
/** How long the loop keeps running after the pointer stops, in ms. */
const IDLE_MS = 2000;

export function PhosphorCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!fine || reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    /** Where the pointer actually is. */
    const target = { x: -1, y: -1 };
    /** Where the bloom is — it lags, which is what makes the trail read as drag. */
    const eased = { x: -1, y: -1 };
    const trail: { x: number; y: number }[] = [];
    let lastMove = 0;
    /** 0…1 — fades the whole overlay in on first move and out when idle. */
    let presence = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const idle = performance.now() - lastMove > IDLE_MS;
      presence += ((idle ? 0 : 1) - presence) * 0.08;

      if (eased.x >= 0 && presence > 0.01) {
        // Chase the pointer. The gap between eased and target IS the trail.
        eased.x += (target.x - eased.x) * 0.18;
        eased.y += (target.y - eased.y) * 0.18;
        trail.unshift({ x: eased.x, y: eased.y });
        trail.length = Math.min(trail.length, TRAIL);

        // Trail: phosphor pixels, not a stroked line — same vocabulary as the
        // halftone, and the decay reads as a screen forgetting.
        for (let i = trail.length - 1; i >= 0; i--) {
          const p = trail[i];
          const age = 1 - i / TRAIL;
          const size = 1 + age * 2.4;
          ctx.fillStyle = `rgba(${ACCENT}, ${age * age * 0.5 * presence})`;
          ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
        }

        const { x, y } = target;

        // Bloom — the glow the phosphor would actually throw.
        const bloom = ctx.createRadialGradient(x, y, 0, x, y, 120);
        bloom.addColorStop(0, `rgba(${ACCENT}, ${0.1 * presence})`);
        bloom.addColorStop(0.45, `rgba(${ACCENT}, ${0.035 * presence})`);
        bloom.addColorStop(1, `rgba(${ACCENT}, 0)`);
        ctx.fillStyle = bloom;
        ctx.fillRect(x - 120, y - 120, 240, 240);

        // Ring + crosshair: the terminal's own pointer, drawn over the OS one.
        ctx.strokeStyle = `rgba(${ACCENT}, ${0.35 * presence})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(${ACCENT}, ${0.55 * presence})`;
        ctx.beginPath();
        for (const [ax, ay, bx, by] of [
          [x - 26, y, x - 21, y],
          [x + 21, y, x + 26, y],
          [x, y - 26, x, y - 21],
          [x, y + 21, x, y + 26],
        ]) {
          ctx.moveTo(ax + 0.5, ay + 0.5);
          ctx.lineTo(bx + 0.5, by + 0.5);
        }
        ctx.stroke();
      }

      // Park once the overlay has faded out — no point burning frames on nothing.
      if (idle && presence <= 0.01) {
        running = false;
        ctx.clearRect(0, 0, width, height);
        return;
      }
      raf = requestAnimationFrame(draw);
    };

    const wake = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (eased.x < 0) {
        eased.x = target.x;
        eased.y = target.y;
      }
      lastMove = performance.now();
      wake();
    };
    const onPointerLeave = () => {
      // Treat leaving the window as going idle, so the trail fades rather than
      // freezing at the edge.
      lastMove = 0;
    };
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (performance.now() - lastMove < IDLE_MS) {
        wake();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
    />
  );
}
