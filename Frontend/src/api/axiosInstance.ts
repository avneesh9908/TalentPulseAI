import axios from "axios";
import { toast } from "react-hot-toast";

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
    const detail: string =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    // Centralized global error logging
    console.error("[API Error]", { status, detail, url: error.config?.url });
    toast.error(detail);

    return Promise.reject(error);
  }
);

export default axiosInstance;
