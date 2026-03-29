/**
 * @file types/api.ts
 * @description Type-safe request/response schemas for all API calls
 */

// ============================================
// AUTH API TYPES
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: UserProfile;
}

// ============================================
// INTERVIEW API TYPES
// ============================================

export interface InterviewStartRequest {
  user_id: string;
  role: string;
  profile_id?: string;
}

export interface InterviewProgress {
  step: number;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface InterviewSubmitRequest {
  answers: Record<string, string | string[] | number | boolean>;
  completed_at: string;
}

export interface InterviewResponse {
  id: string;
  user_id: string;
  role: string;
  status: "in_progress" | "completed" | "failed" | "submitted";
  started_at: string;
  completed_at?: string;
  submitted_at?: string;
  progress: InterviewProgress[];
  results?: Record<string, unknown>;
  score?: number;
}

// ============================================
// PROFILE API TYPES
// ============================================

export interface SkillItem {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  years_of_experience?: number;
  endorsements?: number;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: "resume" | "certificate" | "portfolio" | "other";
  url: string;
  uploaded_at: string;
  size: number;
}

export interface ProfileResponse {
  id: string;
  user: UserProfile;
  bio?: string;
  title?: string;
  company?: string;
  location?: string;
  skills: SkillItem[];
  education: EducationItem[];
  documents: DocumentItem[];
}

export interface ProfileUpdateRequest {
  bio?: string;
  title?: string;
  company?: string;
  location?: string;
}

// ============================================
// ERROR HANDLING TYPES
// ============================================

export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiErrorResponse {
  detail: string | ApiErrorDetail[];
}

export interface ApiError {
  status: number;
  detail: string;
  timestamp: string;
  path?: string;
}

// ============================================
// GENERIC RESPONSE WRAPPER
// ============================================

export interface ApiResponse<T> {
  data?: T;
  status: number;
  message?: string;
  errors?: ApiErrorDetail[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============================================
// UTILITY TYPES
// ============================================

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}
