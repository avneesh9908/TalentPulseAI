/**
 * Social icons row — spring hover lift with brand-gradient fill.
 * Equivalent of 21st.dev @shadcnspace/social-icon, on our motion tokens.
 */
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { SPRING } from "@/lib/motion";

export interface SocialLink {
  label: string;
  href: string;
  icon: ReactNode;
}

interface SocialIconsProps {
  links: SocialLink[];
  className?: string;
}

export function SocialIcons({ links, className = "" }: SocialIconsProps) {
  return (
    <div className={`flex gap-3 ${className}`}>
      {links.map((link) => (
        <motion.a
          key={link.label}
          href={link.href}
          aria-label={link.label}
          target={link.href.startsWith("http") ? "_blank" : undefined}
          rel={link.href.startsWith("http") ? "noreferrer" : undefined}
          whileHover={{ scale: 1.12, y: -3 }}
          whileTap={{ scale: 0.95 }}
          transition={SPRING}
          className="group flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-gradient-to-br hover:from-violet-600 hover:to-cyan-500 hover:text-white dark:bg-slate-800 dark:text-slate-300"
        >
          {link.icon}
        </motion.a>
      ))}
    </div>
  );
}
