/**
 * Job Search Agent API client. Types are local to this service
 * (same pattern as userService.ts).
 */
import axiosInstance from "./axiosInstance";
import { buildUrl, config } from "@/lib/config";

// A search run fans out to ATS APIs + embedding + LLM re-rank; allow cold starts.
const SEARCH_TIMEOUT_MS = 120_000;

export interface JobSetup {
  id: number;
  setup_source: string;
  resume_document_id: number | null;
  target_designations: string[];
  locations: string[];
  remote_ok: boolean;
  seniority: string | null;
  min_salary: number | null;
  updated_at: string | null;
}

export interface JobSetupRequest {
  resume_document_id?: number | null;
  target_designations: string[];
  locations?: string[];
  remote_ok?: boolean;
  seniority?: string | null;
  min_salary?: number | null;
}

export interface DesignationSuggestion {
  resume_document_id: number;
  designations: string[];
  source: "llm" | "fallback";
}

export interface JobSearchRun {
  companies_checked: number;
  listings_fetched: number;
  new_listings: number;
  new_matches: number;
  matches_total: number;
  message: string;
}

export type MatchStatus =
  | "new"
  | "reviewed"
  | "pending_apply"
  | "applied"
  | "dismissed";

export interface JobMatch {
  id: number;
  company: string;
  title: string;
  location: string | null;
  remote: boolean;
  url: string;
  designation: string | null;
  match_score: number;
  match_reasons: { fits?: string[]; gaps?: string[] };
  status: MatchStatus;
  apply_url: string | null;
  pending_reason: string | null;
  posted_at: string | null;
  created_at: string | null;
}

export interface JobMatchesResponse {
  total: number;
  matches: JobMatch[];
}

export interface TargetCompany {
  id: number;
  name: string;
  ats_type: string;
  board_slug: string;
  careers_url: string | null;
  is_active: boolean;
}

export interface ResumeOption {
  id: number;
  file_name: string;
  role: string | null;
  experience: string | null;
  skills: string[];
  source: string | null;
  created_at: string | null;
}

/** Resumes the job agent can use — chosen independently of the interview flow. */
export const getJobResumes = async (): Promise<ResumeOption[]> => {
  const { data } = await axiosInstance.get<ResumeOption[]>(config.ENDPOINTS.JOBS.RESUMES);
  return data;
};

export const getJobSetup = async (): Promise<JobSetup> => {
  const { data } = await axiosInstance.get<JobSetup>(config.ENDPOINTS.JOBS.SETUP);
  return data;
};

export const saveJobSetup = async (payload: JobSetupRequest): Promise<JobSetup> => {
  const { data } = await axiosInstance.post<JobSetup>(config.ENDPOINTS.JOBS.SETUP, payload);
  return data;
};

export const suggestDesignations = async (
  resumeDocumentId?: number | null
): Promise<DesignationSuggestion> => {
  const { data } = await axiosInstance.post<DesignationSuggestion>(
    config.ENDPOINTS.JOBS.DESIGNATIONS_SUGGEST,
    { resume_document_id: resumeDocumentId ?? null },
    { timeout: SEARCH_TIMEOUT_MS }
  );
  return data;
};

export const runJobSearch = async (): Promise<JobSearchRun> => {
  const { data } = await axiosInstance.post<JobSearchRun>(
    config.ENDPOINTS.JOBS.SEARCH,
    {},
    { timeout: SEARCH_TIMEOUT_MS }
  );
  return data;
};

export const getJobMatches = async (status?: MatchStatus): Promise<JobMatchesResponse> => {
  const { data } = await axiosInstance.get<JobMatchesResponse>(config.ENDPOINTS.JOBS.MATCHES, {
    params: status ? { status_filter: status } : undefined,
  });
  return data;
};

export const updateJobMatchStatus = async (
  matchId: number,
  status: MatchStatus,
  pendingReason?: string
): Promise<JobMatch> => {
  const endpoint = buildUrl(config.ENDPOINTS.JOBS.MATCH_UPDATE, { id: String(matchId) });
  const { data } = await axiosInstance.patch<JobMatch>(endpoint, {
    status,
    pending_reason: pendingReason ?? null,
  });
  return data;
};

export const getTargetCompanies = async (): Promise<TargetCompany[]> => {
  const { data } = await axiosInstance.get<TargetCompany[]>(config.ENDPOINTS.JOBS.COMPANIES);
  return data;
};

export const addTargetCompany = async (payload: {
  name: string;
  ats_type: string;
  board_slug: string;
  careers_url?: string | null;
}): Promise<TargetCompany> => {
  const { data } = await axiosInstance.post<TargetCompany>(
    config.ENDPOINTS.JOBS.COMPANIES,
    payload
  );
  return data;
};
