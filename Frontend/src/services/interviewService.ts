/**
 * @file services/interviewService.ts
 * @description Interview service - handles interview CRUD operations, progress tracking, and submission
 */

import { httpClient } from "../lib/httpClient";
import { config, buildUrl } from "../lib/config";
import type {
  InterviewResponse,
  InterviewSetupRequest,
  InterviewSetupResponse,
  ResumeIndexRequest,
  ResumeIndexResponse,
  InterviewStartRequest,
  InterviewSubmitRequest,
  ApiError,
} from "../types/api";

class InterviewService {
  /**
   * Setup a new interview with unified payload (combining 3 steps)
   * This is the primary endpoint for initializing an interview session
   */
  async setupInterview(payload: InterviewSetupRequest): Promise<InterviewSetupResponse> {
    try {
      const response = await httpClient.post<InterviewSetupResponse>(
        config.ENDPOINTS.INTERVIEW.SETUP,
        payload
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Failed to setup interview");
    }
  }

  /**
   * Index resume for RAG pipeline (parse + chunk + embed + store)
   */
  async indexResume(payload: ResumeIndexRequest): Promise<ResumeIndexResponse> {
    try {
      const response = await httpClient.post<ResumeIndexResponse>(
        config.ENDPOINTS.INTERVIEW.RESUME_INDEX,
        payload
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Failed to index resume");
    }
  }
  /**
   * Start a new interview session
   */
  async startInterview(payload: InterviewStartRequest): Promise<InterviewResponse> {
    try {
      const response = await httpClient.post<InterviewResponse>(
        config.ENDPOINTS.INTERVIEW.START,
        payload
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Failed to start interview");
    }
  }

  /**
   * Save interview progress (auto-save)
   */
  async saveProgress(
    interviewId: string,
    data: Record<string, unknown>
  ): Promise<InterviewResponse> {
    try {
      const endpoint = buildUrl(config.ENDPOINTS.INTERVIEW.SAVE, { id: interviewId });
      const response = await httpClient.put<InterviewResponse>(endpoint, { data });
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Failed to save interview progress:", apiError.detail);
      // Don't throw - auto-save failures shouldn't interrupt user
      throw error;
    }
  }

  /**
   * Get interview details
   */
  async getInterview(interviewId: string): Promise<InterviewResponse> {
    try {
      const endpoint = buildUrl(config.ENDPOINTS.INTERVIEW.GET, { id: interviewId });
      const response = await httpClient.get<InterviewResponse>(endpoint);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Failed to fetch interview");
    }
  }

  /**
   * List all interviews for current user
   */
  async listInterviews(
    page = 1,
    pageSize = 10
  ): Promise<Record<string, unknown>> {
    try {
      const endpoint = `${config.ENDPOINTS.INTERVIEW.LIST}?page=${page}&page_size=${pageSize}`;
      const response = await httpClient.get<Record<string, unknown>>(endpoint);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Failed to fetch interviews");
    }
  }

  /**
   * Submit completed interview
   */
  async submitInterview(
    interviewId: string,
    payload: InterviewSubmitRequest
  ): Promise<InterviewResponse> {
    try {
      const endpoint = buildUrl(config.ENDPOINTS.INTERVIEW.SUBMIT, { id: interviewId });
      const response = await httpClient.post<InterviewResponse>(endpoint, payload);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Failed to submit interview");
    }
  }

  /**
   * Get interview results
   */
  async getResults(interviewId: string): Promise<Record<string, unknown>> {
    try {
      const endpoint = buildUrl(config.ENDPOINTS.INTERVIEW.RESULTS, { id: interviewId });
      const response = await httpClient.get<Record<string, unknown>>(endpoint);
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Failed to fetch results");
    }
  }

  /**
   * Submit complete interview setup (all 3 steps combined)
   * Collects data from: role, profile, quick-setup and sends to single endpoint
   */
  async submitSetup(setupData: InterviewSetupRequest): Promise<InterviewResponse> {
    try {
      const response = await httpClient.post<InterviewResponse>(
        config.ENDPOINTS.INTERVIEW.SETUP,
        setupData
      );
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Failed to submit interview setup");
    }
  }

  /**
   * Check if interview is still valid (not expired)
   */
  isInterviewValid(interview: InterviewResponse): boolean {
    if (interview.status === "completed" || interview.status === "submitted") {
      return false;
    }

    // Check if interview started more than 24 hours ago
    const startTime = new Date(interview.started_at).getTime();
    const currentTime = new Date().getTime();
    const dayInMs = 24 * 60 * 60 * 1000;

    return currentTime - startTime < dayInMs;
  }

  /**
   * Get time remaining for interview (if there's a time limit)
   */
  getTimeRemaining(interview: InterviewResponse, timeLimitMinutes = 120): number {
    const startTime = new Date(interview.started_at).getTime();
    const currentTime = new Date().getTime();
    const elapsedMs = currentTime - startTime;
    const timeLimitMs = timeLimitMinutes * 60 * 1000;
    const remainingMs = timeLimitMs - elapsedMs;

    return Math.max(0, Math.ceil(remainingMs / 1000 / 60)); // Return in minutes
  }

  /**
   * Format interview status for display
   */
  formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      in_progress: "In Progress",
      completed: "Completed",
      submitted: "Submitted",
      failed: "Failed",
    };
    return statusMap[status] || status;
  }

  /**
   * Calculate interview progress percentage
   */
  calculateProgress(currentStep: number, totalSteps: number): number {
    if (totalSteps === 0) return 0;
    return Math.round((currentStep / totalSteps) * 100);
  }
}

// Export singleton instance
export const interviewService = new InterviewService();

// Export class for testing
export { InterviewService };
