/**
 * Public site header — shared by the parent landing page and both product
 * pages (Interview / Job Search) so nav, auth CTAs and theming stay in sync.
 * Uses plain <a> (full page loads), matching the pre-existing landing behavior.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Moon, Sparkles, Sun, X } from "lucide-react";
import { LimelightNav, type LimelightNavItem } from "@/components/ui/limelight-nav";
import { useTheme } from "@/contexts/use-theme";

interface SiteHeaderProps {
  navItems: LimelightNavItem[];
}

export default function SiteHeader({ navItems }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      className={`relative z-50 sticky top-0 backdrop-blur-xl border-b ${
        isDark
          ? "bg-slate-950/70 border-white/10 text-white"
          : "bg-white/70 border-slate-200 text-slate-900"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo → parent page */}
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold font-display">
              TalentPulse<span className="text-cyan-500">AI</span>
            </span>
          </motion.a>

          {/* Desktop Menu — limelight nav */}
          <div className="hidden md:block">
            <LimelightNav items={navItems} />
          </div>

          {/* Desktop CTA + Theme toggle */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={`p-2 rounded-lg transition ${
                isDark
                  ? "bg-slate-800 text-yellow-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            <a href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                }`}
              >
                Login
              </motion.button>
            </a>
            <a href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-medium transition shadow-lg"
              >
                Get Started Free
              </motion.button>
            </a>
          </div>

          {/* Mobile right controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className={`p-2 rounded-lg transition ${
                isDark ? "bg-slate-800 text-yellow-300" : "bg-slate-100 text-slate-600"
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className={`p-2 rounded-lg transition ${
                isDark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden mt-4 py-4 border-t ${
              isDark ? "border-white/10" : "border-slate-200"
            }`}
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`transition text-sm font-medium ${
                    isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-violet-600"
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <div
                className={`flex flex-col gap-2 pt-4 border-t ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <a
                  href="/auth/login"
                  className={`px-4 py-2 rounded-lg text-center text-sm font-medium ${
                    isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  Login
                </a>
                <a
                  href="/auth/register"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-center text-sm font-medium"
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
