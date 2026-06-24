import axiosInstance from "./axiosInstance";
import { config } from "@/lib/config";

export interface User {
  id: string | number;
  name: string;
  email: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
}

export const getUsers = async (): Promise<User[]> => {
  const { data } = await axiosInstance.get<User[]>(config.ENDPOINTS.USERS.LIST);
  return data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await axiosInstance.post<User>(config.ENDPOINTS.USERS.CREATE, payload);
  return data;
};
