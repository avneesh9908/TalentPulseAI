import axios from "axios";
import { toast } from "react-hot-toast";
import { AUTH_SESSION_INVALID_EVENT } from "@/lib/auth-events";
import { authService } from "@/services/authService";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 30000),
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token") ?? localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url ?? "");
    const isAuthAttempt =
      requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthAttempt) {
      authService.clearClientSession();
      window.dispatchEvent(new Event(AUTH_SESSION_INVALID_EVENT));
      console.warn("[API] Session cleared after 401", { url: requestUrl });
      return Promise.reject(error);
    }

    // A timeout / network drop usually means the free-tier API is cold-starting
    // (spins down when idle, ~50s to wake). Show something actionable instead of
    // the raw "timeout of 30000ms exceeded".
    const isTimeout =
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      /timeout/i.test(error.message ?? "");

    const detail: string = isTimeout
      ? "The server is waking up — this can take up to a minute on the first try. Please try again in a moment."
      : error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

    if (isTimeout) error.message = detail;

    console.error("[API Error]", { status, detail, url: error.config?.url });
    toast.error(detail);

    return Promise.reject(error);
  }
);

export default axiosInstance;
