/**
 * Image auto-slider — continuously scrolling image band (pure-CSS marquee,
 * pauses on hover, freezes under reduced motion). Equivalent of
 * 21st.dev @waleedkibhen/image-auto-slider.
 */
interface AutoSlide {
  src: string;
  alt?: string;
}

interface ImageAutoSliderProps {
  images: AutoSlide[];
  className?: string;
  /** Tailwind height class applied to every image. */
  heightClass?: string;
}

export function ImageAutoSlider({
  images,
  className = "",
  heightClass = "h-40 md:h-52",
}: ImageAutoSliderProps) {
  const row = [...images, ...images]; // duplicate for seamless -50% loop
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div className="flex w-max items-center gap-6 py-6 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt ?? ""}
            loading="lazy"
            draggable={false}
            className={`${heightClass} w-auto select-none rounded-2xl border border-slate-200 object-cover shadow-lg dark:border-white/10 ${
              i % 2 === 0 ? "rotate-1" : "-rotate-1"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
