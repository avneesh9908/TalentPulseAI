/**
 * Primary in-app navigation, as a left rail.
 *
 * Replaces the top `AppNav` pill bar (2026-07-17 IA) with a left sidebar. The
 * information architecture is unchanged — Dashboard is the shared hub,
 * Interviews and Jobs are the two product sides, Profile is the account page.
 * Active state is still derived from the route, so a shared page highlights the
 * section it belongs to and nothing else.
 *
 * Phosphor-terminal design (2026-09-24): black rail, hairline border, mono nav
 * labels, and an accent marker + surface for the active item rather than a
 * filled slab — the accent stays reserved for state. Every screen is dark-only,
 * so there is no theme toggle (backup:
 * docs/backup/app-sidebar-before-phosphor.tsx.txt).
 */
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, LayoutDashboard, LogOut, Mic, User } from "lucide-react";
import { SPRING } from "@/lib/motion";
import { useAuth } from "@/contexts/use-auth";
import { authService } from "@/services/authService";

const DESTINATIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, home: "/dashboard", match: ["/dashboard"] },
  { id: "interview", label: "Interviews", icon: Mic, home: "/interview/select-role", match: ["/interview"] },
  { id: "jobs", label: "Jobs", icon: Briefcase, home: "/jobs", match: ["/jobs"] },
  { id: "profile", label: "Profile", icon: User, home: "/profile", match: ["/profile"] },
] as const;

const isIn = (dest: (typeof DESTINATIONS)[number], pathname: string) =>
  dest.match.some((m) => pathname.startsWith(m));

interface AppSidebarProps {
  /** Called after a navigation — the mobile drawer uses it to close itself. */
  onNavigate?: () => void;
}

export default function AppSidebar({ onNavigate }: AppSidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const currentUser = authService.getCurrentUserFromStorage();
  const displayName = currentUser?.full_name ?? currentUser?.email ?? "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  const activeId = DESTINATIONS.find((d) => isIn(d, pathname))?.id;

  const go = (dest: (typeof DESTINATIONS)[number]) => {
    // Already inside this section? don't reset progress within it.
    if (!isIn(dest, pathname)) navigate(dest.home);
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col border-r border-ph-line bg-black font-st-body">
      {/* Brand block */}
      <button
        onClick={() => {
          navigate("/dashboard");
          onNavigate?.();
        }}
        className="flex items-center gap-2.5 border-b border-ph-line px-4 py-4 text-left"
        aria-label="Go to dashboard"
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full bg-ph-green shadow-[0_0_10px_#00ff41]"
        />
        <span className="min-w-0">
          <span className="block truncate font-st-display text-[15px] font-semibold leading-tight tracking-[-0.01em] text-ph-ink">
            TalentPulseAI
          </span>
          <span className="mt-0.5 block truncate font-ph-mono text-[10px] uppercase tracking-[0.18em] text-ph-ink-soft">
            Developer workspace
          </span>
        </span>
      </button>

      <nav aria-label="Primary" className="flex-1 space-y-1 p-2">
        {DESTINATIONS.map((dest) => {
          const active = dest.id === activeId;
          const Icon = dest.icon;
          return (
            <button
              key={dest.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => go(dest)}
              className={`relative flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 font-ph-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                active ? "text-ph-green" : "text-ph-ink-soft hover:bg-ph-surface hover:text-ph-ink"
              }`}
            >
              {/* Active = a surface plus a 2px accent marker on the left edge.
                  The layer sits at auto z-index with the label lifted above it —
                  a negative z-index risks being painted over by the rail's own
                  background, which paints after negative layers. */}
              {active && (
                <motion.span
                  layoutId="app-sidebar-pill"
                  transition={SPRING}
                  className="absolute inset-0 rounded-[10px] border border-ph-line-strong bg-ph-surface"
                >
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-ph-green shadow-[0_0_8px_#00ff41]" />
                </motion.span>
              )}
              <Icon size={15} className="relative" />
              <span className="relative">{dest.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Account group, pinned to the bottom */}
      <div className="space-y-1 border-t border-ph-line p-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ph-green/30 bg-ph-green/[0.06] font-ph-mono text-[12px] text-ph-green">
            {userInitial}
          </span>
          <span className="min-w-0 truncate text-[13px] text-ph-ink-muted" title={displayName}>
            {displayName}
          </span>
        </div>
        <button
          onClick={() => {
            logout();
            onNavigate?.();
          }}
          className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 font-ph-mono text-[11px] uppercase tracking-[0.14em] text-ph-ink-soft transition-colors hover:bg-ph-surface hover:text-ph-ink"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </div>
  );
}
