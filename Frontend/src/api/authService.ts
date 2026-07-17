import axiosInstance from "./axiosInstance";
import { config } from "@/lib/config";
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "@/types/api";

const AUTH = config.ENDPOINTS.AUTH;

// The API is on a free host that spins down when idle; the first request after
// idle triggers a cold start that can take ~50s. Give auth calls a longer
// timeout than the 30s default so that first login/register survives it.
const AUTH_TIMEOUT_MS = 90_000;

export const loginUser = async (payload: LoginRequest): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>(AUTH.LOGIN, payload, {
    timeout: AUTH_TIMEOUT_MS,
  });
  return data;
};

export const registerUser = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>(AUTH.REGISTER, payload, {
    timeout: AUTH_TIMEOUT_MS,
  });
  return data;
};

export const refreshUserToken = async (): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>(AUTH.REFRESH);
  return data;
};

export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post(AUTH.LOGOUT);
};

export const fetchCurrentUser = async (): Promise<UserProfile> => {
  const { data } = await axiosInstance.get<UserProfile>(AUTH.ME);
  return data;
};
