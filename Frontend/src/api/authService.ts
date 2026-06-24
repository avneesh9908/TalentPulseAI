import axiosInstance from "./axiosInstance";
import { config } from "@/lib/config";
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "@/types/api";

const AUTH = config.ENDPOINTS.AUTH;

export const loginUser = async (payload: LoginRequest): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>(AUTH.LOGIN, payload);
  return data;
};

export const registerUser = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>(AUTH.REGISTER, payload);
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
