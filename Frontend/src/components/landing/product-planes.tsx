/**
 * The panel contents for the three hero stacks. The landing set follows the
 * Stitch 3D-hero reference; `/practice` and `/find-jobs` follow the design doc's
 * 4a / 4b visuals.
 *
 * These are miniatures, not live product: they run at fixed small sizes so the
 * whole stage fits the 400×300 stage box. Everything still goes through tokens,
 * so they follow the theme and can't drift from the palette. The wording is the
 * product's real wording, which is the point — the visual has to survive being
 * read. The reference's coding-assessment panel and its EQ/"high-fidelity
 * signal" readouts are deliberately absent: neither exists in the product.
 */
import { Check, CheckCircle2, FileText, Lightbulb } from "lucide-react";
import {
  Bar,
  Chip,
  MatchRow,
  PlaneHeader,
  PlaneTitle,
  Slot,
  type StackPlane,
} from "@/components/landing/product-stack";

/* ── landing hero (doc 3a) ─────────────────────────────────────────────────── */

/**
 * Three planes, one per stage of the product: the resume is parsed, the session
 * is taken, the report comes back. Read back-to-front that is the whole story
 * the headline claims, which is why the order is fixed.
 */

const heroBack = (
  <div className="flex flex-1 flex-col gap-2 p-4">
    <div className="flex items-center gap-1.5 border-b border-border pb-2">
      <FileText size={13} className="text-accent-text" />
      <span className="text-[0.6875rem] font-semibold text-ink">Sections extracted</span>
    </div>
    {["Experience", "Projects", "Skills"].map((section) => (
      <span
        key={section}
        className="flex h-8 items-center justify-between rounded-sm border border-border bg-surface px-3"
      >
        <span className="text-[0.625rem] text-ink-muted">{section}</span>
        <Check size={12} className="text-accent-text" />
      </span>
    ))}
    <span className="mt-auto text-[0.625rem] leading-relaxed text-ink-subtle">
      Personal details removed before indexing
    </span>
  </div>
);

/*
 * The session plane is dark chrome in light mode — a recording surface, the way
 * a terminal is. In dark mode it lifts to `surface` instead, because a slab
 * darker than an already near-black canvas would just be a hole.
 */
const heroMid = (
  <>
    <div className="flex items-center gap-1.5 border-b border-ink-inverse/10 px-3 py-2 dark:border-border">
      <span className="size-2 rounded-full bg-danger" />
      <span className="size-2 rounded-full bg-warning" />
      <span className="size-2 rounded-full bg-success" />
      <span className="ml-2 font-mono text-[0.625rem] tabular-nums text-ink-inverse/60 dark:text-ink-muted">
        live session · 01:42
      </span>
    </div>
    <div className="flex flex-1 flex-col gap-2 p-4">
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-inverse/50 dark:text-ink-subtle">
        Question 3 of 5
      </p>
      <p className="text-[0.6875rem] font-medium leading-snug text-ink-inverse dark:text-ink">
        How would you keep a list of 10,000 rows responsive while filtering as the user types?
      </p>
      <div className="mt-auto flex flex-col gap-1.5 rounded-sm border border-ink-inverse/10 p-3 dark:border-border">
        <span className="block h-1.5 w-[92%] rounded-full bg-ink-inverse/20 dark:bg-surface-strong" />
        <span className="block h-1.5 w-[78%] rounded-full bg-ink-inverse/20 dark:bg-surface-strong" />
        <span className="block h-1.5 w-[54%] rounded-full bg-ink-inverse/10 dark:bg-border" />
        <span className="mt-1 flex items-center gap-1.5 text-[0.625rem] text-ink-inverse/60 dark:text-ink-muted">
          <span className="size-1.5 rounded-full bg-danger" />
          Listening — you can edit this text
        </span>
      </div>
    </div>
  </>
);

/*
 * The dial is a real 88% arc rather than a closed ring: it reads as an
 * instrument instead of a decoration, and drawn in SVG it costs no gradient —
 * `ui/score-ring` uses a conic-gradient, which would be the only gradient
 * element on a page whose audit asserts zero.
 */
const scoreDial = (
  <span className="relative flex size-11 shrink-0 items-center justify-center">
    <svg viewBox="0 0 44 44" aria-hidden="true" className="absolute inset-0 -rotate-90">
      <circle cx="22" cy="22" r="19.5" fill="none" strokeWidth="3" className="stroke-surface-strong" />
      <circle
        cx="22"
        cy="22"
        r="19.5"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="107.8 122.5"
        className="stroke-accent"
      />
    </svg>
    <span className="text-[0.8125rem] font-semibold tabular-nums text-accent-text">88</span>
  </span>
);

const heroFront = (
  <div className="flex flex-1 flex-col gap-3 p-4">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-small font-semibold text-ink">Performance insight</p>
        <p className="text-[0.625rem] text-ink-subtle">Frontend engineer · senior</p>
      </div>
      {scoreDial}
    </div>
    <div className="rounded-md border border-accent/25 bg-accent-soft p-3">
      <span className="flex items-center gap-1.5">
        <CheckCircle2 size={12} className="text-accent-text" />
        <span className="text-[0.6875rem] font-semibold text-ink">Strength</span>
      </span>
      <p className="mt-1 text-[0.625rem] leading-relaxed text-ink-muted">
        Named the trade-off and what you measured after.
      </p>
    </div>
    <div className="rounded-md border border-border bg-surface p-3">
      <span className="flex items-center gap-1.5">
        <Lightbulb size={12} className="text-ink-subtle" />
        <span className="text-[0.6875rem] font-semibold text-ink">What to fix</span>
      </span>
      <p className="mt-1 text-[0.625rem] leading-relaxed text-ink-muted">
        Say what you profiled before changing anything.
      </p>
    </div>
  </div>
);

export const HERO_PLANES: readonly StackPlane[] = [
  { depth: "back", node: heroBack },
  {
    depth: "mid",
    node: heroMid,
    // The inner hairline is the export's "lens" stroke — white at 10% — which is
    // what stops a dark slab reading as a hole cut in the page.
    className:
      "border-ink bg-ink ring-1 ring-inset ring-ink-inverse/10 dark:border-border dark:bg-surface dark:ring-border",
  },
  { depth: "front", node: heroFront, className: "bg-canvas/95 backdrop-blur-sm" },
];

/* ── /practice (doc 4a) ────────────────────────────────────────────────────── */

const practiceBack = (
  <div className="flex flex-1 flex-col gap-2.5 p-3.5">
    <Bar className="h-2 w-24" />
    <div className="grid grid-cols-2 gap-1.5">
      <Slot className="h-10" />
      <Slot className="h-10" />
      <Slot className="h-10" />
      <Slot className="h-10" />
    </div>
    <Slot className="flex-1" />
  </div>
);

const practiceFront = (
  <>
    <PlaneHeader>
      <PlaneTitle>Answer 2 · feedback</PlaneTitle>
    </PlaneHeader>
    <div className="flex flex-1 flex-col gap-3 p-3.5">
      <div className="flex items-center gap-2.5">
        <span className="text-h4 font-semibold tabular-nums text-ink">61</span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-strong">
          <span className="block h-full w-[61%] rounded-full bg-warning" />
        </span>
      </div>
      <p className="text-[0.6875rem] font-medium leading-snug text-ink">
        You described the fix but not how you found it.
      </p>
      <div className="flex flex-col gap-1.5">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
          Signals expected
        </p>
        <div className="flex flex-wrap gap-1">
          <Chip>Profiling</Chip>
          <Chip>Trade-off named</Chip>
          <Chip>Measured after</Chip>
        </div>
      </div>
      <p className="mt-auto rounded-sm border border-border px-2.5 py-2 text-[0.625rem] leading-relaxed text-ink-muted">
        Say what you measured before changing anything.
      </p>
    </div>
  </>
);

export const PRACTICE_PLANES: readonly StackPlane[] = [
  { depth: "back", node: practiceBack },
  { depth: "front", node: practiceFront },
];

/* ── /find-jobs (doc 4b) ───────────────────────────────────────────────────── */

const jobsBack = (
  <div className="flex flex-1 flex-col gap-2 p-3.5">
    <Bar className="h-2 w-[5.25rem]" />
    <div className="flex flex-col gap-1.5">
      <Slot className="h-4" />
      <Slot className="h-4" />
      <Slot className="h-4" />
      <Slot className="h-4" />
    </div>
  </div>
);

const jobsFront = (
  <>
    <PlaneHeader>
      <PlaneTitle>Matches</PlaneTitle>
      <span className="ml-auto text-[0.625rem] text-ink-subtle">Scanned 6 companies · 3 new</span>
    </PlaneHeader>
    <div className="flex flex-1 flex-col gap-2 p-3">
      <MatchRow
        role="Frontend engineer"
        where="Northwind · remote"
        chips={["React", "TypeScript"]}
        score={86}
        strong
      />
      <MatchRow
        role="Platform engineer"
        where="Ravel · hybrid"
        gap="Needs Kubernetes, not on your resume"
        score={61}
      />
    </div>
  </>
);

export const JOBS_PLANES: readonly StackPlane[] = [
  { depth: "back", node: jobsBack },
  { depth: "front", node: jobsFront },
];
