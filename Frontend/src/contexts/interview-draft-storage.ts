/**
 * Persists in-progress interview flow so refresh / direct URL to quick-setup
 * does not drop role & profile (React context is memory-only).
 */
const KEY = "talentpulse_interview_draft_v1";

export type InterviewDraftPersisted = {
  selectedRole: string | null;
  profileOption: "existing" | "upload" | null;
  experience: string | null;
  difficulty: string | null;
  skills: string[];
};

const emptyDraft = (): InterviewDraftPersisted => ({
  selectedRole: null,
  profileOption: null,
  experience: null,
  difficulty: null,
  skills: [],
});

export function loadInterviewDraft(): InterviewDraftPersisted {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return emptyDraft();
    const parsed = JSON.parse(raw) as Partial<InterviewDraftPersisted>;
    return { ...emptyDraft(), ...parsed };
  } catch {
    return emptyDraft();
  }
}

export function patchInterviewDraft(partial: Partial<InterviewDraftPersisted>): void {
  const next = { ...loadInterviewDraft(), ...partial };
  sessionStorage.setItem(KEY, JSON.stringify(next));
}

export function clearInterviewDraft(): void {
  sessionStorage.removeItem(KEY);
}
