/**
 * Phosphor-terminal control primitives (2026-09-24).
 *
 * Drop-in replacements for the retired `components/stitch/*` with the SAME props, so a
 * screen moves onto the phosphor design by swapping its import line and
 * nothing else. Two colours only: black surfaces, phosphor accent, cream text.
 * Mono carries labels; the display face carries headings.
 */
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PH_BODY_SM, PH_BTN_GHOST, PH_BTN_PRIMARY, PH_MONO, PH_MONO_RAW,
} from "./tokens";

// ---- Page shell ----------------------------------------------------------
/** Page root: black canvas, dot grid, one bloom, and the app container. */
export function StPage({
  children,
  narrow = false,
  className,
}: {
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <div className="ph-grid relative min-h-[calc(100vh-3.5rem-1px)] overflow-hidden bg-ph-bg font-st-body text-ph-ink antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-0 h-80 w-[28rem] rounded-full bg-ph-green/[0.06] blur-[130px]"
      />
      <div
        className={cn(
          "relative mx-auto w-full px-4 py-6 sm:px-6 lg:px-8",
          narrow ? "max-w-3xl" : "max-w-[90rem]",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Mono eyebrow, display title, description, optional action cluster. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-ph-green/40 bg-ph-green/[0.06] px-3 py-1">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ph-green shadow-[0_0_6px_#00ff41]" />
            <span className={cn(PH_MONO, "text-ph-green")}>{eyebrow}</span>
          </span>
        )}
        <h1 className="font-st-display text-[26px] font-semibold leading-8 tracking-[-0.025em] text-ph-ink sm:text-[30px] sm:leading-9">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-ph-ink-muted">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}

// ---- Stepper -------------------------------------------------------------
type Step = { id: string; label: string };

/** The wizard rail: hairline track, mono labels, phosphor for the current step. */
export function Stepper({
  steps,
  current,
  className,
}: {
  steps: readonly Step[];
  current: number;
  className?: string;
}) {
  return (
    <ol
      aria-label="Progress"
      className={cn("flex w-full items-center gap-1.5 rounded-full border border-ph-line bg-black p-1.5", className)}
    >
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={step.id}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-2 py-1.5 transition-colors",
              active && "border border-ph-green/40 bg-ph-green/[0.08]"
            )}
          >
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-ph-mono text-[11px]",
                done && "border-ph-green/45 bg-ph-green/10 text-ph-green",
                active && "border-ph-green bg-ph-green/15 text-ph-green",
                !done && !active && "border-ph-line text-ph-ink-soft"
              )}
            >
              {done ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                PH_MONO,
                "hidden truncate sm:inline",
                active ? "text-ph-green" : done ? "text-ph-ink" : "text-ph-ink-soft"
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ---- Panel ---------------------------------------------------------------
const PANEL_PAD = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-8",
} as const;

export function Panel({
  tone = "default",
  padding = "md",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "raised" | "muted";
  padding?: keyof typeof PANEL_PAD;
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] border",
        tone === "muted"
          ? "border-ph-line bg-black/60"
          : tone === "raised"
            ? "border-ph-line-strong bg-ph-surface-2"
            : "border-ph-line bg-ph-surface",
        PANEL_PAD[padding],
        className
      )}
      {...props}
    />
  );
}

export function PanelTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("font-st-display text-[18px] font-medium leading-[26px] text-ph-ink", className)}
      {...props}
    />
  );
}

// ---- Button --------------------------------------------------------------
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon-sm";

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-ph-ink font-semibold text-black hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,255,65,0.35)] active:translate-y-0",
  secondary:
    "border border-ph-line-strong text-ph-ink hover:border-ph-line-bright hover:bg-ph-surface-2",
  ghost: "text-ph-ink-soft hover:bg-ph-surface hover:text-ph-ink",
  danger: "border border-ph-ink/40 bg-ph-ink/[0.08] font-semibold text-ph-ink hover:bg-ph-ink/15",
};

const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: "h-8 px-3 gap-1.5 text-[13px] [&_svg]:size-4",
  md: "h-9 px-4 gap-1.5 text-[13px] [&_svg]:size-4",
  lg: "h-11 px-6 gap-2 text-[14px] [&_svg]:size-[18px]",
  "icon-sm": "h-8 w-8 justify-center [&_svg]:size-4",
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    block?: boolean;
  }
>(function Button(
  { variant = "primary", size = "md", block = false, className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[12px] font-medium transition-[transform,background-color,border-color,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-50",
        BUTTON_VARIANT[variant],
        BUTTON_SIZE[size],
        block && "w-full",
        className
      )}
      {...props}
    />
  );
});

/** Anchor styled as a phosphor CTA — for links that act as buttons. */
export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className={cn(variant === "primary" ? PH_BTN_PRIMARY : PH_BTN_GHOST, className)}>
      {children}
    </a>
  );
}

// ---- Badge ---------------------------------------------------------------
type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";
const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "border-ph-line bg-ph-surface text-ph-ink-soft",
  accent: "border-ph-green/45 bg-ph-green/10 text-ph-green",
  success: "border-ph-green/50 bg-ph-green/10 text-ph-green",
  warning: "border-ph-ink/30 bg-ph-ink/[0.06] text-ph-ink",
  danger: "border-ph-ink/50 bg-ph-ink/10 text-ph-ink",
};

export function Badge({
  tone = "neutral",
  size = "md",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border",
        PH_MONO,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1",
        BADGE_TONE[tone],
        className
      )}
      {...props}
    />
  );
}

// ---- TextInput -----------------------------------------------------------
export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function TextInput({ invalid = false, className, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-11 w-full rounded-[12px] border bg-black px-4 text-[14px] text-ph-ink transition-colors duration-200",
        "placeholder:text-ph-ink-soft/70 focus-visible:outline-none",
        invalid
          ? "border-ph-ink/60 focus-visible:border-ph-ink"
          : "border-ph-line-strong hover:border-ph-line-bright focus-visible:border-ph-green focus-visible:shadow-[0_0_0_3px_rgba(0,255,65,0.16)]",
        className
      )}
      {...props}
    />
  );
});

// ---- Field ---------------------------------------------------------------
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className={cn(PH_MONO, "block text-ph-ink-soft")}>
        {label}
        {required && <span className="ml-1 text-ph-green">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className={cn(PH_MONO_RAW, "text-ph-ink")}>
          {error}
        </p>
      ) : (
        hint && <p className={cn(PH_MONO_RAW, "text-ph-ink-soft")}>{hint}</p>
      )}
    </div>
  );
}

// ---- EmptyState ----------------------------------------------------------
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[16px] border border-dashed border-ph-line-strong bg-ph-surface p-8 text-center",
        className
      )}
    >
      {icon && (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-ph-green/30 bg-ph-green/[0.06] text-ph-green">
          {icon}
        </span>
      )}
      <p className="font-st-display text-[18px] font-medium text-ph-ink">{title}</p>
      {description && <p className={cn(PH_BODY_SM, "mt-1 max-w-md")}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Dismissible error card — same shape as the Stitch one the screens use. */
export function ErrorAlert({
  title,
  message,
  onDismiss,
  className,
}: {
  title: string;
  message: React.ReactNode;
  onDismiss: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-[12px] border border-ph-ink/30 bg-ph-ink/[0.06] p-4",
        className
      )}
    >
      <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 shrink-0 rotate-45 bg-ph-ink" />
      <div className="flex-1">
        <p className={cn(PH_MONO, "text-ph-ink")}>{title}</p>
        <p className={cn(PH_BODY_SM, "mt-1")}>{message}</p>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="font-ph-mono text-ph-ink-soft transition-colors hover:text-ph-ink"
      >
        ×
      </button>
    </div>
  );
}
