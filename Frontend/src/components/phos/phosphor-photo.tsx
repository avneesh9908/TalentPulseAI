/**
 * A photograph rendered as a phosphor-CRT scanline halftone, with a hover lens.
 *
 * The look is the one from the reference banner art: pure black void, a single
 * phosphor green, and the subject drawn only as short horizontal scanline
 * dashes whose length and brightness track the source pixel's luminance. The
 * dashes wobble along a slow sine so the portrait reads as a signal being
 * displayed rather than as an image being shown.
 *
 * Four things move:
 *   · the subject itself — a synthesised sway, bob and breath, weighted to the
 *     top of the frame, so the still reads as someone working with music on;
 *   · a scan head sweeping left→right, igniting whatever it passes over;
 *   · a horizontal roll bar drifting down the frame, like an unsynced CRT;
 *   · the pointer, which acts as a reveal lens — inside its radius the
 *     halftone is brightened, sharpened (a second interlaced pass is drawn)
 *     and pushed outward from the cursor.
 *
 * Deliberately cheap: one 2D context, one offscreen sampling pass per resize,
 * and integer-grid fills — no per-frame `getImageData`, no libraries. Honours
 * `prefers-reduced-motion` by painting a single static frame, and parks the
 * loop when the tab is hidden or the element scrolls out of view.
 */
import { useEffect, useRef } from "react";

/** Phosphor accent, matching `--ph-green`. Kept as raw channels for rgba(). */
const ACCENT = "0, 255, 65";
/** The dimmer phosphor used for low-luminance cells, so shadows stay green. */
const SOFT = "74, 222, 128";

/** Grid pitch in CSS px. Smaller = more detail and more fills per frame. */
const CELL_X = 4;
const CELL_Y = 4;
/** Reveal-lens radius in CSS px. */
const LENS = 150;

export type PhosphorPhotoProps = {
  /** Imported image URL. Anything the browser can decode. */
  src: string;
  /**
   * Describes the photo for assistive tech. The canvas itself is hidden and
   * this is exposed as visually-hidden text, because a halftone of a portrait
   * is decorative detail that a screen reader cannot use.
   */
  alt?: string;
  /** Horizontal focus of the cover-crop, 0 = left edge, 1 = right edge. */
  focusX?: number;
  /** Vertical focus of the cover-crop, 0 = top edge, 1 = bottom edge. */
  focusY?: number;
  /** Overall gain on the phosphor. 1 = as sampled. */
  intensity?: number;
  /**
   * How much the subject appears to move. The source is a still, so the motion
   * is synthesised: a slow sway and bob weighted towards the top of the frame,
   * which reads as someone working with headphones on. 0 turns it off.
   */
  liveliness?: number;
  className?: string;
};

export function PhosphorPhoto({
  src,
  alt,
  focusX = 0.5,
  focusY = 0.4,
  intensity = 1,
  liveliness = 1,
  className = "",
}: PhosphorPhotoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /** Pointer in canvas space; -1 means "no pointer", which idles the lens. */
  const pointer = useRef({ x: -1, y: -1, strength: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    /** Luminance per grid cell, 0…1, row-major. Rebuilt only on resize. */
    let lum = new Float32Array(0);
    let image: HTMLImageElement | null = null;
    let raf = 0;
    let onScreen = true;
    let visible = true;

    /*
     * Resample the photo down to exactly one pixel per grid cell. The browser's
     * own downscaler does the box-filtering for us, so the per-frame loop only
     * ever reads a tiny Float32Array instead of touching image data.
     */
    const sample = () => {
      if (!image || !cols || !rows) return;
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;

      // Cover-crop: fill the grid, keep the source aspect, bias to the focus point.
      const scale = Math.max(cols / image.width, rows / image.height);
      const dw = image.width * scale;
      const dh = image.height * scale;
      octx.drawImage(image, (cols - dw) * focusX, (rows - dh) * focusY, dw, dh);

      const { data } = octx.getImageData(0, 0, cols, rows);
      lum = new Float32Array(cols * rows);
      for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
        // Rec. 601 luma, then a gamma lift so the mid-tones survive the halftone.
        const y =
          (data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114) / 255;
        lum[i] = Math.pow(y, 0.78) * (data[p + 3] / 255);
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / CELL_X);
      rows = Math.ceil(height / CELL_Y);
      sample();
    };

    /**
     * Cheap hash-noise in 0…1. Used for the per-row tear and the dash jitter —
     * `Math.random()` would make every cell shimmer independently and read as
     * static rather than as a picture.
     */
    const noise = (a: number, b: number) => {
      const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    const draw = (time: number) => {
      const t = reduced ? 0 : time / 1000;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      if (lum.length) {
        const p = pointer.current;
        // The scan head runs left to right and wraps, like a tape being read.
        const scanX = reduced
          ? width * 0.62
          : ((t * 210) % (width + 420)) - 210;
        // An unsynced CRT roll, drifting down slowly.
        const rollY = reduced ? -1 : ((t * 90) % (height + 200)) - 100;

        /*
         * The subject is a still photograph, so "alive" has to be synthesised.
         * Two out-of-phase sines per axis give an unrepeating drift rather than
         * a metronome, and the whole thing is weighted towards the top of the
         * frame below — head and shoulders move, hands and desk barely do. It
         * reads as someone working with music on, which is what the frame is.
         */
        const live = reduced ? 0 : liveliness;
        const sway =
          live * (Math.sin(t * 0.83) * 3.6 + Math.sin(t * 1.61 + 1.1) * 1.7);
        const bob =
          live * (Math.sin(t * 1.27 + 0.4) * 2.2 + Math.sin(t * 0.57) * 1.3);
        // A slow breath: the subject swells a hair around its own centre.
        const breath = live * Math.sin(t * 0.72) * 0.006;
        const midX = width * 0.5;
        const midY = height * 0.5;

        for (let r = 0; r < rows; r++) {
          const y = r * CELL_Y;
          /*
           * 1 at the top of the frame, 0 at the bottom, curved so the falloff
           * is quick — the desk and the laptop have to stay planted or the
           * whole picture looks like it is sliding.
           */
          const bodyW = (1 - r / rows) ** 1.7;
          const liveX = sway * bodyW;
          const liveY = bob * bodyW;
          // Whole-row tear: a few rows at a time slip sideways, then settle.
          const tear = reduced
            ? 0
            : noise(r, Math.floor(t * 2)) > 0.985
              ? (noise(r, 7) - 0.5) * 22
              : 0;
          const rollHit =
            rollY < 0 ? 0 : Math.max(0, 1 - Math.abs(y - rollY) / 70);

          for (let c = 0; c < cols; c++) {
            let l = lum[r * cols + c];
            if (l < 0.045) continue;
            l *= intensity;

            const x = c * CELL_X;

            // Scanline wobble — amplitude rides the luminance, so the void is
            // still and only the lit parts of the subject ripple. On top of it
            // sits the sway/bob/breath that keeps the subject moving.
            let dx =
              tear +
              liveX +
              (x - midX) * breath +
              (reduced ? 0 : Math.sin(y * 0.09 + t * 1.7 + c * 0.01) * 3.2 * l);
            let dy = liveY + (y - midY) * breath;
            let alpha = l * 1.02;

            // The scan head ignites whatever it is passing over.
            const scanDist = Math.abs(x - scanX);
            const scanHit = scanDist < 120 ? 1 - scanDist / 120 : 0;
            alpha += scanHit * l * 0.9;

            // The roll bar lifts a horizontal band and smears it sideways.
            if (rollHit > 0) {
              alpha += rollHit * l * 0.55;
              dx += rollHit * 4;
            }

            // Reveal lens: brighten, sharpen and push away from the cursor.
            let lens = 0;
            if (p.x >= 0 || p.strength > 0) {
              const vx = x - p.x;
              const vy = y - p.y;
              const dist = Math.hypot(vx, vy);
              if (dist < LENS) {
                const force = (1 - dist / LENS) ** 1.6 * p.strength;
                lens = force;
                dx += (vx / (dist || 1)) * force * 14;
                dy += (vy / (dist || 1)) * force * 14;
                alpha += force * (0.35 + l * 0.75);
              }
            }

            if (alpha <= 0.05) continue;

            // Interlace: every other row is dimmed, which is what makes the
            // halftone read as scanlines instead of as a dot screen.
            if ((r & 1) === 1) alpha *= 0.62 + lens * 0.35;

            const bright = scanHit > 0.4 || lens > 0.35 || alpha > 0.8;
            ctx.fillStyle = `rgba(${bright ? ACCENT : SOFT}, ${Math.min(alpha, 1)})`;
            // Dash length tracks luminance: highlights become continuous lines,
            // shadows break up into flecks.
            const len = CELL_X * (0.35 + l * 0.9) + lens * 2;
            ctx.fillRect(x + dx, y + dy, len, 1.5);

            // Inside the lens a second, offset pass doubles the sampling
            // density — the picture visibly resolves under the cursor.
            if (lens > 0.18) {
              ctx.fillStyle = `rgba(${ACCENT}, ${Math.min(alpha * lens * 0.8, 1)})`;
              ctx.fillRect(
                x + dx + CELL_X * 0.5,
                y + dy + CELL_Y * 0.5,
                len * 0.6,
                1,
              );
            }
          }
        }

        // The scan head itself: a soft vertical bar of light.
        if (!reduced) {
          const grad = ctx.createLinearGradient(scanX - 80, 0, scanX + 80, 0);
          grad.addColorStop(0, `rgba(${ACCENT}, 0)`);
          grad.addColorStop(0.5, `rgba(${ACCENT}, 0.12)`);
          grad.addColorStop(1, `rgba(${ACCENT}, 0)`);
          ctx.fillStyle = grad;
          ctx.fillRect(scanX - 80, 0, 160, height);
        }

        // A faint bloom under the cursor, so the lens has an edge you can see.
        if (p.strength > 0.02 && p.x >= 0) {
          const bloom = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, LENS);
          bloom.addColorStop(0, `rgba(${ACCENT}, ${0.1 * p.strength})`);
          bloom.addColorStop(1, `rgba(${ACCENT}, 0)`);
          ctx.fillStyle = bloom;
          ctx.fillRect(p.x - LENS, p.y - LENS, LENS * 2, LENS * 2);
        }

        // Pointer decays back to idle so the effect settles after it leaves.
        const ptr = pointer.current;
        if (ptr.x < 0 && ptr.strength > 0)
          ptr.strength = Math.max(0, ptr.strength - 0.05);
      }

      if (onScreen && visible && !reduced) raf = requestAnimationFrame(draw);
    };

    /*
     * Paint one frame synchronously as soon as the bitmap is ready. rAF does
     * not fire in a background tab, so without this the hero is an empty black
     * rectangle until the tab is focused.
     */
    const start = () => {
      resize();
      draw(0);
      if (!reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    };

    const img = new Image();
    img.decoding = "async";
    img.src = src;
    const onLoad = () => {
      image = img;
      start();
    };
    if (img.complete && img.naturalWidth) onLoad();
    else img.addEventListener("load", onLoad, { once: true });

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced || !onScreen) draw(0);
    });
    ro.observe(canvas);

    // Park the loop when the hero is off screen — this is the top of a long page.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen && visible && !reduced) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(draw);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Anything further out than the lens can reach is "no pointer" — this
      // keeps the effect alive while the cursor crosses the copy or the CTAs
      // that sit over the picture, instead of dying the moment one of them
      // swallows the event.
      if (
        x < -LENS ||
        y < -LENS ||
        x > rect.width + LENS ||
        y > rect.height + LENS
      ) {
        pointer.current.x = -1;
        pointer.current.y = -1;
        if (reduced) {
          pointer.current.strength = 0;
          draw(0);
        }
        return;
      }
      pointer.current.x = x;
      pointer.current.y = y;
      pointer.current.strength = 1;
      if (reduced) draw(0);
    };
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible && onScreen && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    };

    /*
     * Listened for on the window, not the canvas. The picture is a background
     * layer with headline copy and buttons stacked over it, and a canvas-only
     * listener would go dead wherever one of those covers it.
     */
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      onScreen = false;
      visible = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      img.removeEventListener("load", onLoad);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [src, focusX, focusY, intensity, liveliness]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`block h-full w-full touch-none ${className}`}
      />
      {alt ? <span className="sr-only">{alt}</span> : null}
    </>
  );
}
