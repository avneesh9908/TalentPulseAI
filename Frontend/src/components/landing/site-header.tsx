/**
 * Public site header — shared by the parent landing page and both product
 * pages (Interview / Job Search) so nav, auth CTAs and theming stay in sync.
 * Uses plain <a> (full page loads), matching the pre-existing landing behavior.
 */
import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/use-theme";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export type SiteNavItem = { id: string; label: string; href: string };

interface SiteHeaderProps {
  navItems: SiteNavItem[];
  /** Highlights the product page you are currently on. */
  activeId?: string;
}

export default function SiteHeader({ navItems, activeId }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-canvas/85 backdrop-blur-xl">
      <nav className="wrap flex h-16 items-center justify-between gap-6">
        {/* Brand and nav travel together on the left, as in the Stitch reference —
            the right side is reserved for the two auth actions. */}
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <a href="/" className="shrink-0" aria-label="TalentPulseAI home">
            <Logo />
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  aria-current={activeId === item.id ? "page" : undefined}
                  className={`rounded-md px-3 py-2 text-small transition-colors hover:text-accent-text ${
                    activeId === item.id ? "font-medium text-ink" : "text-ink-muted"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="/auth/login">Log in</a>
          </Button>
          <Button asChild size="sm">
            <a href="/auth/register">Get started</a>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-canvas md:hidden">
          <div className="wrap flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="rounded-md px-2 py-2.5 text-body text-ink-muted hover:bg-surface hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              <Button asChild variant="secondary" block>
                <a href="/auth/login">Log in</a>
              </Button>
              <Button asChild block>
                <a href="/auth/register">Get started</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
