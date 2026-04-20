import {
  createContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "@/api/authService";
import { useApi } from "@/hooks/useApi";
import { authService } from "@/services/authService";
import { AUTH_SESSION_INVALID_EVENT } from "@/lib/auth-events";
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
export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    const t = authService.getToken();
    if (!t) return null;
    if (!authService.hasValidToken()) {
      authService.clearClientSession();
      return null;
    }
    return t;
  });
  const navigate = useNavigate();
  const { request, loading: isLoading } = useApi();

  useEffect(() => {
    const onSessionInvalid = () => {
      authService.clearClientSession();
      setToken(null);
      clearInterviewDraft();
      navigate("/auth/login", { replace: true });
    };
    window.addEventListener(AUTH_SESSION_INVALID_EVENT, onSessionInvalid);
    return () => window.removeEventListener(AUTH_SESSION_INVALID_EVENT, onSessionInvalid);
  }, [navigate]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await request(loginUser, { email, password });
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
  }, [navigate, request]);

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    await request(registerUser, { full_name: name, email, phone, password });
    // Auto login after successful register
    await login(email, password);
  }, [login, request]);

  const logout = useCallback(() => {
    authService.clearClientSession();
    setToken(null);
    clearInterviewDraft();
    navigate("/auth/login");
  }, [navigate]);

  // React state can lag localStorage by one frame after login or on first paint after refresh.
  const resolvedToken = token ?? authService.getToken();
  // Server rejects expired JWTs; mirror that here so routes match API behavior.
  const isAuthenticated = Boolean(resolvedToken) && authService.hasValidToken();

  return (
    <AuthContext.Provider
      value={{
        token: resolvedToken,
        isAuthenticated,
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