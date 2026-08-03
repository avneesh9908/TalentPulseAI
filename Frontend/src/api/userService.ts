import axiosInstance from "./axiosInstance";
import { buildUrl, config } from "@/lib/config";

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
  resumes: ResumeSummary[];
}

export interface ResumeSection {
  name: string;
  text: string;
}

export interface ResumeDetail {
  id: number;
  file_name: string;
  mime_type: string | null;
  role: string;
  experience: string;
  difficulty: string;
  skills: string[];
  source: string;
  created_at: string | null;
  chunk_count: number;
  sections: ResumeSection[];
  /** The original upload isn't retained, so there is nothing to download. */
  original_file_available: boolean;
}

export interface ResumeDeleteResult {
  deleted_id: number;
  file_name: string;
  was_vector_source: boolean;
  /** False when the vector store couldn't be reached; embeddings may linger. */
  vector_cleanup_ok: boolean;
  vectors_removed: number;
  job_setup_detached: boolean;
  message: string;
}

export const getResumeDetail = async (resumeId: number): Promise<ResumeDetail> => {
  const { data } = await axiosInstance.get<ResumeDetail>(
    buildUrl(config.ENDPOINTS.PROFILE.RESUME, { id: String(resumeId) })
  );
  return data;
};

export const deleteResume = async (resumeId: number): Promise<ResumeDeleteResult> => {
  const { data } = await axiosInstance.delete<ResumeDeleteResult>(
    buildUrl(config.ENDPOINTS.PROFILE.RESUME, { id: String(resumeId) })
  );
  return data;
};

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
