import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The wordmark. One definition so the header, footer and auth pages can never
 * drift apart again (they previously each drew their own gradient tile).
 */
export function Logo({
  className,
  size = "md",
  showText = true,
}: {
  className?: string;
  size?: "sm" | "md";
  showText?: boolean;
}) {
  const box = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-md bg-accent text-accent-fg shadow-e1",
          box
        )}
      >
        <Activity size={size === "sm" ? 15 : 17} strokeWidth={2.5} />
      </span>
      {/* The wordmark is violet throughout, as in the Stitch export — the old
          ink + accent split read as two words. */}
      {showText && (
        <span className="text-h4 font-semibold tracking-tight text-accent-text">
          TalentPulseAI
        </span>
      )}
    </span>
  );
}
