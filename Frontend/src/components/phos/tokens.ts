/**
 * Phosphor-terminal design tokens as class strings (2026-09-24).
 *
 * The language: true-black page, warm cream text, ONE accent (phosphor green).
 * Every surface and border is the green at low alpha — that is what makes it
 * read as a terminal rather than as a generic dark theme. Mono carries all
 * labels, eyebrows, tags and meta; the display face is only for headlines.
 *
 * Kept out of the .tsx so `react-refresh/only-export-components` stays clean,
 * exactly as the retired `components/stitch/tokens.ts` did.
 */

/** Type ramp */
export const PH_DISPLAY =
  "font-st-display font-semibold tracking-[-0.03em] text-[clamp(2.25rem,5.4vw,4.25rem)] leading-[1.02]";
export const PH_H2 =
  "font-st-display font-semibold tracking-[-0.028em] text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08]";
export const PH_H3 = "font-st-display text-[20px] font-medium leading-7 tracking-[-0.01em]";
export const PH_BODY = "text-[15px] leading-[1.65] text-ph-ink-muted";
export const PH_BODY_SM = "text-[13px] leading-[1.6] text-ph-ink-soft";

/** Mono micro-type — labels, eyebrows, tags, meta. Always uppercase-by-CSS. */
export const PH_MONO = "font-ph-mono text-[11px] leading-[1.2] tracking-[0.18em] uppercase";
export const PH_MONO_SM = "font-ph-mono text-[10px] leading-[1.2] tracking-[0.2em] uppercase";
/** Mono that keeps its own casing — slugs, dates, file names, counts. */
export const PH_MONO_RAW = "font-ph-mono text-[11px] leading-[1.4] tracking-[0.04em]";

/**
 * Surfaces.
 *
 * One hover treatment for every card in the product: the border brightens to
 * the accent's edge, a soft phosphor bloom lifts off the card, and it rises 2px.
 * Applied through these tokens rather than per screen, so the feel is identical
 * everywhere and can be retuned in one place.
 */
export const PH_CARD_HOVER =
  "transition-[transform,border-color,box-shadow,background-color] duration-200 ease-[cubic-bezier(.22,1,.36,1)] " +
  "hover:-translate-y-1 hover:border-ph-green hover:bg-ph-surface-2 " +
  "hover:shadow-[0_0_0_1px_rgba(0,255,65,0.25),0_0_28px_-4px_rgba(0,255,65,0.30),0_18px_44px_-16px_rgba(0,0,0,0.9)]";

export const PH_CARD = `rounded-[16px] border border-ph-line-strong bg-ph-surface ${PH_CARD_HOVER}`;
export const PH_CARD_FLAT = "rounded-[16px] border border-ph-line bg-ph-surface";
export const PH_WELL = "rounded-[16px] border border-ph-line bg-black/60";

/** Controls */
export const PH_BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-[12px] bg-ph-ink px-6 py-3 text-[14px] font-semibold text-black transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(0,255,65,0.35)] active:translate-y-0";
export const PH_BTN_GHOST =
  "inline-flex items-center justify-center gap-2 rounded-[12px] border border-ph-line-strong px-6 py-3 text-[14px] font-medium text-ph-ink transition-colors duration-200 hover:border-ph-line-bright hover:bg-ph-surface-2";
export const PH_BTN_TERM =
  "inline-flex items-center justify-center gap-2 rounded-full border border-ph-green/45 px-4 py-2 font-ph-mono text-[11px] uppercase tracking-[0.16em] text-ph-green transition-colors duration-200 hover:border-ph-green hover:bg-ph-green/10";

/** Chip / tag */
export const PH_CHIP =
  "inline-flex items-center gap-1.5 rounded-full border border-ph-line-strong bg-ph-surface px-3 py-1.5 font-ph-mono text-[11px] tracking-[0.06em] text-ph-ink-muted transition-colors duration-200 hover:border-ph-line-bright hover:text-ph-ink";

/** Link that reads as a terminal command */
export const PH_LINK_MONO =
  "inline-flex items-center gap-1.5 font-ph-mono text-[11px] uppercase tracking-[0.16em] text-ph-green transition-opacity duration-200 hover:opacity-70";
