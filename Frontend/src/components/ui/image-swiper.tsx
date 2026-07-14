/**
 * Image swiper — drag/swipe carousel with arrows and dots. No embla dep:
 * built on framer-motion drag. Equivalent of 21st.dev @easemize/image-swiper.
 * Autoplay is intentionally not implemented (reduced-motion policy).
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";

export interface SwiperSlide {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageSwiperProps {
  slides: SwiperSlide[];
  className?: string;
}

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

export function ImageSwiper({ slides, className = "" }: ImageSwiperProps) {
  const [index, setIndex] = useState(0);
  const clamp = (i: number) => Math.min(Math.max(i, 0), slides.length - 1);
  const go = (delta: number) => setIndex((i) => clamp(i + delta));

  return (
    <div className={className} role="group" aria-roledescription="carousel">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-white/10">
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1);
            else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1);
          }}
          animate={{ x: `${-index * 100}%` }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
        >
          {slides.map((slide, i) => (
            <figure key={`${slide.src}-${i}`} className="w-full shrink-0 select-none">
              <img
                src={slide.src}
                alt={slide.alt}
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
                className="aspect-video w-full object-cover"
              />
              {slide.caption ? (
                <figcaption className="bg-white/90 p-3 text-center text-sm text-slate-600 backdrop-blur dark:bg-slate-900/90 dark:text-slate-300">
                  {slide.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </motion.div>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-slate-700 shadow-md backdrop-blur transition hover:bg-white disabled:opacity-40 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(1)}
          disabled={index === slides.length - 1}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-slate-700 shadow-md backdrop-blur transition hover:bg-white disabled:opacity-40 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index
                ? "w-6 bg-gradient-to-r from-violet-600 to-cyan-500"
                : "w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
