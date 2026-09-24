/**
 * Public site header on the phosphor-terminal design (2026-09-24).
 *
 * Carries exactly the links and auth actions of the retired `stitch-site-header.tsx` — only
 * the skin changes. Layout follows pattern P2 of
 * `docs/REFERENCE-TEARDOWN-phosphor.md`: a ticker strip on top, then wordmark
 * left / centred text nav / auth cluster right on a blurred black bar, with a
 * short accent underline marking the current page. Dark-only, so no theme
 * toggle.
 */
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Ticker } from "@/components/phos";
import { PH_MONO, PH_MONO_RAW } from "@/components/phos/tokens";

/** One entry in the public site nav. Lives here now that the pre-phosphor
 *  `site-header.tsx` it used to come from has been deleted. */
export type SiteNavItem = { id: string; label: string; href: string };

interface PhosSiteHeaderProps {
  navItems: SiteNavItem[];
  /** Highlights the product page you are currently on. */
  activeId?: string;
  /** Short facts for the top strip — each one must be something the page claims. */
  tickerItems: string[];
}

export default function PhosSiteHeader({ navItems, activeId, tickerItems }: PhosSiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full font-st-body">
      <Ticker items={tickerItems} />

      <nav className="border-b border-ph-line bg-black/85 backdrop-blur-md">
        <div className="ph-wrap flex h-16 items-center justify-between gap-6">
          <a href="/" aria-label="TalentPulseAI home" className="group flex shrink-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-ph-green shadow-[0_0_10px_#00ff41] transition-transform group-hover:scale-125"
            />
            <span className="font-st-display text-[17px] font-semibold tracking-[-0.01em] text-ph-ink">
              talentpulse<span className="text-ph-green">.ai</span>
            </span>
          </a>

          <ul className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  aria-current={activeId === item.id ? "page" : undefined}
                  className={`relative py-2 text-[14px] transition-colors hover:text-ph-ink ${
                    activeId === item.id ? "text-ph-ink" : "text-ph-ink-soft"
                  }`}
                >
                  {item.label}
                  {activeId === item.id ? (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-0.5 left-0 h-px w-full bg-ph-green shadow-[0_0_8px_#00ff41]"
                    />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-4 md:flex">
            <a
              href="/auth/login"
              className={`${PH_MONO_RAW} uppercase tracking-[0.16em] text-ph-ink-soft transition-colors hover:text-ph-ink`}
            >
              Log in
            </a>
            <a
              href="/auth/register"
              className="rounded-[10px] bg-ph-ink px-4 py-2 text-[13px] font-semibold text-black transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,255,65,0.35)]"
            >
              Get started
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-ph-line text-ph-ink-soft transition-colors hover:border-ph-line-bright hover:text-ph-ink md:hidden"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-b border-ph-line bg-black/95 backdrop-blur-md md:hidden">
          <div className="ph-wrap flex flex-col py-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-ph-line py-3 text-[14px] text-ph-ink-muted transition-colors hover:text-ph-green"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="/auth/login"
                className={`${PH_MONO} rounded-[10px] border border-ph-line-strong py-3 text-center text-ph-ink`}
              >
                Log in
              </a>
              <a
                href="/auth/register"
                className="rounded-[10px] bg-ph-ink py-3 text-center text-[14px] font-semibold text-black"
              >
                Get started
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
