# TalentPulse AI — Project Context

## Overview
TalentPulseAI is a full-stack AI-powered mock-interview platform. Users upload a resume or select an existing profile, configure an interview (role, experience, difficulty, skills), then take a live interview with Web Speech API transcription and video recording. The backend uses RAG (resume chunked into a pgvector store) to supply context for question generation. Answers are scored automatically and a feedback report is returned.

**Completion state:** ~85% complete. Core auth, full interview setup → execution → scoring → results flow, RAG pipeline, PII stripping, embedding dedup, and UI flow guards are all done. Dashboard shows mock data. Profile page is wired to read real user data but has no editing. No Alembic migrations (tables created via `create_all`).

## Stack & Tooling

### Backend (`TalentPulseAI-fastAPI/`)
- **Language:** Python 3.x
- **Framework:** FastAPI 0.110.0 + Uvicorn 0.27.1
- **ORM:** SQLAlchemy 2.0.25 + psycopg2-binary
- **Database:** PostgreSQL (port 5432 for app data, port 5433 for pgvector)
- **Vector store:** pgvector via `langchain-postgres` (preferred) or `langchain-community` fallback
- **Auth:** `python-jose` (JWT HS256) + `passlib[bcrypt]`
- **Validation:** Pydantic 2.7.4 + pydantic-settings 2.1.0
- **AI/RAG:** LangChain 0.3.26, `langchain-google-genai` 2.0.10, `langchain-openai` 0.3.28
- **PDF parsing:** pypdf 5.4.0
- **Run:** `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### Frontend (`Frontend/`)
- **Language:** TypeScript 5.9
- **Framework:** React 19.2 + Vite 7.2
- **Routing:** React Router v7
- **Styling:** Tailwind CSS 3.4 + Framer Motion 12
- **UI primitives:** Radix UI / shadcn
- **Forms:** React Hook Form 7 + Zod 4
- **Charts:** Recharts 3.5
- **HTTP:** Axios (axiosInstance) + custom httpClient wrapper
- **Run:** `npm run dev` → http://localhost:5173

## Architecture

```
Frontend (React SPA)
  └─ Pages/Components → Custom Hooks → Contexts → Service Layer → httpClient/axiosInstance
                                                                          ↓
Backend (FastAPI)
  └─ Routes (thin HTTP glue) → Services (business logic) → Models (SQLAlchemy)
                                    └─ RAG pipeline → pgvector (port 5433)
```

### Backend modules
```
app/
  main.py               Entry point, CORS, create_all, route registration
  core/
    config.py           Pydantic Settings (reads .env)
    jwt.py              JWT creation
    security.py         bcrypt hashing
  database/
    db.py               Engine + SessionLocal
    deps.py             get_db() dependency
  dependencies/
    auth.py             get_current_user() OAuth2 dependency
  models/
    user.py             User (id, email, password)
    profile.py          Profile 1:1 User (full_name, phone, headline, etc.)
    skill.py            Skill N:1 User
    education.py        Education N:1 User
    document.py         Document N:1 User (S3 URLs)
    preferences.py      CareerPreferences 1:1 User
    interview.py        Interview (interview_id, role, experience, difficulty, skills JSON, answers JSON, feedback JSON, status, completed_at)
    resume.py           ResumeDocument, ResumeChunk, EmbeddingCache
  routes/
    auth.py             POST /auth/register, POST /auth/login
    user.py             GET /user/profile
    interview.py        All interview + RAG endpoints (thin glue)
  schemas/
    user_schema.py      UserCreate, UserLogin
    interview_schema.py InterviewSetupRequest/Response, ExperienceType, DifficultyType, RoleType
    resume_rag_schema.py ResumeIndexRequest/Response, ContextRetrieveRequest/Response
  services/
    auth_service.py     signup_user(), login_user()
    interview_service.py create_interview(), get_interview(), submit_interview()
    scoring_service.py  score_answer(), build_interview_feedback()
    resume_rag_service.py ResumeRAGService (index_resume, retrieve_context) + get_rag_service() singleton
    embedding_service.py Provider dispatch (Google/Cursor), LocalHashEmbeddings fallback, PGVector factory
    resume_parser.py    PDF extraction, section parsing, PII stripping, content hashing
  (migrations/ lives at backend top level, NOT app/migrations/) — manual SQL for existing DBs:
    phase4_add_content_hash_and_embedding_cache.sql
    phase6_jsonb_and_not_null.sql   (JSON→JSONB + users NOT NULL) — APPLIED to dev DB 2026-06-19 (all 9 stmts OK)
    fix_interviews_missing_columns.sql
```

### Frontend modules
```
src/
  App.tsx               BrowserRouter > AuthProvider > InterviewProvider > ThemeProvider > Routes
  app/pages/
    landing.tsx         Public landing page (/demo → /interview/select-role)
    auth/               login.tsx, register.tsx, protected-route.tsx, layout.tsx
    dashboard/          dashboard.tsx (mock data, real user name from localStorage)
    interview/
      select-role.tsx   Step 1 — role selection (8 roles)
      select-profile.tsx Step 2 — upload resume or existing profile (step guard: needs role)
      quick-setup.tsx   Step 3 — experience/difficulty/skills + API submission (step guard: needs role+profile)
      interview-now.tsx Step 4 — live interview (Web Speech API, 2-min timer, video)
      interview-result.tsx Results (reads from location.state OR sessionStorage fallback)
    profile/profile.tsx  Reads real user from localStorage via authService
    users/users.tsx      User list (admin)
  contexts/
    auth-context.tsx     token, isAuthenticated, login/register/logout; redirects to /interview/select-role after login
    interview-provider.tsx interviewId, selectedRole, profileOption, experience, difficulty, skills, resumeUpload; persists to localStorage draft
    theme-provider.tsx   isDark, toggleTheme
    interview-draft-storage.ts  Draft shape + load/patch helpers (sessionStorage)
  services/
    authService.ts       login/register/logout, token/user localStorage management
    interviewService.ts  setupInterview, indexResume, retrieveContext, submitInterview, getResults
  lib/
    config.ts            API base URL + endpoint map (buildUrl helper)
    axiosInstance.ts     Axios client (api/) — SOLE base-URL/timeout resolver + Bearer interceptor, 401 → session-invalid event
    auth-token.ts        JWT parsing
    auth-events.ts       session-invalid custom event
  types/api.ts           All TypeScript interfaces (InterviewSetupRequest/Response, UserProfile, etc.)
  components/
    header.tsx           Sticky nav (real user initial + name from localStorage)
    ui/                  Radix UI primitives
```

## AI Layer

### Embedding providers
| Provider | Config key | Model | Dim | When |
|---|---|---|---|---|
| Google AI (free) | `GOOGLE_API_KEY` | `models/text-embedding-004` | 768 | `EMBEDDING_PROVIDER=google` (default) |
| Cursor/OpenAI legacy | `CURSOR_API_KEY` | `text-embedding-3-small` | 1536 | `EMBEDDING_PROVIDER=cursor` |
| Local hash fallback | — | SHA-256 bucket, deterministic | 768 | auto when remote fails |

**Key mechanism:** `embedding_service.get_embeddings_for_settings(settings)` dispatches by `EMBEDDING_PROVIDER`. Clients are `@lru_cache`'d — built once per process. `get_rag_service()` is also `@lru_cache(maxsize=1)` singleton.

**API keys:** stored in `TalentPulseAI-fastAPI/.env` — never committed. Read via `pydantic-settings`.

### RAG pipeline
1. Resume uploaded → PDF decoded → text extracted → sections parsed (safe sections only; **"general" header block dropped**). Heading matching is fuzzy (aliases + keyword fallback); candidate's own name detected & stripped; full-text fallback to `summary` if no headings found.
2. PII stripped from each chunk (email, phone, address, postal, URLs) before embedding
3. Content hash (SHA-256 of PII-stripped sections) checked against `EmbeddingCache`; if hit, chunks copied from source document (zero API calls)
4. Chunks stored in `resume_chunks` (SQL) and pgvector collection `talentpulse_resume_chunks`
5. At interview time, `retrieve_context` does similarity search with enriched query → returns top-k chunks
6. Frontend generates questions client-side from context chunks (no LLM call on backend for generation)

### Question generation (server-side, Gemini free tier) — added 2026-06-19
- `app/services/question_service.py` calls `ChatGoogleGenerativeAI` (model `GOOGLE_CHAT_MODEL`, default `gemini-2.0-flash`, free tier, same `GOOGLE_API_KEY`) to generate structured questions `{question, section, type, expected_signals[]}` from retrieved chunks.
- Endpoint: `POST /interview/questions/generate` (retrieves context internally, then generates — one round trip for the client). Schemas: `QuestionGenerateRequest/Response`, `GeneratedQuestion` in `resume_rag_schema.py`.
- Config flags: `ENABLE_LLM_QUESTIONS` (default True), `GOOGLE_CHAT_MODEL`. Lazy import + `@lru_cache` chat client (mirrors embedding_service).
- **Fallback chain:** LLM off/no key/error → deterministic templates in `question_service._fallback_questions` (mirrors the old frontend templater). Frontend `interview-now.tsx` tries `generateInterviewQuestions` first, then falls back to `retrieveInterviewContext` + `buildQuestionsFromContext`.
- **Env note:** app runs from the **global** Python (has `langchain-google-genai` 2.0.10 + fastapi/uvicorn); the `.venv` is stale/incomplete (lacks `langchain-google-genai` and `langchain-community`). (unconfirmed whether venv should be repaired)

### Scoring — LLM-as-judge with heuristic fallback (added 2026-06-19)
- `scoring_service.generate_feedback(answers, skills, questions, role, experience, difficulty)` is the dispatcher: uses Gemini judge when `llm_service.llm_enabled()` and answers exist, else the heuristic.
- `build_interview_feedback_llm(...)`: one Gemini call (temp 0.2) judging every answer against its question + `expected_signals`; returns `{score, strengths, improvements, overall_feedback, next_steps, question_feedback[]}`. `word_count` computed in Python (authoritative); per-question rebuilt from actual answers so every answered Q is present even if the judge omits one. Any failure raises → caller falls back.
- `build_interview_feedback` / `score_answer` (word count + STAR markers + keyword match, tiers excellent ≥80 / good ≥65 / developing <65) remain as the **fallback** path.
- **Questions reach scoring** via the submit payload: frontend sends `questions: [{question_id, question, expected_signals}]` (interview-now.tsx tracks `questionSignals`); route passes to `submit_interview(..., questions)`. Questions are NOT persisted server-side — they ride the submit request. Result-page contract unchanged (`question_feedback[].{score, word_count, feedback}`).
- **Shared LLM access:** `app/services/llm_service.py` — cached `get_chat_model(api_key, model, temperature)`, `llm_enabled()`, `chat_model(temperature)`, `parse_json`/`extract_array`. Both question_service and scoring_service use it (question_service's private `_get_chat_model`/`_parse_llm_json` removed).

## Domain Glossary
- **Interview:** one session; `interview_id` is the primary handle across the flow
- **Setup:** the 3-step wizard (role → profile → experience/difficulty/skills) that calls `POST /interview/setup`
- **Profile option:** `"upload"` (new resume) or `"existing"` (profile already on platform — currently Coming Soon)
- **RAG collection:** `talentpulse_resume_chunks` in the vector DB
- **Content hash:** SHA-256 of canonical PII-stripped section text; powers embedding dedup
- **EmbeddingCache:** DB table tracking `(user_id, content_hash)` → source document; avoids re-embedding identical resumes
- **Safe sections:** resume sections that are embedded (no PII): summary, experience, work_experience, projects, skills, education, certifications, achievements
- **Step guard:** frontend redirect at the top of step 2/3/4 if prior steps not completed
- **Interview draft:** localStorage-persisted partial setup state so page refresh doesn't kill the wizard

## Conventions
- **Backend:** service-layer pattern; routes are thin HTTP glue; `Depends()` for DI; `@lru_cache` for singletons
- **Frontend:** context + custom hook pattern; `useAuth()`, `useInterview()`, `useTheme()`; service layer between components and HTTP
- **No Alembic migrations:** tables created via `Base.metadata.create_all`; new columns need manual `ALTER TABLE` on existing DBs
- **No comments unless WHY is non-obvious**
- **Folder naming:** kebab-case for pages, snake_case for Python
- **No test suite** (unconfirmed — none found)
- **No CI/CD** (not set up yet)

## People & Ownership
- **Developer:** Avneesh (avneesh.kaushik@protego.services) — sole developer

## Decisions
- **2026-06** Switched embedding provider from Cursor API (paid/expired) to Google AI free tier (`models/text-embedding-004`, 768-dim). `LocalHashEmbeddings` fallback also updated to 768-dim.
- **2026-06** Phase 2: Split monolith backend into 5 service files (scoring, resume_parser, embedding, interview, resume_rag).
- **2026-06** Phase 3: PII protection — "general" header section dropped before indexing; `strip_pii()` applied to every chunk.
- **2026-06** Phase 4: Embedding dedup via `content_hash` + `EmbeddingCache` table.
- **2026-06** Phase 5: UI flow — real user name wired, step guards added, duplicate /profile route removed, 959 lines of dead dashboard code deleted, /demo redirect added.
- **2026-06** Phase 1: Fixed 6 P0 bugs: camera freeze, last-answer drop, session lost on refresh, results page dead on refresh, 500 on 404, backend not persisting answers/feedback.
- **Questions generated client-side** — no LLM API call on backend for question generation (by design, to avoid latency and cost).

## Constraints & Non-Goals
- No Alembic — schema managed by `create_all`; manual SQL for new columns on existing DBs
- No Docker/deployment setup yet
- "Use Existing Profile" in the interview wizard is disabled/Coming Soon
- No test suite
- No real-time collaboration features
- Dashboard analytics are currently mock data (charts, stats, upcoming interviews, recent attempts)
- Profile page has no editing capability yet (read-only from localStorage)

## Completion Status

| Feature | Status |
|---|---|
| Auth (register/login/logout/JWT) | ✅ Done |
| Interview setup wizard (3-step) | ✅ Done |
| Resume upload → RAG indexing | ✅ Done |
| PII stripping before embedding | ✅ Done |
| Embedding dedup (content hash) | ✅ Done |
| Live interview (speech, timer, video) | ✅ Done |
| Answer submission + scoring | ✅ Done |
| Results page + sessionStorage fallback | ✅ Done |
| Real user name in header/dashboard/profile | ✅ Done |
| Step guards on interview flow | ✅ Done |
| Google AI embeddings (free) | ✅ Done |
| Backend service split | ✅ Done |
| Dashboard (UI shell) | ✅ Done (mock data) |
| Dashboard real analytics | ❌ Not started |
| Profile editing | ❌ Not started |
| "Use Existing Profile" flow | ❌ Not started |
| Interview list / history | ❌ Not started |
| Alembic migrations | ❌ Not started |
| Docker / deployment | ❌ Not started |
| CI/CD | ❌ Not started |
| Test suite | ❌ Not started |
| S3 document upload | ❌ Not started |
| Email notifications | ❌ Not started |

## Improvement Backlog (analysis 2026-06-19, prioritized)
1. ~~**Question quality (highest impact):** string templating.~~ ✅ DONE 2026-06-19 — server-side Gemini generation with template fallback (see AI Layer § Question generation). Not yet persisted to interview row (regenerated on load).
2. ~~**Scoring is gameable:** word count + literal markers.~~ ✅ DONE 2026-06-19 — LLM-as-judge against `expected_signals` with heuristic fallback (see AI Layer § Scoring).
3. **RAG N+1:** retrieve_context re-queries ResumeChunk per match for chunk_id — store chunk_id in vector metadata at index time, or batch with one IN query.
4. **Single-query retrieval:** consider multi-query (projects/technical/leadership/role facets) merge for better coverage before feeding an LLM.
5. **Infra:** no tests (add pytest around scoring/chunking before LLM refactor), no Alembic (add now while schema small — about to add question/score columns), persist generated questions to interview row.

**Recommended first step:** server-side question generation + scoring on Gemini, behind existing fallback.

### Full-project audit findings (2026-06-19) — verified
Overall rating ~5/10: strong AI/RAG layer (8/10), weak engineering maturity & security (3/10).
- ✅ ~~🔴 Auth broken contract~~ FIXED 2026-06-19: `auth_service` now raises HTTPException (login 401 constant-time via `DUMMY_PASSWORD_HASH`, duplicate signup 409); `user_schema` validates email (regex, no email-validator dep) + password min 8/max 72; `security` truncates to 72 bytes; `jwt` timezone-aware + `iat`; signup returns token; register route → 201; dead code removed. Verified via SQLite functional test (7 cases).
- ✅ ~~🔴 Embedded git repo~~ FIXED 2026-06-19: merged backend into the monorepo (removed gitlink, deleted nested `.git`, backend now 39 normal tracked files; added root `.gitignore`). On branch `chore/merge-backend-into-monorepo` (commit 266ad29, NOT pushed, not yet merged to main). Backend's 18-commit history archived at `github.com/avneesh9908/TalentPulseAI-fastAPI` (HEAD 50080fc, fully pushed). **Backend is no longer a separate repo** — push via the root remote (`github.com/avneesh9908/TalentPulseAI.git`).
- 🟠 JWT in localStorage (XSS); no password policy / `EmailStr`; bcrypt >72-byte truncation unhandled (user_schema.py).
- ✅ ~~🟠 Nullable email/password; JSON not JSONB~~ FIXED 2026-06-19: User.email/password now `nullable=False`; 7 cols use `db.JSONType` (= `JSON().with_variant(JSONB,"postgresql")` — JSONB on PG, JSON on SQLite); Interview.user↔User.interviews `back_populates` + `cascade="all, delete-orphan"` (mapper warning gone); `pool_recycle=1800`. **Run `migrations/phase6_jsonb_and_not_null.sql` on existing DBs** (create_all won't alter columns). Verified via SQLite test.
- 🟠 ~~Dead/duplicate frontend code~~ PARTLY FIXED 2026-06-19: deleted dead `lib/httpClient.ts` + removed unused network methods from `services/authService.ts` class (now storage/token helpers only; ~400 lines removed). **Still TODO:** consolidate the two endpoint maps (`lib/config.ts` ENDPOINTS used by interviewService vs `api/endpoints.ts` API_ENDPOINTS used by api/authService) + dual base-URL resolution (VITE_API_URL vs VITE_API_BASE_URL). Live auth flow: auth-context → api/authService (NOT the class).
- ✅ ~~🟠 resume_parser exact-heading-only; no name stripping~~ FIXED 2026-06-19: fuzzy heading matching (`_SECTION_ALIASES` + short-line keyword fallback in `_match_section`); candidate-name detection (`detect_candidate_name`, guarded by `_NAME_STOPWORDS` against job titles) stripped from all sections in `parse_sections`; fallback embeds full text as `summary` when no headings recognized (instead of nothing). Name stripping at parse time → hash+chunks stay consistent, no RAG-service change. **Limitation:** 3rd-party names in bullets not stripped (needs NER). Verified via functional test.
- ✅ ~~🟠 Missing/unused deps~~ FIXED 2026-06-19: added `langchain-community>=0.3.0,<0.4.0`; removed unused `redis`/`openai`/`rank_bm25`/`pdfplumber`; bumped `pydantic-settings` to `>=2.4.0,<3.0.0` (langchain-community needs it; compatible with pydantic 2.7.4). Installed into `.venv` — **.venv drift RESOLVED, now runnable** (config loads, langchain imports OK). Redis confirmed unused.
- ✅ ~~🟡 Context value not memoized~~ FIXED 2026-06-19: `useMemo` on value in interview-provider, auth-context, theme-provider (+ `useCallback` on theme's toggleTheme). tsc+eslint(exhaustive-deps) clean.
- ✅ ~~🟡 no ErrorBoundary~~ FIXED 2026-06-19: `components/error-boundary.tsx` (class, theme-aware fallback, Reload/Go Home via window.location, dev-only error detail) wraps everything as outermost in App.tsx. tsc+eslint+vite build pass.
- ✅ ~~🟡 30s axios timeout on LLM calls~~ FIXED 2026-06-19: `LLM_TIMEOUT_MS=120000` per-request override on indexResume, retrieveInterviewContext, generateInterviewQuestions, submitInterview (interviewService.ts); fast DB endpoints keep 30s.
- ✅ ~~🟡 endpoint-map duplication~~ FIXED 2026-06-19: `config.ENDPOINTS` (lib/config.ts) is now the single endpoint map (added USERS section); deleted api/endpoints.ts + dead services/interviewService.ts (~160 lines); removed dead API_BASE_URL/API_TIMEOUT so axiosInstance is the sole base-URL/timeout resolver; api/authService+userService migrated. tsc+eslint+build pass.
- ✅ ~~🟡 console.logs in prod paths~~ FIXED 2026-06-19: removed 8 debug console.logs (interview-provider + Google buttons → type="button"); kept legitimate console.error/warn.
- ✅ ~~🟡 Orphaned Alembic scaffold~~ FIXED 2026-06-19: deleted alembic/ + alembic.ini (manual SQL in migrations/ is the convention).
- ✅ ~~🟡 Vite chunk >500kB~~ FIXED 2026-06-19: lazy-loaded all routes (React.lazy + Suspense in App.tsx); recharts now isolated to the dashboard chunk (loads only on /dashboard). Warning gone.
- **All audit High + Medium items resolved as of 2026-06-19.**
- ✅ ~~🟡 hardcoded "cursor" embedding provider~~ FIXED 2026-06-19: was NOT mis-routing (backend never reads `payload.embedding`; provider = `EMBEDDING_PROVIDER` env). Removed the dead field from frontend payload+types and backend schema (EmbeddingConfig deleted). Embedding provider is server-controlled.
- ✅ Good: AI/RAG pipeline, clean layering, TS strict-clean (zero `any`), `.env` gitignored.

## Open Questions
1. What model/API will generate interview questions? (Currently client-side from context chunks — no LLM call)
2. Will "Use Existing Profile" be wired up, and to which profile entity?
3. Should the dashboard analytics pull from real `interviews` DB data?
4. Is S3 / any file storage service configured, or is document upload still TODO?
5. ~~Is Redis used anywhere?~~ ANSWERED 2026-06-19: No — removed from requirements.txt.

## References
- Swagger UI: http://localhost:8000/docs
- Frontend dev: http://localhost:5173
- Google AI Studio (free API key): https://aistudio.google.com/app/apikey
- Existing docs: `Frontend/document/` (API_MANAGEMENT.md, FLOW_DOCUMENTATION.md, INTERVIEW_API_INTEGRATION.md, INTERVIEW_SETUP_PAYLOAD.md, README.md)
- Manual migration SQL: `TalentPulseAI-fastAPI/migrations/phase4_add_content_hash_and_embedding_cache.sql`

## Changelog
- 2026-06-19 — Initial skill created from Phase 1 repo exploration; captured full stack, 5-phase refactor history, completion state, open questions
- 2026-06-19 — Added prioritized Improvement Backlog after code review of question generation, scoring, and RAG retrieval (verified current code).
- 2026-06-19 — Implemented server-side LLM question generation (Gemini free tier, gemini-2.0-flash) with deterministic fallback. New question_service.py, POST /interview/questions/generate, frontend wired in interview-now.tsx. Backend py_compile + frontend tsc both pass.
- 2026-06-19 — Implemented LLM-as-judge scoring (Gemini, temp 0.2) with heuristic fallback. New llm_service.py (shared chat client + JSON parsing); scoring_service.generate_feedback dispatcher; questions+expected_signals sent via submit payload. question_service refactored onto llm_service. py_compile + tsc pass.
- 2026-06-19 — Full-project audit (3 parallel reviewers + verification). Rated ~5/10 overall. Recorded verified critical findings: auth 200-dict contract, embedded git repo without .gitmodules, plus high/medium issues. See AI Layer § audit findings.
- 2026-06-19 — FIX #1 (auth contract): proper HTTPException status codes, constant-time login, email/password validation (regex, no new dep), 72-byte bcrypt safety, tz-aware JWT + iat, signup returns token, dead code removed. SQLite functional test passed.
- 2026-06-19 — FIX #2 (git topology): merged backend into monorepo (was embedded repo). Branch chore/merge-backend-into-monorepo, not pushed. Backend no longer separate repo.
- 2026-06-19 — FIX #3 (dead frontend code): deleted lib/httpClient.ts + trimmed AuthService class to storage helpers (~400 lines removed). tsc+eslint pass. Endpoint-map dedup deferred.
- 2026-06-19 — FIX #4 (models): NOT NULL on user creds, JSON→JSONType (JSONB on PG), Interview↔User back_populates+cascade (warning gone), pool_recycle. Added migrations/phase6_jsonb_and_not_null.sql. SQLite test passed.
- 2026-06-19 — FIX #5 (resume_parser): fuzzy section-heading matching (aliases + keyword fallback), candidate-name detection/stripping (guarded against job titles), full-text fallback when no headings. Verified via functional test. Limitation: 3rd-party names need NER.
- 2026-06-19 — FIX #6 (deps): added langchain-community (dynamic fallback), removed unused redis/openai/rank_bm25/pdfplumber. Redis confirmed unused.
- 2026-06-19 — FIX (medium): removed dead hardcoded "cursor" embedding config from frontend+backend (backend ignored it; provider is env-controlled). tsc+py_compile pass.
- 2026-06-19 — FIX (medium): memoized context value in interview-provider, auth-context, theme-provider (useMemo + useCallback). tsc+eslint pass.
- 2026-06-19 — FIX (medium): added top-level ErrorBoundary (components/error-boundary.tsx) wrapping App. tsc+eslint+build pass.
- 2026-06-19 — FIX (medium): per-request 120s timeout on LLM/RAG endpoints in interviewService.ts. tsc+eslint pass.
- 2026-06-19 — FIX (medium): endpoint-map consolidation — single config.ENDPOINTS, deleted api/endpoints.ts + dead services/interviewService.ts, axiosInstance sole base-URL resolver. tsc+eslint+build pass.
- 2026-06-19 — FIX (polish x3): removed stray console.logs (+ Google buttons type=button); deleted orphaned alembic/ scaffold; lazy-loaded routes for code-splitting (chunk warning gone). All audit High+Medium items now resolved.
- 2026-06-19 — ENV SYNC: pip install -r into .venv (fixed pydantic-settings pin conflict by bumping to >=2.4.0; .venv now runnable, drift resolved). phase6 migration applied to dev DB (9/9 stmts OK; JSONB + NOT NULL verified).
