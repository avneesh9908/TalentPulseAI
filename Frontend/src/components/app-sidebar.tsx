/**
 * Primary in-app navigation, as a left rail.
 *
 * Replaces the top `AppNav` pill bar (2026-07-17 IA) with the Stitch
 * prototype's sidebar. The information architecture is unchanged — Dashboard is
 * the shared hub, Interviews and Jobs are the two product sides, Profile is the
 * account page. Active state is still derived from the route, so a shared page
 * highlights the section it belongs to and nothing else.
 *
 * The prototype's two sidebars disagreed on both the item list (Schedule /
 * Achievements / Notifications vs Jobs / Profile / Settings) and the active
 * treatment (soft pill vs solid pill). Only the four destinations below exist in
 * this product, and the solid pill is used because it survives dark mode.
 */
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, LayoutDashboard, LogOut, Mic, Moon, Sun, User } from "lucide-react";
import { SPRING } from "@/lib/motion";
import { useTheme } from "@/contexts/use-theme";
import { useAuth } from "@/contexts/use-auth";
import { authService } from "@/services/authService";
import { Logo } from "@/components/brand/logo";

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
  const { isDark, toggleTheme } = useTheme();
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

  const footItem =
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-small font-medium text-ink-muted transition-colors hover:bg-surface-strong hover:text-ink";

  return (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      {/* Brand block */}
      <button
        onClick={() => {
          navigate("/dashboard");
          onNavigate?.();
        }}
        className="flex items-center gap-3 px-4 py-5 text-left"
        aria-label="Go to dashboard"
      >
        <Logo size="sm" showText={false} />
        <span className="min-w-0">
          <span className="block truncate text-h4 font-semibold leading-tight text-ink">
            TalentPulseAI
          </span>
          <span className="block truncate text-overline font-semibold uppercase text-ink-subtle">
            Developer workspace
          </span>
        </span>
      </button>

      <nav aria-label="Primary" className="flex-1 space-y-1 px-3">
        {DESTINATIONS.map((dest) => {
          const active = dest.id === activeId;
          const Icon = dest.icon;
          return (
            <button
              key={dest.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => go(dest)}
              className={`relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-small font-medium transition-colors ${
                active ? "text-accent-fg" : "text-ink-muted hover:bg-surface-strong hover:text-ink"
              }`}
            >
              {/* The pill sits at auto z-index and the label is lifted above it —
                  a negative z-index would risk being painted over by the
                  sidebar's own background, which paints after negative layers. */}
              {active && (
                <motion.span
                  layoutId="app-sidebar-pill"
                  transition={SPRING}
                  className="absolute inset-0 rounded-md bg-accent"
                />
              )}
              <Icon size={18} className="relative" />
              <span className="relative">{dest.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Account group, pinned to the bottom like the prototype's */}
      <div className="space-y-1 border-t border-border p-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-small font-semibold text-accent-fg">
            {userInitial}
          </span>
          <span className="min-w-0 truncate text-small text-ink-muted" title={displayName}>
            {displayName}
          </span>
        </div>
        <button onClick={toggleTheme} className={footItem}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={() => {
            logout();
            onNavigate?.();
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-small font-medium text-danger transition-colors hover:bg-danger-soft"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}
