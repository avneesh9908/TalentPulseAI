import axiosInstance from "./axiosInstance";
import { buildUrl, config } from "@/lib/config";
import type {
  ContextRetrieveRequest,
  ContextRetrieveResponse,
  InterviewResponse,
  InterviewSetupRequest,
  InterviewSetupResponse,
  ResumeIndexRequest,
  ResumeIndexResponse,
  InterviewSubmitRequest,
} from "@/types/api";

export const setupInterview = async (
  payload: InterviewSetupRequest
): Promise<InterviewSetupResponse> => {
  const { data } = await axiosInstance.post<InterviewSetupResponse>(
    config.ENDPOINTS.INTERVIEW.SETUP,
    payload
  );
  return data;
};

export const indexResume = async (
  payload: ResumeIndexRequest
): Promise<ResumeIndexResponse> => {
  const { data } = await axiosInstance.post<ResumeIndexResponse>(
    config.ENDPOINTS.INTERVIEW.RESUME_INDEX,
    payload
  );
  return data;
};

export const retrieveInterviewContext = async (
  payload: ContextRetrieveRequest
): Promise<ContextRetrieveResponse> => {
  const { data } = await axiosInstance.post<ContextRetrieveResponse>(
    config.ENDPOINTS.INTERVIEW.CONTEXT_RETRIEVE,
    payload
  );
  return data;
};

export const getInterview = async (interviewId: string): Promise<InterviewResponse> => {
  const endpoint = buildUrl(config.ENDPOINTS.INTERVIEW.GET, { id: interviewId });
  const { data } = await axiosInstance.get<InterviewResponse>(endpoint);
  return data;
};

export const saveInterviewProgress = async (
  interviewId: string,
  payload: Record<string, unknown>
): Promise<InterviewResponse> => {
  const endpoint = buildUrl(config.ENDPOINTS.INTERVIEW.SAVE, { id: interviewId });
  const { data } = await axiosInstance.put<InterviewResponse>(endpoint, { data: payload });
  return data;
};

export const submitInterview = async (
  interviewId: string,
  payload: InterviewSubmitRequest
): Promise<InterviewResponse> => {
  const endpoint = buildUrl(config.ENDPOINTS.INTERVIEW.SUBMIT, { id: interviewId });
  const { data } = await axiosInstance.post<InterviewResponse>(endpoint, payload);
  return data;
};

export const getInterviewResults = async (
  interviewId: string
): Promise<Record<string, unknown>> => {
  const endpoint = buildUrl(config.ENDPOINTS.INTERVIEW.RESULTS, { id: interviewId });
  const { data } = await axiosInstance.get<Record<string, unknown>>(endpoint);
  return data;
};
