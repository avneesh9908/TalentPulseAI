/**
 * Primary in-app navigation.
 *
 * Information architecture: Dashboard is the shared hub that both sides report
 * into; Interview and Jobs are the two product sides. All three are reachable
 * from anywhere in the app, so this bar is the single place users navigate from
 * (Profile / Logout live in the avatar menu, Landing is the logo).
 *
 * Active state is derived from the route, so shared pages like /profile
 * correctly highlight nothing instead of falsely showing a side as active.
 */
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Home, LayoutDashboard, Mic } from "lucide-react";
import { SPRING } from "@/lib/motion";

const DESTINATIONS = [
  // Home is the public landing page — matched exactly, since every path
  // starts with "/" and would otherwise always look active.
  { id: "home", label: "Home", icon: Home, home: "/", match: ["/"], exact: true },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, home: "/dashboard", match: ["/dashboard"], exact: false },
  { id: "interview", label: "Interview", icon: Mic, home: "/interview/select-role", match: ["/interview"], exact: false },
  { id: "jobs", label: "Jobs", icon: Briefcase, home: "/jobs", match: ["/jobs"], exact: false },
] as const;

const isIn = (dest: (typeof DESTINATIONS)[number], pathname: string) =>
  dest.exact ? pathname === dest.home : dest.match.some((m) => pathname.startsWith(m));

interface AppNavProps {
  className?: string;
  /** Full-width stacked layout for the mobile menu. */
  stacked?: boolean;
  onNavigate?: () => void;
}

export default function AppNav({ className = "", stacked = false, onNavigate }: AppNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Most specific wins: check the non-exact sections before falling back to Home.
  const activeId =
    DESTINATIONS.filter((d) => !d.exact).find((d) => isIn(d, pathname))?.id ??
    DESTINATIONS.filter((d) => d.exact).find((d) => isIn(d, pathname))?.id;

  return (
    <nav
      aria-label="Primary"
      className={`flex gap-1 rounded-full border border-border bg-surface p-1 ${
        stacked ? "w-full" : ""
      } ${className}`}
    >
      {DESTINATIONS.map((dest) => {
        const active = dest.id === activeId;
        const Icon = dest.icon;
        return (
          <button
            key={dest.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => {
              // Already inside this section? don't reset progress within it.
              if (!isIn(dest, pathname)) navigate(dest.home);
              onNavigate?.();
            }}
            className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-small font-medium transition-colors ${
              active ? "text-ink" : "text-ink-subtle hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId="app-nav-pill"
                transition={SPRING}
                className="absolute inset-0 -z-10 rounded-full bg-canvas shadow-e1"
              />
            )}
            <Icon size={15} />
            {dest.label}
          </button>
        );
      })}
    </nav>
  );
}
