/**
 * Live-canvas cards: a small phosphor sketch per card, drawn in code.
 *
 * Each sketch illustrates a real step of the product rather than being abstract
 * decoration — a resume being chunked, questions branching out of it, an answer
 * being scored, matches being ranked. They are illustrations, not readouts: no
 * number on screen comes from the API.
 *
 * Cheap by construction — one 2D context per card, a few hundred primitives,
 * no images or libraries. Each card:
 *   - paints one frame synchronously (rAF never fires in a background tab),
 *   - only animates while it is actually on screen (IntersectionObserver),
 *   - falls back to a single static frame under `prefers-reduced-motion`.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { PH_BODY_SM, PH_CARD_HOVER, PH_H3, PH_MONO_RAW } from "./tokens";

const ACCENT = "0, 255, 65";
const SOFT = "74, 222, 128";
const CREAM = "245, 241, 234";

type Pointer = { x: number; y: number; on: boolean };
type Sketch = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: Pointer) => void;

/** Pointer influence: 1 at the cursor, fading to 0 by `radius`. */
const pull = (p: Pointer, x: number, y: number, radius: number) => {
  if (!p.on) return 0;
  const d = Math.hypot(x - p.x, y - p.y);
  return d > radius ? 0 : 1 - d / radius;
};

/** 1 — the resume: a page of text dissolving into indexed chunks. */
const chunks: Sketch = (ctx, w, h, t, p) => {
  const cols = 14;
  const rows = 9;
  const padX = w * 0.16;
  const padY = h * 0.18;
  const stepX = (w - padX * 2) / (cols - 1);
  const stepY = (h - padY * 2) / (rows - 1);
  // Three bands drift apart — the chunks the text is split into.
  for (let r = 0; r < rows; r += 1) {
    const band = Math.floor(r / 3);
    const drift = Math.sin(t * 0.6 + band * 2) * 6 + band * 4;
    for (let c = 0; c < cols; c += 1) {
      // Ragged right edge, like real lines of text.
      if (c / cols > 0.55 + Math.sin(r * 2.3) * 0.35) continue;
      const x = padX + c * stepX + drift;
      const y = padY + r * stepY;
      const f = pull(p, x, y, 70);
      ctx.fillStyle = `rgba(${f > 0.2 ? ACCENT : SOFT}, ${0.22 + f * 0.7})`;
      ctx.fillRect(x, y, stepX * 0.55 + f * 3, 2);
    }
  }
};

/** 2 — the split: one source branching into the two product sides. */
const branch: Sketch = (ctx, w, h, t, p) => {
  const originX = w * 0.16;
  const originY = h * 0.5;
  const tips = 9;
  for (let i = 0; i < tips; i += 1) {
    const spread = (i / (tips - 1) - 0.5) * 1.5;
    const sway = Math.sin(t * 0.8 + i) * 0.08;
    const endX = w * 0.86;
    const endY = originY + (spread + sway) * h * 0.42;
    const midX = w * 0.5;
    const f = pull(p, (originX + endX) / 2, (originY + endY) / 2, 90);
    ctx.strokeStyle = `rgba(${f > 0.25 ? ACCENT : SOFT}, ${0.18 + f * 0.6})`;
    ctx.lineWidth = f > 0.4 ? 1.6 : 1;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.bezierCurveTo(midX, originY, midX, endY, endX, endY);
    ctx.stroke();
    ctx.fillStyle = `rgba(${ACCENT}, ${0.4 + f * 0.6})`;
    ctx.fillRect(endX - 1.5, endY - 1.5, 3, 3);
  }
  ctx.fillStyle = `rgba(${CREAM}, 0.9)`;
  ctx.beginPath();
  ctx.arc(originX, originY, 3.5, 0, Math.PI * 2);
  ctx.fill();
};

/** 3 — the answer: a spoken waveform read by a scoring pass. */
const score: Sketch = (ctx, w, h, t, p) => {
  const bars = 40;
  const gap = w / bars;
  const mid = h * 0.55;
  const head = ((t * 0.32) % 1.4) - 0.2; // 0..1 sweep with a pause off-screen
  for (let i = 0; i < bars; i += 1) {
    const x = i * gap + gap * 0.25;
    const n = Math.sin(i * 0.7 + t) * 0.5 + Math.sin(i * 1.9 - t * 1.3) * 0.3;
    const amp = (0.25 + Math.abs(n)) * h * 0.3;
    const passed = i / bars < head;
    const f = pull(p, x, mid, 60);
    const alpha = (passed ? 0.75 : 0.22) + f * 0.6;
    ctx.fillStyle = `rgba(${passed || f > 0.3 ? ACCENT : SOFT}, ${Math.min(alpha, 1)})`;
    ctx.fillRect(x, mid - amp, gap * 0.45, amp * 2);
  }
  // The scoring head itself.
  const hx = head * w;
  if (hx > 0 && hx < w) {
    ctx.fillStyle = `rgba(${CREAM}, 0.5)`;
    ctx.fillRect(hx, h * 0.14, 1, h * 0.72);
  }
};

/** 4 — the shortlist: matches settling into rank order. */
const rank: Sketch = (ctx, w, h, t, p) => {
  const rows = 6;
  const padX = w * 0.12;
  const rowH = (h * 0.62) / rows;
  const top = h * 0.2;
  for (let i = 0; i < rows; i += 1) {
    // Each row eases toward its final width, then breathes slightly.
    const target = 0.95 - i * 0.13;
    const settle = Math.min(1, Math.max(0, t * 0.5 - i * 0.25));
    const breathe = 1 + Math.sin(t * 0.9 + i) * 0.012;
    const len = (w - padX * 2) * target * settle * breathe;
    const y = top + i * rowH;
    const f = pull(p, padX + len * 0.5, y, 70);
    ctx.fillStyle = `rgba(${SOFT}, ${0.1 + f * 0.25})`;
    ctx.fillRect(padX, y, w - padX * 2, rowH * 0.42);
    ctx.fillStyle = `rgba(${i === 0 || f > 0.35 ? ACCENT : SOFT}, ${0.5 + f * 0.5})`;
    ctx.fillRect(padX, y, len, rowH * 0.42);
  }
};

export const SKETCHES = { chunks, branch, score, rank } as const;
export type SketchName = keyof typeof SKETCHES;

function Sketchpad({ name }: { name: SketchName }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0, on: false });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sketch = SKETCHES[name];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (ms: number) => {
      ctx.clearRect(0, 0, w, h);
      sketch(ctx, w, h, reduced ? 1.8 : ms / 1000, pointer.current);
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    resize();
    frame(0); // synchronous first paint — rAF is dead in a background tab
    if (!reduced) raf = requestAnimationFrame(frame);

    // Only burn frames while the card is actually on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduced && !document.hidden) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, on: true };
      if (reduced) frame(1800);
    };
    const onLeave = () => {
      pointer.current.on = false;
      if (reduced) frame(1800);
    };
    const onResize = () => {
      resize();
      frame(performance.now());
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [name]);

  return <canvas ref={ref} aria-hidden="true" className="block h-full w-full touch-none" />;
}

/**
 * A card whose visual is a live sketch. `index` prints in the corner the way the
 * numbered cards elsewhere do; `meta` is the mono line under the title.
 */
export function CanvasCard({
  sketch,
  index,
  title,
  meta,
  children,
}: {
  sketch: SketchName;
  index?: string;
  title: ReactNode;
  meta?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-[16px] border border-ph-line bg-ph-surface ${PH_CARD_HOVER}`}
    >
      <div className="relative h-[168px] w-full border-b border-ph-line bg-black">
        <Sketchpad name={sketch} />
        {index ? (
          <span className={`${PH_MONO_RAW} absolute right-3 top-3 text-ph-ink-soft`}>{index}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className={`${PH_H3} text-ph-ink`}>{title}</h3>
        {meta ? <p className={`${PH_MONO_RAW} mt-1 text-ph-green`}>{meta}</p> : null}
        {children ? <div className={`${PH_BODY_SM} mt-2`}>{children}</div> : null}
      </div>
    </div>
  );
}
