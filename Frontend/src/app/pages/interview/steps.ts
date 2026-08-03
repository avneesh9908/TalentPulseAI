/** The interview wizard rail, shared by every step so the labels can't drift. */
export const INTERVIEW_STEPS = [
  { id: "role", label: "Role" },
  { id: "profile", label: "Resume" },
  { id: "setup", label: "Setup" },
  { id: "interview", label: "Interview" },
] as const;
