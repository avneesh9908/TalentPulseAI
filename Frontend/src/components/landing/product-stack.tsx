import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The hero product visual: real interface panels layered in CSS perspective.
 *
 * Chosen over an illustration or a rendered image because the depth is genuine —
 * the panels are live DOM at the app's own type sizes and tokens, so they can
 * never drift from the product the way a screenshot does, and they stay crisp at
 * any density.
 *
 * Below `md` the perspective is dropped entirely and only the front panel
 * renders, full width: a 400px stage rotated 20° does not survive a 375px
 * viewport, and a tilted panel is harder to read on the device where the text is
 * already smallest. The stage reserves its height at every size so nothing
 * reflows as the section paints.
 */

type Depth = "back" | "mid" | "front";

/** Presets from the design doc's 3a stack — the stage itself carries the tilt. */
const depthStyle: Record<Depth, string> = {
  back: "[transform:translateZ(-70px)_translate(46px,52px)] opacity-70 shadow-e4",
  mid: "[transform:translateZ(-30px)_translate(24px,26px)] opacity-90 shadow-e4",
  front: "shadow-e5",
};

/**
 * The `layered` arrangement: the stage stays square to the reader and each plane
 * earns its depth from Z alone, so the stack reads as one object seen head-on
 * and the panel behind the front one is still legible. The tilt appears only on
 * hover, which is what keeps the resting state calm enough to read.
 *
 * The ladder is anchored at Z=0 on the FRONT plane rather than pushing it toward
 * the reader: perspective scales anything with positive Z, and a scaled plane
 * rasterises its text then resizes it, which reads as slightly soft. Front at 0
 * renders 1:1 and stays crisp; the planes behind it recede instead, so the
 * composition — front largest, back smallest — is unchanged.
 */
const layeredStyle: Record<Depth, string> = {
  back:
    "[transform:translateZ(-120px)_translate(52px,-44px)] opacity-60 shadow-e2 " +
    "motion-safe:group-hover:[transform:translateZ(-140px)_translate(66px,-56px)_rotateX(10deg)_rotateY(-15deg)] motion-safe:group-hover:opacity-40",
  mid:
    "[transform:translateZ(-60px)_translate(26px,-22px)] shadow-e4 " +
    "motion-safe:group-hover:[transform:translateZ(-20px)_translate(33px,-28px)_rotateX(8deg)_rotateY(-15deg)]",
  front:
    "shadow-e5 " +
    "motion-safe:group-hover:[transform:translateZ(40px)_translate(-8px,8px)_rotateX(5deg)_rotateY(-10deg)]",
};

export type StackPlane = {
  depth: Depth;
  node: ReactNode;
  /** Overrides the plane's own surface — the session plane is dark chrome. */
  className?: string;
};

export function ProductStack({
  planes,
  className,
  /** Describes the whole visual for anyone who can't see it. */
  label,
  variant = "tilt",
}: {
  planes: readonly StackPlane[];
  className?: string;
  label: string;
  variant?: "tilt" | "layered";
}) {
  const front = planes.find((p) => p.depth === "front") ?? planes[planes.length - 1];
  const layered = variant === "layered";
  const style = layered ? layeredStyle : depthStyle;

  return (
    <div role="img" aria-label={label} className={className}>
      {/* Mobile: the front panel alone, flat. */}
      <div className="md:hidden">
        <div className="overflow-hidden rounded-lg border border-border bg-canvas shadow-e3">
          {front?.node}
        </div>
      </div>

      {/* md+: the layered stage. */}
      <div
        aria-hidden="true"
        className={cn(
          "hidden items-center justify-center md:flex",
          layered
            ? "min-h-[28rem] [perspective:1200px]"
            : "min-h-[25rem] [perspective-origin:60%_40%] [perspective:1600px]"
        )}
      >
        <div
          className={cn(
            "relative h-[18.75rem] w-[25rem] [transform-style:preserve-3d]",
            layered ? "group" : "[transform:rotateX(12deg)_rotateY(-20deg)_rotateZ(3deg)]"
          )}
        >
          {planes.map((plane) => (
            <div
              key={plane.depth}
              className={cn(
                "absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-border bg-canvas",
                // Compositing the planes on their own layer keeps the type from
                // being re-rasterised mid-transition.
                layered &&
                  "transform-gpu [backface-visibility:hidden] transition-[transform,opacity] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
                style[plane.depth],
                plane.className
              )}
            >
              {plane.node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── the parts each plane is drawn from ────────────────────────────────────── */

/** Titled panel chrome shared by every plane. */
export function PlaneHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-3.5 py-2.5">{children}</div>
  );
}

export function PlaneTitle({ children }: { children: ReactNode }) {
  return <span className="text-small font-semibold text-ink">{children}</span>;
}

/** A grey bar standing in for text on the out-of-focus back panels. */
export function Bar({ className }: { className?: string }) {
  return <span className={cn("block rounded-full bg-surface-strong", className)} />;
}

/** An empty bordered tile — a control the reader isn't meant to read. */
export function Slot({ className }: { className?: string }) {
  return <span className={cn("block rounded-sm border border-border", className)} />;
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-sm bg-surface-strong px-1.5 py-0.5 text-[0.625rem] font-medium text-ink-muted">
      {children}
    </span>
  );
}

/** One ranked opening, as the /find-jobs plane shows it. */
export function MatchRow({
  role,
  where,
  score,
  strong,
  chips,
  gap,
}: {
  role: string;
  where: string;
  score: number;
  /** Draws the score in the accent, for a match worth acting on. */
  strong?: boolean;
  chips?: readonly string[];
  gap?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-border p-2.5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[0.6875rem] font-semibold text-ink">{role}</span>
        <span className="truncate text-[0.625rem] text-ink-subtle">{where}</span>
        {chips && (
          <span className="flex gap-1">
            {chips.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </span>
        )}
        {gap && <span className="text-[0.625rem] text-warning">{gap}</span>}
      </div>
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-sm border-2 text-[0.6875rem] font-semibold tabular-nums",
          strong ? "border-accent text-accent-text" : "border-border text-ink-subtle"
        )}
      >
        {score}
      </span>
    </div>
  );
}
