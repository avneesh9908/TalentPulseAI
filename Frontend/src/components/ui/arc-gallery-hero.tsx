/**
 * Arc gallery hero — images fan out on a curved arc above/behind hero content.
 * Equivalent of 21st.dev @thanh/arc-gallery-hero-component (registry is
 * auth-gated), rebuilt on our motion tokens. Presentational only.
 */
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { DUR, EASE_OUT, STAGGER } from "@/lib/motion";

interface ArcGalleryHeroProps {
  images: string[];
  /** Hero copy/CTAs rendered under the arc. */
  children?: ReactNode;
  className?: string;
  /** Total fan spread in degrees. */
  spread?: number;
}

export function ArcGalleryHero({
  images,
  children,
  className = "",
  spread = 150,
}: ArcGalleryHeroProps) {
  const count = Math.max(images.length, 1);
  const start = -spread / 2;
  const step = count > 1 ? spread / (count - 1) : 0;

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Arc — sized by viewport width; reserved height prevents CLS. */}
      <div
        className="pointer-events-none relative mx-auto h-[38vw] max-h-[420px] min-h-[220px] w-full"
        aria-hidden="true"
      >
        {images.map((src, i) => {
          const angle = start + step * i;
          return (
            <motion.div
              key={`${src}-${i}`}
              className="absolute left-1/2 top-[92%]"
              style={{ transformOrigin: "center" }}
              initial={{ opacity: 0, scale: 0.6, rotate: angle * 0.6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: DUR.hero,
                ease: EASE_OUT,
                delay: STAGGER * i,
              }}
            >
              {/* rotate → push out along the arc → counter-rotate keeps cards upright-ish */}
              <div
                className="-translate-x-1/2"
                style={{
                  transform: `rotate(${angle}deg) translateY(calc(-1 * clamp(150px, 30vw, 330px))) rotate(${-angle * 0.25}deg)`,
                }}
              >
                <img
                  src={src}
                  alt=""
                  loading={i > 4 ? "lazy" : "eager"}
                  className="aspect-[3/4] w-[clamp(64px,9vw,120px)] rounded-xl border border-slate-200 object-cover shadow-xl dark:border-white/10"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {children ? <div className="relative z-10">{children}</div> : null}
    </section>
  );
}
