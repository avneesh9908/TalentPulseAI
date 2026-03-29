/**
 * @file contexts/interview-context.tsx
 * @description Interview flow state management & API integration
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { interviewService } from "@/services/interviewService";
import { authService } from "@/services/authService";
import type { InterviewResponse } from "@/types/api";

interface InterviewContextType {
  // Interview Session State
  interviewId: string | null;
  interview: InterviewResponse | null;
  
  // Interview Data
  experience: string | null;
  difficulty: string | null;
  skills: string[];
  selectedRole: string | null;
  profileOption: "existing" | "upload" | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startInterview: () => Promise<void>;
  saveQuickSetup: (experience: string, difficulty: string, skills: string[]) => Promise<void>;
  saveRole: (role: string) => Promise<void>;
  saveProfile: (profileOption: "existing" | "upload") => Promise<void>;
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
  const [interview, setInterview] = useState<InterviewResponse | null>(null);

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
   * Start a new interview session
   */
  const startInterview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = authService.getUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Call backend to create interview session
      const newInterview = await interviewService.startInterview({
        user_id: userId,
        role: selectedRole || "general",
      });

      setInterviewId(newInterview.id);
      setInterview(newInterview);

      console.log("✅ Interview started:", newInterview.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start interview";
      setError(message);
      console.error("❌ Start interview error:", message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole]);

  /**
   * Save quick setup data (experience, difficulty, skills)
   */
  const saveQuickSetup = useCallback(
    async (exp: string, diff: string, skillsList: string[]) => {
      try {
        setIsLoading(true);
        setError(null);

        // Update local state
        setExperience(exp);
        setDifficulty(diff);
        setSkills(skillsList);

        // Save to backend if interview exists
        if (interviewId) {
          await interviewService.saveProgress(interviewId, {
            step: 1,
            experience: exp,
            difficulty: diff,
            skills: skillsList,
            timestamp: new Date().toISOString(),
          });
          console.log("✅ Quick setup saved");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save quick setup";
        setError(message);
        console.error("❌ Save quick setup error:", message);
      } finally {
        setIsLoading(false);
      }
    },
    [interviewId]
  );

  /**
   * Save selected role
   */
  const saveRole = useCallback(
    async (role: string) => {
      try {
        setIsLoading(true);
        setError(null);

        setSelectedRole(role);

        // Save to backend if interview exists
        if (interviewId) {
          await interviewService.saveProgress(interviewId, {
            step: 2,
            role: role,
            timestamp: new Date().toISOString(),
          });
          console.log("✅ Role saved:", role);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save role";
        setError(message);
        console.error("❌ Save role error:", message);
      } finally {
        setIsLoading(false);
      }
    },
    [interviewId]
  );

  /**
   * Save profile selection
   */
  const saveProfile = useCallback(
    async (option: "existing" | "upload") => {
      try {
        setIsLoading(true);
        setError(null);

        setProfileOption(option);

        // Save to backend if interview exists
        if (interviewId) {
          await interviewService.saveProgress(interviewId, {
            step: 3,
            profile_option: option,
            timestamp: new Date().toISOString(),
          });
          console.log("✅ Profile option saved:", option);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save profile";
        setError(message);
        console.error("❌ Save profile error:", message);
      } finally {
        setIsLoading(false);
      }
    },
    [interviewId]
  );

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
    setInterview(null);
    setExperience(null);
    setDifficulty(null);
    setSkills([]);
    setSelectedRole(null);
    setProfileOption(null);
    setError(null);
  }, []);

  const value: InterviewContextType = {
    interviewId,
    interview,
    experience,
    difficulty,
    skills,
    selectedRole,
    profileOption,
    isLoading,
    error,
    startInterview,
    saveQuickSetup,
    saveRole,
    saveProfile,
    clearError,
    resetInterview,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
