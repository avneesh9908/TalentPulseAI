import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/use-theme";
import { useAuth } from "@/contexts/use-auth";
import { Mail, Phone, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { validateName, validateEmail, validatePhone, validatePassword } from "@/lib/validation";

type RegisterField = "name" | "email" | "phone" | "password";

export default function Register() {
  const { isDark, toggleTheme } = useTheme();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterField, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validators: Record<RegisterField, (v: string) => string | null> = {
    name: validateName,
    email: validateEmail,
    phone: validatePhone,
    password: validatePassword,
  };
  const values: Record<RegisterField, string> = { name, email, phone, password };

  const validateOne = (field: RegisterField) => {
    const msg = validators[field](values[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: msg ?? undefined }));
    return msg;
  };
  // Clear a field's error as the user corrects it.
  const clearFieldError = (field: RegisterField) =>
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    const next: Partial<Record<RegisterField, string>> = {};
    (Object.keys(validators) as RegisterField[]).forEach((f) => {
      const msg = validators[f](values[f]);
      if (msg) next[f] = msg;
    });
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      await register(name, email, phone, password);
      // Navigation handled inside auth-context
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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
              Create Account
            </h1>
            <p className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
              Start your interview preparation journey
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

          {/* Form (noValidate: our JS validators own the messages, not the browser) */}
          <form onSubmit={handleRegister} noValidate className="space-y-4">
            {/* Name Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? "text-slate-400" : "text-gray-400"
                  }`}
                  size={18}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
                  onBlur={() => validateOne("name")}
                  aria-invalid={Boolean(fieldErrors.name)}
                  placeholder="John Doe"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl transition
                    ${
                      isDark
                        ? "bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    }
                    border focus:outline-none focus:ring-2
                    ${fieldErrors.name ? "border-red-500 focus:ring-red-500" : "focus:ring-violet-500"}
                  `}
                />
              </div>
              {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
            </div>

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

            {/* Phone Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isDark ? "text-slate-400" : "text-gray-400"
                  }`}
                  size={18}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearFieldError("phone"); }}
                  onBlur={() => validateOne("phone")}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  placeholder="+91 98765 43210"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl transition
                    ${
                      isDark
                        ? "bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    }
                    border focus:outline-none focus:ring-2
                    ${fieldErrors.phone ? "border-red-500 focus:ring-red-500" : "focus:ring-violet-500"}
                  `}
                />
              </div>
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>}
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
              {fieldErrors.password
                ? <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
                : <p className={`mt-1 text-xs ${isDark ? "text-slate-500" : "text-gray-400"}`}>At least 8 characters</p>}
            </div>

            {/* Register Button */}
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
                  Creating account...
                </>
              ) : (
                "Create Account"
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
            Continue with Google
          </motion.button>

          {/* Login Link */}
          <p
            className={`text-center text-sm mt-6 ${isDark ? "text-slate-400" : "text-gray-600"}`}
          >
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="font-semibold bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 transition"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}