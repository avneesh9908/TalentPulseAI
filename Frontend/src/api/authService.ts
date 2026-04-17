import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./endpoints";
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "@/types/api";

export const loginUser = async (payload: LoginRequest): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.LOGIN, payload);
  return data;
};

export const registerUser = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.REGISTER, payload);
  return data;
};

export const refreshUserToken = async (): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.REFRESH);
  return data;
};

export const logoutUser = async (): Promise<void> => {
  await axiosInstance.post(API_ENDPOINTS.LOGOUT);
};

export const fetchCurrentUser = async (): Promise<UserProfile> => {
  const { data } = await axiosInstance.get<UserProfile>(API_ENDPOINTS.CURRENT_USER);
  return data;
};
