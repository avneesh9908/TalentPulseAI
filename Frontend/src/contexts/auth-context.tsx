import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { readAccessTokenFromLoginBody } from "@/lib/auth-token";
import { clearInterviewDraft } from "./interview-draft-storage";
import type { UserProfile } from "@/types/api";

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
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [isLoading] = useState(false);
  const navigate = useNavigate();

  const API = "http://127.0.0.1:8000";

// If you want to keep UserLogin schema in backend, change frontend to send JSON

  const login = useCallback(async (email: string, password: string) => {
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
    const accessToken = readAccessTokenFromLoginBody(data);
    if (!accessToken) {
      throw new Error(
        "Login succeeded but no access token was returned. Expected access_token (or token) in the JSON body."
      );
    }
    authService.setToken(accessToken);
    const rawUser = (data as { user?: unknown }).user;
    if (rawUser && typeof rawUser === "object" && "email" in (rawUser as object)) {
      authService.setUser(rawUser as UserProfile);
    }
    setToken(accessToken);
    // Redirect to interview flow after login
    navigate("/interview/select-role");
  }, [navigate]);

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
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
  }, [login]);

  const logout = useCallback(() => {
    authService.clearClientSession();
    setToken(null);
    clearInterviewDraft();
    navigate("/auth/login");
  }, [navigate]);

  // React state can lag localStorage by one frame after login or on first paint after refresh.
  // Treat either as a valid session so ProtectedRoute does not redirect to /auth/login incorrectly.
  const resolvedToken = token ?? authService.getToken();

  return (
    <AuthContext.Provider
      value={{
        token: resolvedToken,
        isAuthenticated: Boolean(resolvedToken),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};