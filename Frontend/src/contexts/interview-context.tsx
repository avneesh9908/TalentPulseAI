/**
 * @file contexts/interview-context.tsx
 * @description Interview flow state management & API integration
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { interviewService } from "@/services/interviewService";
import { authService } from "@/services/authService";
import type { InterviewSetupResponse } from "@/types/api";

interface InterviewContextType {
  // Interview Session State
  interviewId: string | null;
  interviewSetup: InterviewSetupResponse | null;

  // Interview Data
  experience: string | null;
  difficulty: string | null;
  skills: string[];
  selectedRole: string | null;
  profileOption: "existing" | "upload" | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions (local state only)
  saveQuickSetup: (experience: string, difficulty: string, skills: string[]) => void;
  saveRole: (role: string) => void;
  saveProfile: (profileOption: "existing" | "upload") => void;

  // Final submission (single API call)
  submitInterviewSetup: () => Promise<void>;

  // Utilities
  clearError: () => void;
  resetInterview: () => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within InterviewProvider");
  }
  return context;
};

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Interview Session State
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [interviewSetup, setInterviewSetup] = useState<InterviewSetupResponse | null>(null);

  // Interview Data
  const [experience, setExperience] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [profileOption, setProfileOption] = useState<"existing" | "upload" | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Save quick setup data — local state only
   */
  const saveQuickSetup = useCallback(
    (exp: string, diff: string, skillsList: string[]) => {
      setExperience(exp);
      setDifficulty(diff);
      setSkills(skillsList);
      console.log("✅ Quick setup saved to context");
    },
    []
  );

  /**
   * Save selected role — local state only
   */
  const saveRole = useCallback((role: string) => {
    setSelectedRole(role);
    console.log("✅ Role saved to context:", role);
  }, []);

  /**
   * Save profile selection — local state only
   */
  const saveProfile = useCallback((option: "existing" | "upload") => {
    setProfileOption(option);
    console.log("✅ Profile option saved to context:", option);
  }, []);

  /**
   * Submit interview setup — single API call with all collected data
   */
  const submitInterviewSetup = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate all required fields are present
      if (!experience || !difficulty || !selectedRole || !profileOption) {
        throw new Error(
          "Missing required fields. Please complete all steps."
        );
      }

      if (skills.length === 0) {
        throw new Error("Please select at least one skill.");
      }

      // Get user ID
      const userId = authService.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Prepare the unified payload
      const payload = {
        setup_id: 0,
        experience,
        difficulty,
        skills,
        role: selectedRole,
        profile_option: profileOption,
      };

      // Call backend with single unified payload
      const response = await interviewService.setupInterview(payload);

      // Store interview setup data and ID
      setInterviewId(response.interview_id);
      setInterviewSetup(response);

      console.log("✅ Interview setup submitted successfully:", response.interview_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to setup interview";
      setError(message);
      console.error("❌ Setup interview error:", message);
      throw err; // Re-throw so component can handle navigation
    } finally {
      setIsLoading(false);
    }
  }, [experience, difficulty, skills, selectedRole, profileOption]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset interview state (logout or start new)
   */
  const resetInterview = useCallback(() => {
    setInterviewId(null);
    setInterviewSetup(null);
    setExperience(null);
    setDifficulty(null);
    setSkills([]);
    setSelectedRole(null);
    setProfileOption(null);
    setError(null);
  }, []);

  const value: InterviewContextType = {
    interviewId,
    interviewSetup,
    experience,
    difficulty,
    skills,
    selectedRole,
    profileOption,
    isLoading,
    error,
    saveQuickSetup,
    saveRole,
    saveProfile,
    submitInterviewSetup,
    clearError,
    resetInterview,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
