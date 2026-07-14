/**
 * Testimonials grid — staggered reveal cards with quote, author, role.
 * Equivalent of 21st.dev @ravikatiyar/testimonials, on our motion tokens.
 */
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { VIEWPORT, staggerChild, staggerParent } from "@/lib/motion";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

interface TestimonialsProps {
  items: Testimonial[];
  className?: string;
}

export function Testimonials({ items, className = "" }: TestimonialsProps) {
  return (
    <motion.div
      className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={staggerParent()}
    >
      {items.map((t, i) => (
        <motion.figure
          key={`${t.name}-${i}`}
          variants={staggerChild()}
          whileHover={{ y: -6 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-800/90"
        >
          <Quote className="mb-4 text-violet-500 dark:text-violet-400" size={22} aria-hidden="true" />
          <blockquote className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            “{t.quote}”
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-sm font-bold text-white"
              aria-hidden="true"
            >
              {t.name.charAt(0).toUpperCase()}
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                {t.name}
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">{t.role}</span>
            </span>
          </figcaption>
        </motion.figure>
      ))}
    </motion.div>
  );
}
