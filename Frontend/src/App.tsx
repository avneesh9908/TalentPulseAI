import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import ProtectedRoute from "@/app/pages/auth/protected-route";

// Layouts
import AuthLayout from "@/app/pages/auth/layout";

// Pages
import Login from "@/app/pages/auth/login";
import Register from "@/app/pages/auth/register";
import Dashboard from "./app/pages/dashboard/dashboard";
import LandingPage from "@/App/pages/landing";

// ─── Theme Context ────────────────────────────────────────────────
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

// ─── App ──────────────────────────────────────────────────────────
function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    // ⚠️ AuthProvider must be INSIDE BrowserRouter (needs useNavigate)
    <BrowserRouter>
      <AuthProvider>
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
          <Routes>
            {/* LANDING PAGE */}
            <Route path="/" element={<LandingPage />} />

            {/* AUTH ROUTES */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* PROTECTED DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </ThemeContext.Provider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;