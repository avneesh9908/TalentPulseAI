/**
 * Phosphor-terminal primitives (2026-09-24).
 *
 * Original implementations of the layout patterns catalogued in
 * `docs/REFERENCE-TEARDOWN-phosphor.md` (P1–P16): ticker, numbered section
 * heads, bracket-corner cards, chip clouds, stat grids, terminal cards,
 * accordion rows, CTA band. They take TalentPulse's own copy and data — no
 * content from the reference site is carried over.
 *
 * Dark-only by design: the page is black, the accent is the only colour.
 */
import type { ComponentType, ReactNode } from "react";
import { PH_BODY, PH_BODY_SM, PH_CARD, PH_CARD_HOVER, PH_H3, PH_MONO, PH_MONO_RAW } from "./tokens";

type Icon = ComponentType<{ size?: number; className?: string }>;

/* ── P1 · Availability ticker ─────────────────────────────────────────────
   A marquee of short facts. Duplicated once so the -50% translate loops
   seamlessly; pauses on hover/focus so it can actually be read. */
export function Ticker({ items }: { items: string[] }) {
  const run = [...items, ...items];
  return (
    <div
      className="group relative overflow-hidden border-b border-ph-line bg-black"
      aria-label="Product facts"
    >
      <div className="flex w-max animate-marquee items-center py-1.5 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
        {run.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center">
            <span className={`${PH_MONO} px-4 text-ph-green`}>{item}</span>
            <span aria-hidden="true" className="font-ph-mono text-[11px] text-ph-green/40">
              +
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── P4 · Numbered section head ───────────────────────────────────────────
   `01 / EYEBROW` in mono, an oversized headline, and an optional support
   column on the right. */
export function SectionHead({
  index,
  eyebrow,
  title,
  subtitle,
  aside,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-12 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-end">
      <div>
        <p className={`${PH_MONO} mb-6 text-ph-green`}>
          <span className="text-ph-ink-soft">{index}</span>
          <span className="px-2 text-ph-ink-soft">/</span>
          {eyebrow}
        </p>
        <h2 className="font-st-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.028em] text-ph-ink">
          {title}
        </h2>
      </div>
      <div>
        {subtitle ? <p className={`${PH_BODY} max-w-[46ch]`}>{subtitle}</p> : null}
        {aside}
      </div>
    </div>
  );
}

/* ── P15 · Bracket-corner card ────────────────────────────────────────────
   Corners drawn as four L-shaped ticks instead of a full border. */
export function BracketCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const tick = "pointer-events-none absolute h-3 w-3 border-ph-green/45 transition-colors duration-200 group-hover:border-ph-green";
  return (
    <div
      className={`group relative border border-ph-line bg-ph-surface p-6 ${PH_CARD_HOVER} ${className}`}
    >
      <span aria-hidden="true" className={`${tick} left-[-1px] top-[-1px] border-l border-t`} />
      <span aria-hidden="true" className={`${tick} right-[-1px] top-[-1px] border-r border-t`} />
      <span aria-hidden="true" className={`${tick} bottom-[-1px] left-[-1px] border-b border-l`} />
      <span aria-hidden="true" className={`${tick} bottom-[-1px] right-[-1px] border-b border-r`} />
      {children}
    </div>
  );
}

/* ── Numbered instruction card ────────────────────────────────────────────
   Icon, a dim mono index beneath it, a display title, then free-form body —
   steps, quoted values, whatever the screen needs. Shares the one card hover. */
export function NumberedCard({
  index,
  icon: CardIcon,
  title,
  children,
  className = "",
}: {
  index: string;
  icon?: Icon;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group flex h-full flex-col rounded-[16px] border border-ph-line bg-ph-surface p-5 ${PH_CARD_HOVER} ${className}`}
    >
      <div className="mb-5">
        {CardIcon && (
          <CardIcon
            size={20}
            className="mb-3 text-ph-green transition-transform duration-200 group-hover:scale-110"
          />
        )}
        <span className={`${PH_MONO_RAW} block text-ph-ink-soft`}>{index}</span>
      </div>
      <h3 className="mb-3 font-st-display text-[19px] font-medium leading-6 tracking-[-0.01em] text-ph-ink">
        {title}
      </h3>
      <div className={`${PH_BODY_SM} flex flex-1 flex-col gap-3`}>{children}</div>
    </div>
  );
}

/* ── P5 · Offer card ──────────────────────────────────────────────────────
   Icon, index, title, body, tag chips, mono link. */
export function OfferCard({
  index,
  icon: CardIcon,
  title,
  desc,
  tags,
  action,
}: {
  index: string;
  icon: Icon;
  title: string;
  desc: string;
  tags?: readonly string[];
  action?: ReactNode;
}) {
  return (
    <div className={`${PH_CARD} group flex h-full flex-col p-6`}>
      <div className="mb-5 flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-ph-green/30 bg-ph-green/[0.06] text-ph-green">
          <CardIcon size={18} />
        </span>
        <span className={`${PH_MONO_RAW} text-ph-ink-soft`}>{index}</span>
      </div>
      <h3 className={`${PH_H3} mb-2 text-ph-ink`}>{title}</h3>
      <p className={`${PH_BODY} flex-1`}>{desc}</p>
      {tags?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-ph-line px-2.5 py-1 font-ph-mono text-[10px] tracking-[0.08em] text-ph-ink-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/* ── P6 · Stat grid ───────────────────────────────────────────────────────
   One bordered rectangle split by hairlines. Values render as dashes until
   they are supplied, which is also the honest empty state. */
export function StatGrid({
  items,
  columns = 4,
}: {
  items: { value: ReactNode; label: string }[];
  columns?: 2 | 3 | 4;
}) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <div className={`grid grid-cols-1 border border-ph-line-strong ${cols}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="border-b border-r border-ph-line px-6 py-7 last:border-b-0 [&:nth-last-child(-n+1)]:border-b-0"
        >
          <p className="tnum font-st-display text-[30px] font-semibold leading-none tracking-[-0.02em] text-ph-ink">
            {item.value ?? <span className="text-ph-ink-soft">———</span>}
          </p>
          <p className={`${PH_MONO_RAW} mt-3 flex items-center gap-2 text-ph-ink-soft`}>
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rotate-45 bg-ph-green" />
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── P8 · Chip cloud ──────────────────────────────────────────────────────*/
export function ChipCloud({ items }: { items: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-ph-line-strong bg-ph-surface px-3.5 py-2 font-ph-mono text-[11px] tracking-[0.06em] text-ph-ink-muted transition-colors duration-200 hover:border-ph-line-bright hover:text-ph-ink"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* ── P10 · Terminal card ──────────────────────────────────────────────────
   Mono header bar with a file name, monospace body. */
export function TerminalCard({
  name,
  children,
  action,
}: {
  name: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-ph-line-strong bg-black">
      <div className="flex items-center justify-between gap-3 border-b border-ph-line px-4 py-2.5">
        <span className={`${PH_MONO_RAW} text-ph-green`}>{name}</span>
        {action}
      </div>
      <div className="px-4 py-4 font-ph-mono text-[12px] leading-[1.7] text-ph-ink-muted">
        {children}
      </div>
    </div>
  );
}

/* ── P3 window frame · a screenshot in a terminal chrome ──────────────────*/
export function WindowFrame({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="overflow-hidden rounded-[16px] border border-ph-line bg-black">
      <figcaption className="flex items-center gap-1.5 border-b border-ph-line px-4 py-2.5">
        <span aria-hidden="true" className="h-2 w-2 rounded-full border border-ph-line-strong" />
        <span aria-hidden="true" className="h-2 w-2 rounded-full border border-ph-line-strong" />
        <span aria-hidden="true" className="h-2 w-2 rounded-full border border-ph-line-strong" />
        <span className={`${PH_MONO} ml-2 truncate text-ph-ink-soft`}>{caption}</span>
      </figcaption>
      {children}
    </figure>
  );
}

/* ── P13 · Glyph band ─────────────────────────────────────────────────────
   Decorative divider: rows of dim monospace glyphs, drifting sideways.
   Deterministic per row so it does not reshuffle on every render. */
const GLYPHS = "01{}[]()<>/\\|+-=*#%$@?:;.,_~^";

function glyphRow(seed: number, length: number) {
  let value = seed * 9301 + 49297;
  let row = "";
  for (let i = 0; i < length; i += 1) {
    value = (value * 9301 + 49297) % 233280;
    row += (value / 233280) > 0.45 ? GLYPHS[Math.floor((value / 233280) * GLYPHS.length)] : " ";
  }
  return row;
}

export function GlyphBand({ rows = 3 }: { rows?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none overflow-hidden py-6 opacity-[0.22]"
    >
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={`whitespace-pre font-ph-mono text-[12px] leading-[1.5] tracking-[0.35em] text-ph-green ${
            i % 2 === 0 ? "animate-marquee" : "animate-marquee-reverse"
          } motion-reduce:animate-none`}
        >
          {glyphRow(i + 1, 220)}
        </div>
      ))}
    </div>
  );
}

/* ── P11 · Accordion row ──────────────────────────────────────────────────*/
export function AccordionRow({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-ph-line last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-st-display text-[17px] font-medium text-ph-ink transition-colors hover:text-ph-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ph-green/70">
        {q}
        <span
          aria-hidden="true"
          className="shrink-0 font-ph-mono text-[18px] leading-none text-ph-green transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className={`${PH_BODY} max-w-[68ch] pb-6 pr-10`}>{a}</p>
    </details>
  );
}

/* ── P12 · Closing CTA band ───────────────────────────────────────────────*/
export function CtaBand({
  index,
  eyebrow,
  title,
  desc,
  children,
  footnote,
}: {
  index: string;
  eyebrow: string;
  title: string;
  desc: string;
  children: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-ph-line-strong bg-ph-surface px-6 py-14 text-center sm:px-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ph-green to-transparent opacity-60"
      />
      <p className={`${PH_MONO} mb-6 text-ph-green`}>
        <span className="text-ph-ink-soft">{index}</span>
        <span className="px-2 text-ph-ink-soft">/</span>
        {eyebrow}
      </p>
      <h2 className="mx-auto mb-4 max-w-3xl font-st-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.028em] text-ph-ink">
        {title}
      </h2>
      <p className={`${PH_BODY} mx-auto mb-10 max-w-2xl`}>{desc}</p>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">{children}</div>
      {footnote ? <div className="mt-8">{footnote}</div> : null}
    </div>
  );
}
