/**
 * The bar above the content column in the sidebar shell.
 *
 * The prototype puts a global "Search insights…" field here. There is no search
 * endpoint in this product, so it is left out rather than shipped as dead
 * chrome. Notifications keep the honest empty state the old header had.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppTopbarProps {
  onOpenMenu: () => void;
}

export default function AppTopbar({ onOpenMenu }: AppTopbarProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
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
          pill
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
                className="absolute right-0 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-canvas shadow-e3"
              >
                <div className="border-b border-border px-4 py-3">
                  <p className="text-small font-medium text-ink">Notifications</p>
                </div>
                {/* Nothing writes notifications yet — say so rather than invent them. */}
                <p className="px-4 py-6 text-center text-small text-ink-subtle">
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
