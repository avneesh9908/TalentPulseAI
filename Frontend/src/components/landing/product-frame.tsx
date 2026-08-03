import { cn } from "@/lib/utils";

/**
 * Presents an in-product visual inside a neutral app window so screenshots and
 * illustrations read as "this is the product", the way the reference sites do.
 */
export function ProductFrame({
  src,
  alt,
  caption,
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-canvas shadow-e3",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        {caption && (
          <span className="ml-2 truncate text-overline uppercase text-ink-subtle">{caption}</span>
        )}
      </div>
      <img src={src} alt={alt} loading="lazy" className="block w-full bg-surface object-cover" />
    </figure>
  );
}
