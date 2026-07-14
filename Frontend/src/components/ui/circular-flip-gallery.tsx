/**
 * Circular flip-card gallery — cards orbit slowly on a ring and flip on
 * hover/focus to reveal their back. Equivalent of 21st.dev
 * @minhxthanh/circular-flip-card-gallery. Falls back to a static flip-card
 * grid below md (a ring needs width) and freezes rotation under reduced motion.
 */
import type { ReactNode } from "react";

export interface FlipCard {
  id: string;
  front: ReactNode;
  back: ReactNode;
}

interface CircularFlipGalleryProps {
  items: FlipCard[];
  className?: string;
  /** Ring radius in px (desktop). */
  radius?: number;
}

function Flip({ item }: { item: FlipCard }) {
  return (
    <div className="group h-56 w-40 [perspective:1000px]" tabIndex={0}>
      <div className="relative h-full w-full transition-transform duration-700 motion-reduce:duration-0 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xl [backface-visibility:hidden] dark:border-white/10 dark:bg-slate-900">
          {item.front}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-600/15 to-cyan-500/15 p-4 text-center shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] backdrop-blur dark:border-violet-500/40 dark:bg-slate-900/90">
          {item.back}
        </div>
      </div>
    </div>
  );
}

export function CircularFlipGallery({ items, className = "", radius = 300 }: CircularFlipGalleryProps) {
  const step = 360 / Math.max(items.length, 1);
  return (
    <div className={className}>
      {/* Desktop: orbiting ring — container spins, cards counter-spin to stay upright */}
      <div className="relative mx-auto hidden md:block" style={{ height: radius * 2 + 260 }}>
        <div className="absolute left-1/2 top-1/2 h-0 w-0 animate-spin-slow motion-reduce:animate-none">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="absolute"
              style={{ transform: `rotate(${step * i}deg) translateX(${radius}px) rotate(${-step * i}deg)` }}
            >
              <div className="-translate-x-1/2 -translate-y-1/2 animate-spin-reverse motion-reduce:animate-none">
                <Flip item={item} />
              </div>
            </div>
          ))}
        </div>
        {/* Ring guide */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-violet-500/20"
          style={{ width: radius * 2, height: radius * 2 }}
          aria-hidden="true"
        />
      </div>

      {/* Mobile: flip-card grid */}
      <div className="grid grid-cols-2 place-items-center gap-4 md:hidden">
        {items.map((item) => (
          <Flip key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
