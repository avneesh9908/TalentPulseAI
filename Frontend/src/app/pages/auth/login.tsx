import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/use-theme";
import { useAuth } from "@/contexts/use-auth";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { validateEmail } from "@/lib/validation";

type LoginField = "email" | "password";

export default function Login() {
  const { isDark, toggleTheme } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<LoginField, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Login only checks presence + basic email shape (never reveals which field
  // is wrong for real credentials — that stays the server's generic 401).
  const validateOne = (field: LoginField) => {
    const msg =
      field === "email" ? validateEmail(email) : password ? null : "Password is required";
    setFieldErrors((prev) => ({ ...prev, [field]: msg ?? undefined }));
    return msg;
  };
  const clearFieldError = (field: LoginField) =>
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    const next: Partial<Record<LoginField, string>> = {};
    const emailMsg = validateEmail(email);
    const pwMsg = password ? null : "Password is required";
    if (emailMsg) next.email = emailMsg;
    if (pwMsg) next.password = pwMsg;
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation is handled inside auth-context
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div
          className={`
          ${
            isDark
              ? "bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10"
              : "bg-white/80 border-gray-200 shadow-lg"
          }
          backdrop-blur-xl border rounded-2xl p-8 relative
        `}
        >
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`absolute top-4 right-4 p-2 rounded-lg transition ${
              isDark
                ? "bg-slate-800/50 hover:bg-slate-700/50 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-primary shadow-lg flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">TP</span>
            </div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight bg-gradient-primary bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
              Login to continue your interview journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Form (noValidate: JS validators own the messages) */}
          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? "text-slate-400" : "text-gray-400"
                  }`}
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                  onBlur={() => validateOne("email")}
                  aria-invalid={Boolean(fieldErrors.email)}
                  placeholder="your@email.com"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl transition
                    ${
                      isDark
                        ? "bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    }
                    border focus:outline-none focus:ring-2
                    ${fieldErrors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-violet-500"}
                  `}
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
            </div>

            {/* Password Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? "text-slate-400" : "text-gray-400"
                  }`}
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
                  onBlur={() => validateOne("password")}
                  aria-invalid={Boolean(fieldErrors.password)}
                  placeholder="••••••••"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl transition
                    ${
                      isDark
                        ? "bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    }
                    border focus:outline-none focus:ring-2
                    ${fieldErrors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-violet-500"}
                  `}
                />
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>}
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-primary text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-gray-300"}`}></div>
            <span className={`text-sm ${isDark ? "text-slate-400" : "text-gray-600"}`}>OR</span>
            <div className={`flex-1 h-px ${isDark ? "bg-white/10" : "bg-gray-300"}`}></div>
          </div>

          {/* Google Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-3
              ${
                isDark
                  ? "bg-slate-800/50 hover:bg-slate-700/50 border-white/10 text-white"
                  : "bg-white hover:bg-gray-50 border-gray-300 text-gray-900"
              }
              border shadow-md
            `}
          >
            <FcGoogle size={24} />
            Login with Google
          </motion.button>

          {/* Register Link */}
          <p
            className={`text-center text-sm mt-6 ${isDark ? "text-slate-400" : "text-gray-600"}`}
          >
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="font-semibold bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 transition"
            >
              Register now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}