/**
 * @file config.ts
 * @description Centralized configuration for API endpoints and environment variables
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "30000");

export const config = {
  API_BASE_URL,
  API_TIMEOUT,
  
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      REFRESH: "/auth/refresh",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
    },
    
    // Interview management endpoints
    INTERVIEW: {
      SETUP: "/interview/setup",     // NEW: Unified setup endpoint (combines 3 steps)
      RESUME_INDEX: "/interview/resume/index",
      CONTEXT_RETRIEVE: "/interview/context/retrieve",
      START: "/interview/start",
      SAVE: "/interview/:id/progress",
      GET: "/interview/:id",
      LIST: "/interview/list",
      SUBMIT: "/interview/:id/submit",
      RESULTS: "/interview/:id/results",
    },
    
    // User profile endpoints
    PROFILE: {
      GET: "/user/profile",
      UPDATE: "/user/profile/update",
      UPLOAD_FILE: "/user/profile/upload",
    },
    
    // Skills management
    SKILLS: {
      LIST: "/user/skills",
      ADD: "/user/skills/add",
      UPDATE: "/user/skills/:id",
      DELETE: "/user/skills/:id",
    },
    
    // Education endpoints
    EDUCATION: {
      LIST: "/user/education",
      ADD: "/user/education/add",
      UPDATE: "/user/education/:id",
      DELETE: "/user/education/:id",
    },
    
    // Document upload for interview
    DOCUMENTS: {
      UPLOAD: "/documents/upload",
      GET: "/documents/:id",
      DELETE: "/documents/:id",
    },
  },
} as const;

export type Config = typeof config;

// Helper to build endpoint URLs with path parameters
export const buildUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = endpoint;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  return url;
};
