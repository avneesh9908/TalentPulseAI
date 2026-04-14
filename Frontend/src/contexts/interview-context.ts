/**
 * @file contexts/interview-context.ts
 * @description Interview context instance and types (no JSX — keeps Fast Refresh happy with the hook in use-interview.ts)
 */

import { createContext } from "react";
import type { InterviewSetupResponse } from "@/types/api";

export interface InterviewContextType {
  interviewId: string | null;
  interviewSetup: InterviewSetupResponse | null;

  experience: string | null;
  difficulty: string | null;
  skills: string[];
  selectedRole: string | null;
  profileOption: "existing" | "upload" | null;

  isLoading: boolean;
  error: string | null;

  saveQuickSetup: (experience: string, difficulty: string, skills: string[]) => void;
  saveRole: (role: string) => void;
  saveProfile: (profileOption: "existing" | "upload") => void;

  submitInterviewSetup: (quickSetup?: {
    experience: string;
    difficulty: string;
    skills: string[];
  }) => Promise<void>;

  clearError: () => void;
  resetInterview: () => void;
}

export const InterviewContext = createContext<InterviewContextType | undefined>(undefined);
