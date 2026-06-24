# TalentPulseAI — Frontend Summary

**Last Updated:** 2026-06-19  
**Stack:** React 19 · TypeScript 5.9 · Vite 7.2 · Tailwind CSS 3.4 · React Router v7 · Framer Motion

---

## What It Does

Single-page React application for an AI mock-interview platform. Users go through a 3-step setup wizard, take a live interview with speech recognition and optional video, then view a scored feedback report.

---

## Run

```bash
cd Frontend
npm run dev        # → http://localhost:5173
npx tsc --noEmit   # TypeScript check (0 errors expected)
npm run build      # Production build
```

**Backend expected at:** `http://127.0.0.1:8000` (set in `Frontend/.env` as `VITE_API_BASE_URL`)

---

## Folder Structure

```
Frontend/src/
├── App.tsx                   Router + provider tree
├── main.tsx                  ReactDOM entry
├── app/pages/
│   ├── landing.tsx           Public landing page
│   ├── auth/                 login, register, protected-route, layout
│   ├── dashboard/            dashboard.tsx
│   ├── interview/
│   │   ├── select-role.tsx   Step 1
│   │   ├── select-profile.tsx Step 2 (step guard)
│   │   ├── quick-setup.tsx   Step 3 (step guard) + API submission
│   │   ├── interview-now.tsx Step 4 (live interview)
│   │   └── interview-result.tsx Results
│   ├── profile/profile.tsx   Profile (read-only, real data from localStorage)
│   └── users/users.tsx       User list (admin)
├── components/
│   ├── header.tsx            Sticky nav with real user name/initial
│   └── ui/                  Radix UI primitives (button, card, dialog, etc.)
├── contexts/
│   ├── auth-context.tsx      Auth state + login/register/logout
│   ├── interview-provider.tsx Interview wizard state + API calls
│   ├── interview-context.ts  Context type definitions
│   ├── interview-draft-storage.ts localStorage draft persistence
│   └── theme-provider.tsx   Dark/light mode
├── services/
│   ├── authService.ts        Token storage, user storage, auth API calls
│   └── interviewService.ts  Interview API calls
├── lib/
│   ├── config.ts             API base URL + endpoint map + buildUrl()
│   ├── axiosInstance.ts      Axios with Bearer interceptor + 401 → session event
│   ├── httpClient.ts         Fetch-based wrapper (alternative HTTP client)
│   ├── auth-token.ts         JWT parsing
│   └── auth-events.ts        session-invalid custom event
└── types/api.ts              All TypeScript interfaces
```

---

## Routes

| Path | Component | Protected | Notes |
|---|---|---|---|
| `/` | LandingPage | ❌ | Public entry point |
| `/demo` | — | ❌ | Redirect → `/interview/select-role` |
| `/auth/login` | Login | ❌ | |
| `/auth/register` | Register | ❌ | Auto-login after register |
| `/interview/select-role` | SelectRole | ✅ | Step 1 |
| `/interview/select-profile` | SelectProfile | ✅ | Step 2; redirects to step 1 if no role |
| `/interview/quick-setup` | QuickSetup | ✅ | Step 3; redirects to step 1/2 if missing prior |
| `/interview/start` | InterviewNow | ✅ | Step 4 — live interview |
| `/interview/result` | InterviewResult | ✅ | Score + feedback |
| `/dashboard` | Dashboard | ✅ | Overview (mock data) |
| `/profile` | Profile | ✅ | User info from localStorage |
| `*` | — | — | Redirect → `/auth/login` |

---

## State Management

### AuthContext (`auth-context.tsx`)
```
token | isAuthenticated | isLoading
login(email, password) → POST /auth/login → store token → navigate /interview/select-role
register(name, email, phone, password) → POST /auth/register → auto-login
logout() → clear token → navigate /auth/login
```
Token stored in `localStorage` as `access_token`. On 401, fires `session-invalid` event → logout.

### InterviewContext (`interview-provider.tsx`)
```
interviewId | selectedRole | profileOption | experience | difficulty | skills | resumeUpload
```
- Persists to `localStorage` as `talentpulse_interview_draft` (including `interviewId`)
- **`submitInterviewSetup()`** — validates all fields, calls `POST /interview/setup`, optionally calls `POST /interview/resume/index` for uploaded resumes, stores `interviewId` in draft
- **Step guards:** `select-profile.tsx` checks `selectedRole`; `quick-setup.tsx` checks both `selectedRole` and `profileOption`

### ThemeContext
Dark/light mode toggle, persisted to `localStorage`.

---

## Interview Flow (Happy Path)

```
/auth/login or /auth/register
        ↓  (JWT stored)
/interview/select-role      → saveRole()
        ↓
/interview/select-profile   → saveProfile() + optional PDF → base64 → saveResumeUpload()
        ↓
/interview/quick-setup      → [user sets experience, difficulty, skills]
                              submitInterviewSetup()
                              → POST /interview/setup           (creates session)
                              → POST /interview/resume/index    (if upload, fires RAG)
                              → POST /interview/context/retrieve (get resume chunks)
        ↓
/interview/start            → 6 questions generated client-side from context chunks
                              Web Speech API for transcription (2-min timer per question)
                              User can edit transcript
                              POST /interview/{id}/submit
                              → sessionStorage.setItem("talentpulse_last_result", ...)
        ↓
/interview/result           → Reads location.state OR sessionStorage fallback (refresh-safe)
                              Shows score, feedback, question-by-question breakdown
                              "Start New Interview" → resetInterview() + navigate to step 1
```

---

## Key Components

### `interview-now.tsx` — Live Interview
- Media acquired once on mount (camera/mic); never re-acquired between questions (fixed camera-freeze bug)
- `questionRecordingsRef` — ref tracks recordings for cleanup without adding to effect deps
- `editableTranscript` — user-editable live transcript
- `handleSubmitInterview` — synchronously captures current answer before reducing finalizedAnswers (fixed last-answer-drop bug)
- "No Active Interview Session" guard: if `!interviewId && !isGeneratingQuestions`, shows redirect button

### `interview-result.tsx`
- Reads `location.state` first, falls back to `sessionStorage` key `talentpulse_last_result`
- "Start New Interview" clears both sessionStorage and interview context

### `header.tsx`
- Reads `authService.getCurrentUserFromStorage()` → derives `displayName` (full_name → email → "User") and `userInitial`
- Shows name in dropdown header

### `dashboard.tsx`
- Mock data for charts and stats (scoreHistory, skillRadar, upcoming, recent)
- Real user name via `authService.getCurrentUserFromStorage()`

---

## API Layer

All HTTP goes through `axiosInstance.ts` (Axios) or `httpClient.ts` (Fetch). Both auto-inject `Authorization: Bearer {token}`.

Endpoint map lives in `src/lib/config.ts`:
```typescript
config.ENDPOINTS.AUTH.LOGIN       // "/auth/login"
config.ENDPOINTS.INTERVIEW.SETUP  // "/interview/setup"
// etc.
```

TypeScript interfaces for all request/response shapes in `src/types/api.ts`.

---

## Completion Status

| Feature | Status |
|---|---|
| Auth (login/register/logout) | ✅ Complete |
| Interview setup wizard (3 steps) | ✅ Complete |
| Resume upload → base64 → RAG | ✅ Complete |
| Step guards (prevent skipping steps) | ✅ Complete |
| Live interview (speech, timer, video) | ✅ Complete |
| Results page (+ refresh-safe) | ✅ Complete |
| Real user name in header/dashboard/profile | ✅ Complete |
| Dark/light mode | ✅ Complete |
| /demo → /interview/select-role redirect | ✅ Complete |
| Dashboard (UI shell) | ✅ Complete |
| Dashboard real analytics | ❌ Not started |
| Profile editing | ❌ Not started |
| "Use Existing Profile" flow | ❌ Not started |
| Interview history page | ❌ Not started |
| Test suite | ❌ Not started |
