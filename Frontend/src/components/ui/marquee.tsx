/**
 * Infinite marquee band — pure CSS animation (GPU transform), duplicated
 * content for a seamless loop. Decorative: aria-hidden, and freezes under
 * prefers-reduced-motion via motion-reduce:animate-none.
 */
interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  className?: string;
  /** Separator glyph rendered between items. */
  separator?: string;
}

export function Marquee({ items, reverse = false, className = "", separator = "✦" }: MarqueeProps) {
  const row = [...items, ...items]; // duplicate for seamless -50% loop
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
      <div
        className={`flex w-max items-center gap-8 motion-reduce:animate-none ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
      >
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            <span>{item}</span>
            <span className="opacity-50">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
