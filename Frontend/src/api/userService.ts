import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "./endpoints";

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
  const { data } = await axiosInstance.get<User[]>(API_ENDPOINTS.USERS);
  return data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await axiosInstance.post<User>(API_ENDPOINTS.CREATE_USER, payload);
  return data;
};
