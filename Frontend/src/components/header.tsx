import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/contexts/use-theme";
import { useAuth } from "@/contexts/use-auth";
import { authService } from "@/services/authService";
import AppNav from "@/components/app-nav";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, User, LogOut, ChevronDown, Sun, Moon, Bell } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUserFromStorage();
  const displayName = currentUser?.full_name ?? currentUser?.email ?? "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleQuickInterview = () => {
    navigate("/interview/select-role");
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleDashboard = () => {
    navigate("/dashboard");
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const menuItem =
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-small text-ink-muted transition-colors hover:bg-surface hover:text-ink";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-canvas/85 backdrop-blur-xl">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <button onClick={handleDashboard} aria-label="Go to dashboard" className="shrink-0">
          <Logo size="sm" showText={false} />
          <span className="sr-only">TalentPulseAI</span>
        </button>

        {/* Primary nav — Dashboard hub + the two product sides */}
        <div className="hidden md:block">
          <AppNav />
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <Button onClick={handleQuickInterview} size="sm" pill className="hidden lg:inline-flex">
            <Zap /> Quick interview
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun /> : <Moon />}
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

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((open) => !open)}
              aria-expanded={dropdownOpen}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-small font-semibold text-accent-fg">
                {userInitial}
              </span>
              <ChevronDown
                size={14}
                className={`text-ink-subtle transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-canvas p-1.5 shadow-e3"
                >
                  <p className="truncate px-3 py-2 text-small text-ink-subtle">{displayName}</p>
                  <div className="my-1 h-px bg-border" />
                  {/* Destinations live in the primary nav; this menu is account-only. */}
                  <button onClick={handleProfile} className={menuItem}>
                    <User size={15} />
                    Profile
                  </button>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-small text-danger transition-colors hover:bg-danger-soft"
                  >
                    <LogOut size={15} />
                    Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="wrap space-y-2 py-4">
              <AppNav stacked onNavigate={() => setMobileMenuOpen(false)} />
              <Button onClick={handleQuickInterview} block>
                <Zap /> Quick interview
              </Button>
              <button onClick={handleProfile} className={menuItem}>
                <User size={15} />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-small text-danger transition-colors hover:bg-danger-soft"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
