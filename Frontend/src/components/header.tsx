import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/use-theme";
import { useAuth } from "@/contexts/auth-context";
import {
  Menu,
  X,
  Sparkles,
  Zap,
  User,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Bell,
  LayoutDashboard,
} from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Generate avatar initials (placeholder)
  const userInitial = "U";

  // Sample notifications
  const notifications = [
    { id: 1, title: "Interview Completed", message: "Your Python interview has been completed. Score: 85%", time: "2 hours ago" },
    { id: 2, title: "New Feedback", message: "AI mentor provided feedback on your recent interview", time: "5 hours ago" },
    { id: 3, title: "Scheduled Interview", message: "Your React interview is scheduled for tomorrow at 2:00 PM", time: "1 day ago" },
  ];

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

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isDark
          ? "bg-slate-900/95 border-white/10"
          : "bg-white/95 border-slate-200"
      } backdrop-blur-xl`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/50">
              <Sparkles className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold hidden sm:block">
              TalentPulse<span className="text-cyan-500">AI</span>
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Quick Interview Button */}
            <motion.button
              onClick={handleQuickInterview}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-medium transition shadow-lg"
            >
              <Zap size={16} />
              Quick Interview
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center p-2 rounded-lg transition ${
                isDark
                  ? "text-yellow-400 hover:bg-white/10"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={() => setNotificationOpen(!notificationOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center justify-center p-2 rounded-lg transition ${
                  isDark
                    ? "text-slate-300 hover:bg-white/10"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl border max-h-96 overflow-y-auto ${
                      isDark
                        ? "bg-slate-800 border-white/10"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-sm font-bold">Notifications</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {notifications.map((notif) => (
                        <motion.button
                          key={notif.id}
                          whileHover={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }}
                          className="w-full text-left p-4 transition"
                        >
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            {notif.message}
                          </p>
                          <p className={`text-xs mt-2 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                            {notif.time}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isDark
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-slate-100 text-slate-900"
                }`}
              >
                {/* Profile Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {userInitial}
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl border ${
                      isDark
                        ? "bg-slate-800 border-white/10"
                        : "bg-white border-slate-200"
                    } overflow-hidden`}
                  >
                    <div className="p-2">
                      <button
                        onClick={handleDashboard}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                          isDark
                            ? "text-slate-300 hover:bg-white/10 hover:text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </button>

                      <button
                        onClick={handleProfile}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                          isDark
                            ? "text-slate-300 hover:bg-white/10 hover:text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <User size={16} />
                        Profile
                      </button>

                      <div
                        className={`my-2 ${
                          isDark ? "bg-white/10" : "bg-slate-100"
                        } h-px`}
                      />

                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                          isDark
                            ? "text-red-400 hover:bg-red-500/10"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg transition ${
                isDark
                  ? "text-yellow-400 hover:bg-white/10"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* Mobile Notification */}
            <motion.button
              onClick={() => setNotificationOpen(!notificationOpen)}
              whileTap={{ scale: 0.95 }}
              className={`relative p-2 rounded-lg transition ${
                isDark
                  ? "text-slate-300 hover:bg-white/10"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg transition ${
                isDark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100"
              }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`border-t ${isDark ? "border-white/10" : "border-slate-200"}`}
            >
              <div className="px-4 py-4 space-y-2">
                <motion.button
                  onClick={handleQuickInterview}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-medium"
                >
                  <Zap size={16} />
                  Quick Interview
                </motion.button>

                <motion.button
                  onClick={handleDashboard}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isDark
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </motion.button>

                <motion.button
                  onClick={handleProfile}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isDark
                      ? "text-slate-300 hover:bg-white/10"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <User size={16} />
                  Profile
                </motion.button>

                <div
                  className={`my-2 ${
                    isDark ? "bg-white/10" : "bg-slate-100"
                  } h-px`}
                />

                <motion.button
                  onClick={handleLogout}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isDark
                      ? "text-red-400 hover:bg-red-500/10"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <LogOut size={16} />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
