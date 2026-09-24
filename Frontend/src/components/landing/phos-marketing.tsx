/**
 * Phosphor-terminal building blocks for the public product pages (2026-09-24).
 *
 * Same component API as the retired `stitch-marketing.tsx` so `/practice` and `/find-jobs`
 * only swap imports and skins — every page still passes its own copy in.
 * Patterns P2–P15 of `docs/REFERENCE-TEARDOWN-phosphor.md`.
 */
import type { ComponentType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { BracketCard, WindowFrame as PhosWindow } from "@/components/phos";
import {
  PH_BODY, PH_BODY_SM, PH_BTN_GHOST, PH_BTN_PRIMARY, PH_DISPLAY, PH_H3, PH_MONO,
} from "@/components/phos/tokens";

type IconType = ComponentType<{ size?: number; className?: string }>;

/** Page root: black canvas, Geist body, phosphor selection. */
export function PhosPage({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-ph-bg font-st-body text-ph-ink antialiased selection:bg-ph-green selection:text-black">
      {children}
    </div>
  );
}

/** Mono pill above a heading. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ph-green/40 bg-ph-green/[0.06] px-3 py-1.5">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ph-green shadow-[0_0_6px_#00ff41]" />
      <span className={`${PH_MONO} text-ph-green`}>{children}</span>
    </div>
  );
}

/** Link styled as a CTA. `primary` = solid cream, `glass` = hairline outline. */
export function CtaLink({
  href,
  children,
  variant = "primary",
  icon: Icon,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "glass";
  icon?: IconType;
  className?: string;
}) {
  const look = variant === "primary" ? PH_BTN_PRIMARY : PH_BTN_GHOST;
  return (
    <a href={href} className={`${look} w-full sm:w-auto ${className}`}>
      {Icon && <Icon size={18} className={variant === "glass" ? "text-ph-green" : ""} />}
      {children}
      {variant === "primary" && <ArrowRight size={18} />}
    </a>
  );
}

/** Product-page hero: dotted grid, scanlines, left-aligned display type. */
export function PhosHero({
  eyebrow,
  title,
  lead,
  actions,
  note,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead: ReactNode;
  actions: ReactNode;
  note?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="ph-grid relative w-full overflow-hidden border-b border-ph-line pt-[104px]">
      <div aria-hidden="true" className="ph-scan pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-10 h-[480px] w-[480px] rounded-full bg-ph-green/[0.07] blur-[140px]"
      />
      <div className="ph-wrap relative z-10 py-20 md:py-28">
        <Reveal className="max-w-3xl">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className={`${PH_DISPLAY} mb-6 text-balance text-ph-ink`}>{title}</h1>
          <p className={`${PH_BODY} mb-10 max-w-[64ch] text-pretty`}>{lead}</p>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">{actions}</div>
          {note && <p className={`${PH_MONO} mt-8 text-ph-ink-soft`}>{note}</p>}
        </Reveal>
        {children && <div className="mt-16">{children}</div>}
      </div>
    </section>
  );
}

/** A full-width section on the phosphor rhythm. `grid` adds the dot field. */
export function PhosSection({
  id,
  grid = false,
  children,
  className = "",
}: {
  id?: string;
  grid?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`ph-section-tight relative w-full scroll-mt-28 ${grid ? "ph-grid" : ""} ${className}`}
    >
      <div className="ph-wrap relative z-10">{children}</div>
    </section>
  );
}

/**
 * Numbered section head. `index` prints as `01 /` before the eyebrow, matching
 * the landing page; pages that have no running order can leave it out.
 */
export function SectionIntro({
  index,
  eyebrow,
  title,
  subtitle,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <Reveal className="mb-12 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-end">
      <div>
        <p className={`${PH_MONO} mb-5 text-ph-green`}>
          {index && (
            <>
              <span className="text-ph-ink-soft">{index}</span>
              <span className="px-2 text-ph-ink-soft">/</span>
            </>
          )}
          {eyebrow}
        </p>
        <h2 className="font-st-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.028em] text-ph-ink">
          {title}
        </h2>
      </div>
      {subtitle && <p className={`${PH_BODY} max-w-[46ch]`}>{subtitle}</p>}
    </Reveal>
  );
}

/** Bracket-corner feature card. */
export function FeatureCard({
  icon: Icon,
  title,
  desc,
  index = 0,
  children,
}: {
  icon?: IconType;
  title: ReactNode;
  desc?: ReactNode;
  index?: number;
  children?: ReactNode;
}) {
  return (
    <Reveal delay={(index % 3) * 0.06} className="h-full">
      <BracketCard className="flex h-full flex-col">
        {Icon && <Icon size={18} className="mb-5 text-ph-green" />}
        <h3 className={`${PH_H3} mb-2 text-ph-ink`}>{title}</h3>
        {desc && <p className={PH_BODY_SM}>{desc}</p>}
        {children}
      </BracketCard>
    </Reveal>
  );
}

/** Numbered steps on a glowing hairline track. */
export function StepTrack({
  steps,
  columns = 4,
}: {
  steps: readonly { title: ReactNode; desc: ReactNode; icon?: IconType }[];
  columns?: 3 | 4;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-[22px] hidden h-px bg-gradient-to-r from-transparent via-ph-green/45 to-transparent lg:block"
      />
      <ol
        className={`relative grid grid-cols-1 gap-8 md:grid-cols-2 ${
          columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
        }`}
      >
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          return (
            <Reveal key={i} delay={i * 0.06} className="relative">
              <div className="mb-6 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ph-green/40 bg-black font-ph-mono text-[13px] text-ph-green shadow-[0_0_18px_rgba(0,255,65,0.18)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {StepIcon && <StepIcon size={16} className="text-ph-ink-soft" />}
              </div>
              <h3 className={`${PH_H3} mb-2 text-ph-ink`}>{step.title}</h3>
              <p className={PH_BODY_SM}>{step.desc}</p>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * A product screenshot in a terminal window frame. The tour art was drawn for
 * the violet theme, so `.ph-tint` filters it into the green channel — same
 * pixels, one hue.
 */
export function WindowFrame({
  src,
  alt,
  caption,
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <PhosWindow caption={caption ?? ""}>
        <img src={src} alt={alt} loading="lazy" className="ph-tint block w-full object-cover" />
      </PhosWindow>
    </div>
  );
}

/**
 * A panel that states a limit. Two of these sit side by side on both product
 * pages — the place where the product says what it does NOT do.
 */
export function LimitPanel({
  icon: Icon,
  label,
  children,
}: {
  icon?: IconType;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-ph-line-strong bg-ph-surface p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-3 border-b border-ph-line pb-4">
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-ph-green/30 bg-ph-green/[0.06] text-ph-green">
            <Icon size={18} />
          </span>
        )}
        <p className={`${PH_MONO} text-ph-green`}>{label}</p>
      </div>
      <div className={`${PH_BODY_SM} space-y-3`}>{children}</div>
    </div>
  );
}

/** The closing CTA band. */
export function CtaBanner({
  title,
  text,
  actions,
  footnote,
}: {
  title: ReactNode;
  text?: ReactNode;
  actions: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <section className="ph-section-tight w-full">
      <div className="ph-wrap">
        <Reveal className="relative overflow-hidden rounded-[16px] border border-ph-line-strong bg-ph-surface px-6 py-14 text-center sm:px-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ph-green to-transparent opacity-60"
          />
          <h2 className="mx-auto mb-4 max-w-3xl font-st-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.028em] text-ph-ink">
            {title}
          </h2>
          {text && <p className={`${PH_BODY} mx-auto mb-10 max-w-2xl`}>{text}</p>}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">{actions}</div>
          {footnote && <p className={`${PH_BODY_SM} mt-8`}>{footnote}</p>}
        </Reveal>
      </div>
    </section>
  );
}
