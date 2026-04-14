/**
 * @file contexts/interview-provider.tsx
 * @description Interview flow state management & API integration
 */

import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { interviewService } from "@/services/interviewService";
import { authService } from "@/services/authService";
import type { InterviewSetupResponse } from "@/types/api";
import { InterviewContext, type InterviewContextType } from "./interview-context";
import {
  loadInterviewDraft,
  patchInterviewDraft,
  clearInterviewDraft,
} from "./interview-draft-storage";

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const initialDraft = loadInterviewDraft();

  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [interviewSetup, setInterviewSetup] = useState<InterviewSetupResponse | null>(null);

  const [experience, setExperience] = useState<string | null>(initialDraft.experience);
  const [difficulty, setDifficulty] = useState<string | null>(initialDraft.difficulty);
  const [skills, setSkills] = useState<string[]>(initialDraft.skills ?? []);
  const [selectedRole, setSelectedRole] = useState<string | null>(initialDraft.selectedRole);
  const [profileOption, setProfileOption] = useState<"existing" | "upload" | null>(
    initialDraft.profileOption
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stale API errors (e.g. "User not authenticated") must not persist across navigations
  // such as login → /interview/select-role; error is only for the current screen.
  useEffect(() => {
    setError(null);
  }, [location.pathname]);

  const saveQuickSetup = useCallback(
    (exp: string, diff: string, skillsList: string[]) => {
      setExperience(exp);
      setDifficulty(diff);
      setSkills(skillsList);
      patchInterviewDraft({
        experience: exp,
        difficulty: diff,
        skills: skillsList,
      });
      console.log("Quick setup saved to context");
    },
    []
  );

  const saveRole = useCallback((role: string) => {
    setSelectedRole(role);
    patchInterviewDraft({ selectedRole: role });
    console.log("Role saved to context:", role);
  }, []);

  const saveProfile = useCallback((option: "existing" | "upload") => {
    setProfileOption(option);
    patchInterviewDraft({ profileOption: option });
    console.log("Profile option saved to context:", option);
  }, []);

  const submitInterviewSetup = useCallback(
    async (quickSetup?: {
      experience: string;
      difficulty: string;
      skills: string[];
    }) => {
      try {
        setIsLoading(true);
        setError(null);

        if (quickSetup) {
          setExperience(quickSetup.experience);
          setDifficulty(quickSetup.difficulty);
          setSkills(quickSetup.skills);
          patchInterviewDraft({
            experience: quickSetup.experience,
            difficulty: quickSetup.difficulty,
            skills: quickSetup.skills,
          });
        }

        const draft = loadInterviewDraft();
        const exp = quickSetup?.experience ?? experience ?? draft.experience;
        const diff = quickSetup?.difficulty ?? difficulty ?? draft.difficulty;
        const sk =
          quickSetup?.skills ??
          (skills.length > 0 ? skills : draft.skills);

        const role = selectedRole ?? draft.selectedRole;
        const prof = profileOption ?? draft.profileOption;

        if (!exp || !diff || !role || !prof) {
          throw new Error("Missing required fields. Please complete all steps.");
        }

        if (sk.length === 0) {
          throw new Error("Please select at least one skill.");
        }

        // Login stores access_token but not current_user; getUserId() would be null.
        // Interview API uses Bearer token (see httpClient); no client user id required.
        if (!authService.getToken()) {
          throw new Error("User not authenticated");
        }

        const payload = {
          setup_id: 0,
          experience: exp,
          difficulty: diff,
          skills: sk,
          role,
          profile_option: prof,
        };

        const response = await interviewService.setupInterview(payload);

        setInterviewId(response.interview_id);
        setInterviewSetup(response);

        console.log("Interview setup submitted successfully:", response.interview_id);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to setup interview";
        setError(message);
        console.error("Setup interview error:", message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [experience, difficulty, skills, selectedRole, profileOption]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetInterview = useCallback(() => {
    setInterviewId(null);
    setInterviewSetup(null);
    setExperience(null);
    setDifficulty(null);
    setSkills([]);
    setSelectedRole(null);
    setProfileOption(null);
    setError(null);
    clearInterviewDraft();
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
