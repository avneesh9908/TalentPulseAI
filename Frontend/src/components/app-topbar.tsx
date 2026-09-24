/**
 * The bar above the content column in the sidebar shell.
 *
 * The prototype puts a global "Search insights…" field here. There is no search
 * endpoint in this product, so it is left out rather than shipped as dead
 * chrome. Notifications keep the honest empty state the old header had.
 *
 * Phosphor-terminal design (2026-09-24); backup:
 * docs/backup/app-topbar-before-phosphor.tsx.txt.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, Zap } from "lucide-react";
import { Button } from "@/components/phos/controls";

interface AppTopbarProps {
  onOpenMenu: () => void;
}

export default function AppTopbar({ onOpenMenu }: AppTopbarProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-ph-line bg-black/85 font-st-body backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-4 sm:px-5 lg:px-6">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="lg:hidden"
        >
          <Menu />
        </Button>

        <div className="flex-1" />

        <Button
          onClick={() => navigate("/interview/select-role")}
          size="sm"
          className="hidden sm:inline-flex"
        >
          <Zap /> Quick interview
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setNotificationOpen((open) => !open)}
            aria-expanded={notificationOpen}
            aria-label="Notifications"
          >
            <Bell />
          </Button>

          <AnimatePresence>
            {notificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 mt-2 w-72 overflow-hidden rounded-[16px] border border-ph-line-strong bg-black shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85)]"
              >
                <div className="border-b border-ph-line px-4 py-3">
                  <p className="font-ph-mono text-[11px] uppercase tracking-[0.18em] text-ph-green">Notifications</p>
                </div>
                {/* Nothing writes notifications yet — say so rather than invent them. */}
                <p className="px-4 py-6 text-center text-[13px] text-ph-ink-soft">
                  You're all caught up.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
