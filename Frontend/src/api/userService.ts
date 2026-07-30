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

export interface InterviewSummary {
  interview_id: string;
  role: string;
  experience: string;
  difficulty: string;
  skills: string[];
  status: string;
  score: number | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface ResumeSummary {
  id: number;
  file_name: string;
  role: string;
  experience: string;
  skills: string[];
  source: string;
  created_at: string | null;
}

export interface ScoreTrendPoint {
  interview_id: string;
  role: string;
  score: number;
  completed_at: string | null;
}

export interface UserOverview {
  user: {
    public_id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
  };
  stats: {
    total_interviews: number;
    completed: number;
    /** Set up but never submitted — not necessarily still being taken. */
    unfinished: number;
    average_score: number | null;
    best_score: number | null;
  };
  /** Newest row of any status — often an abandoned setup. */
  latest_interview: InterviewSummary | null;
  /** Newest scored interview — what a user means by "my last interview". */
  latest_completed: InterviewSummary | null;
  /** Up to 5 newest scored interviews; compare with stats.completed for truncation. */
  recent_completed: InterviewSummary[];
  /** Oldest-first, capped at 12 — for the score chart. */
  score_trend: ScoreTrendPoint[];
  resumes: ResumeSummary[];
}

export const getUserOverview = async (): Promise<UserOverview> => {
  const { data } = await axiosInstance.get<UserOverview>(
    config.ENDPOINTS.PROFILE.OVERVIEW
  );
  return data;
};

export const getUsers = async (): Promise<User[]> => {
  const { data } = await axiosInstance.get<User[]>(config.ENDPOINTS.USERS.LIST);
  return data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await axiosInstance.post<User>(config.ENDPOINTS.USERS.CREATE, payload);
  return data;
};
