import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import AppSidebar from "@/components/app-sidebar";
import AppTopbar from "@/components/app-topbar";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { DUR, EASE_OUT } from "@/lib/motion";

interface ProtectedLayoutProps {
  children: ReactNode;
  /**
   * `app` is the sidebar shell used by every destination. `focus` is the
   * prototype's minimal wizard bar — no nav, one way out — used by the
   * interview funnel so nothing competes with the step you are on.
   */
  chrome?: "app" | "focus";
}

export default function ProtectedLayout({ children, chrome = "app" }: ProtectedLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  if (chrome === "focus") {
    return (
      <div className="min-h-screen bg-surface">
        <header className="border-b border-border bg-canvas">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <button onClick={() => navigate("/dashboard")} aria-label="Go to dashboard">
              <Logo size="sm" />
            </button>
            <span className="flex items-center gap-1.5 text-small text-ink-subtle">
              <Lock size={14} />
              Secure session
            </span>
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Fixed rail on large screens */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-60 lg:block">
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
              className="fixed inset-0 z-40 bg-overlay/50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: DUR.base, ease: EASE_OUT }}
              className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden"
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

      <div className="lg:pl-60">
        <AppTopbar onOpenMenu={() => setDrawerOpen(true)} />
        <main>{children}</main>
      </div>
    </div>
  );
}
