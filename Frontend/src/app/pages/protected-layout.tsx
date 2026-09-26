import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import AppSidebar from "@/components/app-sidebar";
import AppTopbar from "@/components/app-topbar";
import { Button } from "@/components/phos/controls";
import { DUR, EASE_OUT } from "@/lib/motion";

interface ProtectedLayoutProps {
  children: ReactNode;
  /**
   * `app` is the sidebar shell, and as of 2026-09-26 every protected route
   * uses it — the interview funnel included, live session and all. `focus`
   * is the minimal bar (no nav, one way out) and currently has NO callers;
   * it is kept because the funnel has moved between the two before. Its
   * header is 56px + a 1px border, the same as the app topbar, which is why
   * screens measuring `calc(100vh-3.5rem-1px)` work under either one.
   */
  chrome?: "app" | "focus";
}

export default function ProtectedLayout({ children, chrome = "app" }: ProtectedLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  if (chrome === "focus") {
    return (
      <div className="min-h-screen bg-ph-bg text-ph-ink">
        <header className="border-b border-ph-line bg-black font-st-body">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
            <button
              onClick={() => navigate("/dashboard")}
              aria-label="Go to dashboard"
              className="group flex items-center gap-2.5"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-ph-green shadow-[0_0_10px_#00ff41] transition-transform group-hover:scale-125"
              />
              <span className="font-st-display text-[15px] font-semibold tracking-[-0.01em] text-ph-ink">
                talentpulse<span className="text-ph-green">.ai</span>
              </span>
            </button>
            <span className="flex items-center gap-1.5 rounded-full border border-ph-green/40 bg-ph-green/[0.06] px-3 py-1 font-ph-mono text-[10px] uppercase tracking-[0.18em] text-ph-green">
              <Lock size={12} />
              Secure session
            </span>
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ph-bg text-ph-ink">
      {/* Fixed rail on large screens */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-56 lg:block">
        <AppSidebar />
      </div>

      {/* Drawer below lg — a 240px rail does not fit a 375px viewport */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.fast }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: DUR.base, ease: EASE_OUT }}
              className="fixed inset-y-0 left-0 z-50 w-56 lg:hidden"
            >
              <AppSidebar onNavigate={() => setDrawerOpen(false)} />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="absolute right-2 top-4"
              >
                <X />
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-56">
        <AppTopbar onOpenMenu={() => setDrawerOpen(true)} />
        <main>{children}</main>
      </div>
    </div>
  );
}
