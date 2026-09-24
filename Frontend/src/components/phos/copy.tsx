/**
 * Copy affordances for the phosphor-terminal design (2026-09-24).
 *
 * Two shapes: a wide `CopyBar` for a single headline value, and a boxed
 * `CopyBlock` for a value quoted inside a card's instructions. Both fall back
 * silently when the clipboard is unavailable (insecure origin, denied
 * permission) — the value stays on screen and selectable, which is why it is
 * rendered as real monospace text rather than hidden behind the button.
 */
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PH_MONO, PH_MONO_RAW } from "./tokens";

function useCopy(value: string) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard access — the value is still on screen and selectable.
    }
  };

  return { copied, copy };
}

/** The small mono pill both shapes use. */
function CopyPill({
  copied,
  onCopy,
  label,
  className,
}: {
  copied: boolean;
  onCopy: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors duration-200",
        PH_MONO,
        copied
          ? "border-ph-green bg-ph-green/10 text-ph-green"
          : "border-ph-line-strong text-ph-ink-soft hover:border-ph-green hover:text-ph-green",
        className
      )}
    >
      {copied ? (
        <>
          <Check size={12} strokeWidth={2.5} aria-hidden="true" />
          Copied
        </>
      ) : (
        "Copy"
      )}
    </button>
  );
}

/**
 * A single headline value on its own bar: dim mono label, the value in
 * phosphor, copy at the right. Use it where one identifier is the point of the
 * block.
 */
export function CopyBar({
  label,
  value,
  copyLabel,
  className,
}: {
  label: string;
  value: string;
  /** Announced by the button, e.g. "Copy user id". */
  copyLabel: string;
  className?: string;
}) {
  const { copied, copy } = useCopy(value);
  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-[12px] border border-ph-green/35 bg-black px-4 py-3.5 transition-colors duration-200 hover:border-ph-green/60 sm:px-5",
        className
      )}
    >
      <span className={cn(PH_MONO, "hidden shrink-0 text-ph-ink-soft sm:inline")}>{label}</span>
      <span className={cn(PH_MONO_RAW, "min-w-0 flex-1 truncate text-[13px] text-ph-green")}>
        {value}
      </span>
      <CopyPill copied={copied} onCopy={copy} label={copyLabel} />
    </div>
  );
}

/**
 * A value quoted inside a card: boxed, wrapping, copy pill floated to the
 * right of the first line.
 */
export function CopyBlock({
  value,
  copyLabel,
  className,
}: {
  value: string;
  copyLabel: string;
  className?: string;
}) {
  const { copied, copy } = useCopy(value);
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-[10px] border border-ph-line bg-black p-2.5 transition-colors duration-200 hover:border-ph-line-bright",
        className
      )}
    >
      <code className={cn(PH_MONO_RAW, "min-w-0 flex-1 break-all text-[12px] text-ph-green")}>
        {value}
      </code>
      <CopyPill copied={copied} onCopy={copy} label={copyLabel} />
    </div>
  );
}
