import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const API = "http://127.0.0.1:8000";

  useEffect(() => {
    const stored = localStorage.getItem("access_token");
    if (stored) setToken(stored);
    setIsLoading(false);
  }, []);

// If you want to keep UserLogin schema in backend, change frontend to send JSON

  const login = async (email: string, password: string) => {
    // ✅ Send as JSON instead of form data
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },  // Changed to JSON
      body: JSON.stringify({ email, password }),         // Send as JSON
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Invalid email or password");
    }

    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    // Redirect to interview flow after login
    navigate("/interview/quick-setup");
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, email, phone, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed. Try a different email.");
    }

    // Auto login after successful register
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    navigate("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};