# TalentPulse AI — Project Context

## Overview
TalentPulseAI is a full-stack AI-powered mock-interview platform. Users upload a resume or select an existing profile, configure an interview (role, experience, difficulty, skills), then take a live interview with Web Speech API transcription and video recording. The backend uses RAG (resume chunked into a pgvector store) to supply context for question generation. Answers are scored automatically and a feedback report is returned.

**Completion state:** ~85% complete. Core auth, full interview setup → execution → scoring → results flow, RAG pipeline, PII stripping, embedding dedup, and UI flow guards are all done. Dashboard still shows mock data; `/profile` is a real per-user account page (identity, interview history/status, resumes, report re-open) with no editing. A dashboard/profile merge was attempted twice on 2026-07-30 and reverted at the user's request — read "Dashboard/profile merge — ATTEMPTED TWICE AND REVERTED" before touching the dashboard. No Alembic migrations (tables created via `create_all`).

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
    user.py             GET /user/profile, GET /user/overview
    interview.py        All interview + RAG endpoints (thin glue)
  schemas/
    user_schema.py      UserCreate, UserLogin
    interview_schema.py InterviewSetupRequest/Response, ExperienceType, DifficultyType, RoleType
    resume_rag_schema.py ResumeIndexRequest/Response, ContextRetrieveRequest/Response
  services/
    auth_service.py     signup_user(), login_user()
    user_service.py     get_overview() — profile-page payload (identity + stats + latest/recent interviews + resumes)
    interview_service.py create_interview(), get_interview(), submit_interview(), summarize_interview(), list_interviews()
    scoring_service.py  score_answer(), build_interview_feedback()
    resume_rag_service.py ResumeRAGService (index_resume, retrieve_context) + get_rag_service() singleton
    embedding_service.py Provider dispatch (Google/Cursor), LocalHashEmbeddings fallback, PGVector factory
    resume_parser.py    PDF extraction (+ Gemini-vision OCR fallback for scanned PDFs), section parsing, PII stripping, content hashing
    question_research_service.py Web research (Gemini + Google Search grounding) on commonly-asked questions per role/experience/skills; process-lifetime cache; never raises
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
    dashboard/          dashboard.tsx (MOCK data — real user name only; a merge with profile was tried and reverted, see "Dashboard/profile merge — REVERTED")
    interview/
      select-role.tsx   Step 1 — role selection (8 roles)
      select-profile.tsx Step 2 — upload resume or existing profile (step guard: needs role)
      quick-setup.tsx   Step 3 — experience/difficulty/skills + API submission (step guard: needs role+profile)
      interview-now.tsx Step 4 — live interview (Web Speech API, 2-min timer, video)
      interview-result.tsx Results (reads from location.state OR sessionStorage fallback)
    profile/profile.tsx  Per-user account page — fetches GET /user/overview (identity, stats, latest interview status, history w/ report re-open, resumes)
    users/users.tsx      User list (admin)
  contexts/
    auth-context.tsx     token, isAuthenticated, login/register/logout; **redirects to /dashboard after login** (was /interview/select-role)
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

### Intelligent resume extraction (LLM-based, added 2026-06-26)
- `resume_parser.extract_sections(text)` is the dispatcher used by `index_resume`: tries `parse_sections_llm` (Gemini, temp 0) first, falls back to heuristic `parse_sections` on any error.
- `parse_sections_llm`: prompts Gemini to return ONLY interview-relevant professional content as JSON sections, explicitly EXCLUDING all PII (name, phone, email, address, **city/state/country/location**, postal, URLs, DOB, IDs). Defense-in-depth: every value still passes `strip_pii` + name-strip. Temp 0 keeps output stable for content-hash dedup.
- Config flag: `ENABLE_LLM_RESUME_PARSING` (default True).
- `strip_pii` now ALSO strips location PII (`_LOCATION_PATTERNS`: "City, India", "City, <Indian State>", trailing ", India"/", State"). On the heuristic fallback path this removes locations glued to company/college names by PDF extraction (e.g. "...LimitedSurat, India"). Runs per-chunk so surrounding bullet content is preserved.

### PDF OCR for scanned/image resumes (added 2026-07-02)
- `resume_parser.normalize_resume_text`: if pypdf extracts < 120 chars (`_MIN_PDF_TEXT_CHARS` — image PDFs have no text layer), falls back to `ocr_pdf_with_gemini` — sends the PDF inline (`application/pdf`) to Gemini vision via REST (`llm_service.generate_content_rest`, temp 0, 120s timeout). Live-tested 2026-07-02: exact transcription.
- Config flag `ENABLE_PDF_OCR` (default True). OCR failure degrades: use pypdf text if any, else clear ValueError ("PDF has no text layer... OCR unavailable").
- `llm_service.generate_content_rest(parts, tools, model, temperature, timeout)` is the shared REST helper (also used by question research) — bypasses the deprecated `google.generativeai` SDK, uses `requests` + `x-goog-api-key` header.

### RAG pipeline
1. Resume uploaded → PDF decoded → text extracted (pypdf; **Gemini-vision OCR fallback for scanned/image PDFs**) → `extract_sections` (LLM-intelligent, heuristic fallback; safe sections only; **"general" header block dropped**). Heading matching is fuzzy (aliases + keyword fallback); candidate's own name detected & stripped; full-text fallback to `summary` if no headings found.
2. PII stripped from each chunk (email, phone, address, **location**, postal, URLs) before embedding
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
- **2026-06-26 improvements:** personalized RAG retrieval query (uses role/experience/skills instead of a hardcoded string — different chunks per candidate); system+user prompts rewritten to force questions that reference the candidate's actual projects/companies/tools; full traceback logged on LLM failure (was a one-line swallow); `_fallback_questions` rewritten to be content-aware (uses up to 200 chars of real resume text per section with section-specific templates) instead of identical generic templates.

### Question difficulty ladder (added 2026-07-17, commit 1ab30c96) — easy → tricky
User requirement: interviews must OPEN on basics ("what is / why is" — TypeScript, OOP pillars, interface, variables, loops) and only then get tricky.
- Tiers `basic | intermediate | advanced` (`_TIER_*`, `_TIER_ORDER`); split `_BASIC_COUNT=2`, `_INTERMEDIATE_COUNT=2`, rest advanced (of `_MAX_QUESTIONS=6`).
- `_BASIC_CONCEPT_BANK`: keyword→2 easy concept Qs for typescript/javascript/react/python/java/c++/node/sql/mongo/oop/data, matched against `skills + role` lowercased; `_GENERIC_BASICS` (variable scope, for-vs-while, functions, array-vs-object) tops up unknown stacks. `_basic_questions()` builds them with section `"fundamentals"` and `_BASIC_SIGNALS`.
- **The old system prompt BANNED generic questions — that's why every interview opened at max difficulty.** Now the prompt mandates the ramp and asks for `difficulty_tier` per question.
- `_order_by_tier()` re-sorts (stable) so the ramp holds even if the LLM returns jumbled output; if the LLM emits no basic tier, real warm-ups are prepended. Unknown/missing tier defaults to intermediate (never jumps ahead of warm-ups).
- Advanced fallback Qs rewritten to be genuinely tricky (hardest bug → diagnosis → trade-off accepted → hindsight).
- `difficulty_tier` added to `GeneratedQuestion` (pydantic default "intermediate") + frontend `GeneratedQuestion` type (optional union). Frontend does not yet DISPLAY the tier — possible future polish (e.g. badge per question).

### Web-researched question blending (added 2026-07-02)
- `question_research_service.research_common_questions(role, experience, skills)` → `{topics[], common_questions[], source}` — Gemini + `tools=[{"google_search": {}}]` grounding (free tier) researches what interviewers most commonly ask this profile; fallback chain: grounded web → ungrounded LLM knowledge → None. Never raises. Cached per (role, experience, top-5 skills) for process lifetime — wizard roles are a fixed set, so repeats cost 0 API calls.
- `question_service.generate_questions(..., research=)` blends it: LLM prompt gets a research block + instruction "4 resume-grounded + 2 adapted from commonly-asked, personalized to the resume". Deterministic fallback also appends up to 2 researched questions (section `"industry"`).
- Route `/questions/generate` calls research before generation (best-effort). Config flag `ENABLE_QUESTION_RESEARCH` (default True). Response schema unchanged — frontend untouched.
- Live-tested 2026-07-02: grounded search returned source=web with 8 topics + 10 real questions for "Frontend Developer / 2-4 years / React+TypeScript"; cache hit confirmed.

### Gemini model quota (root cause of "same questions every time") — RESOLVED 2026-06-26
- **Root cause:** `gemini-2.0-flash` returned HTTP 429 `RESOURCE_EXHAUSTED` with **`limit: 0`** (free-tier daily quota gone). LLM never succeeded → BOTH question generation AND resume parsing silently fell back to deterministic paths → near-identical output every run. NOT a prompt problem.
- **FIX APPLIED:** switched `.env` `GOOGLE_CHAT_MODEL` from `gemini-2.0-flash` → **`gemini-2.5-flash`** (config.py default still says 2.0-flash; .env overrides). Live-tested 2026-06-26: gemini-2.5-flash responds OK, quota available.
- If 2.5-flash quota also runs out later: try `gemini-1.5-flash`, rotate `GOOGLE_API_KEY`, or enable billing. Deterministic fallbacks remain as a safety net.
- Deprecation warning: `langchain-google-genai` 2.0.10 uses the deprecated `google.generativeai` package; migrate to `google.genai` eventually.

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
- Dashboard analytics are still mock data (charts, stats, upcoming interviews, recent attempts, achievements). Wiring them to real data was attempted twice on 2026-07-30 and reverted at the user's request — see "Dashboard/profile merge — REVERTED" before trying again.
- Profile page has no editing capability yet (data is real and server-fed; only editing is missing)

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
| Dashboard real analytics | ❌ Not started (attempted + reverted 2026-07-30) |
| Profile editing | ❌ Not started |
| "Use Existing Profile" flow | ❌ Not started |
| Interview list / history | ✅ Done (GET /interview/list + history on profile) |
| Profile shows real per-user data | ✅ Done (GET /user/overview) |
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

## Job Search Agent — BUILD IN PROGRESS (started 2026-07-13)
**Phase 0 (schema) — ✅ DONE & verified.** `app/models/job_search.py`: `JobSearchProfile` (1 per user, UNIQUE user_id; `resume_document_id` FK → reuses already-embedded resume; `target_designations` JSON, user-overridable; `setup_source`), `TargetCompany` (ATS registry: `ats_type`+`board_slug`, UNIQUE together), `JobListing` (dedup UNIQUE(source, external_id) + `content_hash`), `JobMatch` (UNIQUE(user_id, job_listing_id); `status` new→reviewed→pending_apply→applied→dismissed, `pending_reason`, `apply_url`, `match_score`, `match_reasons`). Registered in `models/__init__.py`. Manual SQL: `migrations/phase7_job_search.sql` (idempotent, PG). create_all verified on SQLite.
**Phase 1 (connectors) — ✅ Greenhouse DONE & live-verified** (46 real jobs from GitLab board). `app/services/job_sources/`: `base.py` (RawJob dataclass, ATSConnector base, registry `get_connector`/`register_connector`, `strip_html`, `compute_job_hash`, `title_matches_designations` keyword pre-filter), `greenhouse.py` (public `boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true`; pure `parse_jobs()` unit-testable offline; never raises → []). Config flags in config.py: `ENABLE_JOB_SEARCH`, `JOB_SEARCH_HTTP_TIMEOUT=20`, `JOB_SEARCH_MAX_PER_COMPANY=200`, `JOB_LISTINGS_COLLECTION`. **TODO connectors:** Lever (`api.lever.co/v0/postings/{slug}`), Workday (PwC/EY/Deloitte).
**Phase 2 (matching + endpoints + frontend) — ✅ DONE & verified 2026-07-13.**
- **Backend:** `app/services/job_search_service.py` — job-vs-chunks matching (CONFIRMED method): one batched `embed_documents` call per run for NEW job descriptions only, then `similarity_search_with_score_by_vector` against the user's EXISTING resume chunk vectors (filter `{user_id, resume_document_id}`); resume NEVER re-embedded; listing scored at most once per user (UNIQUE(user_id, listing)). **`_canonical_vector_doc_id`**: dedup-copied resumes keep the ORIGINAL doc id in vector metadata, so vector filters resolve via EmbeddingCache → source_resume_document_id (critical—filtering by the copy's id returns nothing). Degradation: embeddings fail → `_keyword_score` (token overlap, 30–70); LLM fail → match stored without reasons; run never 500s. Score = 100·(0.6·best + 0.4·avg) of top-4 sims (sim = 1−cosine dist). `_MIN_STORE_SCORE=25` noise floor; `_LLM_REASON_TOP_N=10` (one batched Gemini call for fits/gaps). `suggest_designations`: Gemini 3–6 titles from parsed_sections, fallback = [resume.role].
- **Routes:** `app/routes/jobs.py` under `/jobs` (registered in main.py), all gated by `ENABLE_JOB_SEARCH` (503): POST designations/suggest, GET+POST setup, GET+POST companies (POST validates ats_type against connector registry), POST search, GET matches?status_filter=, PATCH matches/{id}. Schemas: `app/schemas/job_search_schema.py`.
- **Frontend:** `src/app/pages/jobs/jobs.tsx` (lazy route `/jobs` in App.tsx, ProtectedLayout) — boot: GET setup → 404 → setup mode (suggested designations as editable chips, add/remove, Save & Continue) else table mode (targeting line, [Re-setup] pre-fills saved chips, [Search Now] 120s timeout). Status table: Company|Role(+fits under title)|Location|Match%|Status badge|Actions (Apply→ opens url + auto-marks reviewed, Mark Applied, Dismiss); pending_reason shown under Pending badge; filter chips All/New/Pending/Applied/Dismissed. `src/api/jobService.ts` (types local, same pattern as userService), ENDPOINTS.JOBS in lib/config.ts, "Job Search" nav (Briefcase icon) in header desktop dropdown + mobile menu.
- **Verified:** backend functional test (SQLite, fake connector, no-network): designation fallback, setup upsert (1 row), search run (3 listings→3 matches), full dedup on 2nd run (0 new), score ordering, status update+filter, 422s. App boots with 8 /jobs routes. Frontend: tsc clean + vite build pass.
- **Schema note:** all 4 job tables are NEW tables → create_all creates them on next boot automatically; phase7_job_search.sql only needed where create_all doesn't run.
- **Remaining:** Phase 3 scheduler+digest; Lever/Workday connectors (PwC/EY/Deloitte are Workday); Phase 4 assisted pre-fill; seed target_companies rows (POST /jobs/companies).
- **Uncommitted:** ALL job-search code (Phases 0–2) written & verified but NOT committed. Earlier flow-gap fixes pushed as 6261eea0.

## Proposed Feature — Job Search Agent (design locked 2026-07-13)
User idea: an agent that finds relevant job openings per the user's profile and reports them, since users forget to check portals daily. Design locked with user (roadmap only, no code yet):
- **Apply mode:** ASSISTED, not auto-submit. Frontend `/jobs` **status table** (Company | Role | Location | Match % | Status | Action/Reason). Statuses on `job_matches`: `new → reviewed → pending_apply → applied → dismissed`. When agent can't safely auto-fill (CAPTCHA / SSO login wall / non-standard form) → status **Pending** + reason string + direct apply URL so user finishes manually. No fully-autonomous submit (ban / ToS / CAPTCHA risk).
- **Sourcing = company career pages via ATS JSON connectors** (not HTML scraping): one connector per ATS covers many firms. Workday (PwC/Deloitte/EY), Greenhouse (`boards-api.greenhouse.io/v1/boards/{company}/jobs`), Lever (`api.lever.co/v0/postings/{company}`). Config table `target_companies (name, ats_type, board_slug)` — add a company = one row. Uniform interface `search(profile) -> List[RawJob]`.
- **Matching reuses existing resume RAG:** embed job description → similarity vs resume chunks → Gemini re-rank + "why fits / gaps". Dedup jobs via `content_hash` (same pattern as EmbeddingCache).
- **Tables (Phase 0, manual SQL — no Alembic):** `job_search_profiles`, `job_listings`, `job_matches`, `target_companies`.
- **Scheduling (Phase 3):** APScheduler in-process (fits no-Docker scale) → daily digest (not every run) + "New" badge.
- **Build order:** Phase 0 schema → Phase 1 Greenhouse connector first (then Lever, Workday) → Phase 2 match + status table → Phase 3 scheduler → Phase 4 assisted pre-fill via browser tools (user clicks final submit).
- **Job side has its OWN resume choice (2026-07-17, commit 42f4bb0c):** `GET /jobs/resumes` → `job_search_service.list_resumes()` returns the user's indexed resumes (id, file_name, role, experience, skills[:8], source, created_at), newest first. Job setup renders selectable resume cards ("Resume for job search") ABOVE the designation chips, explicitly stating it's separate from the interview's resume; empty state links to /interview/select-role to upload. Selected id is sent as `resume_document_id` on save and pre-selected from the saved setup on re-setup. Step 1 label = "Resume & targets". **Note: uploading a NEW resume from the job side isn't possible yet — `index_resume` is coupled to interview_id/setup_id; jobs can only choose among already-indexed resumes.**
- **Setup flow (mirrors interview wizard):** one-time setup saved to `job_search_profiles`; on return, auto-load saved setup + show only a **[Re-setup]** button. If no setup / profile incomplete → show TWO options like interview step 2: "Go with Profile" vs "Go with Resume" (reuses `profileOption: "upload"|"existing"` pattern). **Ship resume-only first** — "Go with Profile" (existing-profile) deferred until interview flow's existing-profile path is wired.
- **Designations = auto-derived default, USER-OVERRIDABLE, NOT permanent:** one resume → many target roles. Gemini derives candidate designations from the resume (add to resume_parser/question flow: "suggest 3–5 job titles this person qualifies for") → pre-fill an **editable multi-select chip list** → user can remove/edit/**add a totally different role** (e.g. profile is Python-only but user now wants Frontend Developer). Choice applies to THIS setup only; Re-setup overwrites the row — designations are never permanently tied to the profile. Each chip feeds the ATS connectors in parallel; status table spans all designations at once.
- **Phase 0 `job_search_profiles` cols:** `target_designations` (JSONType array, editable per setup), `setup_source` (`resume` now; `profile` later), `resume_document_id` FK.

## Active Project — 3D/Animated UI Conversion (started 2026-07-14, PHASED + APPROVAL-GATED)
User-directed redesign: modern animated/tastefully-3D UI, **home page (landing.tsx) first** as reference implementation, then screen-by-screen rollout. HARD CONSTRAINTS: preserve all functionality/logic exactly (visual layer only); no unsolicited refactoring; match existing stack (React 19 + Tailwind 3 + shadcn-style + Framer Motion); honor prefers-reduced-motion; lazy-load 3D/GSAP; approval gate after EVERY phase (stop until user says "approved"). References: 21st.dev components (arc-gallery-hero, limelight-nav, testimonials, image-swiper, interactive-selector, social-icon) + GSAP scroll choreography.
**Phase 0 (discovery) — DONE 2026-07-14, awaiting approval.** Key findings:
- Pure CSR SPA (Vite 7.2.4, React 19.2, createRoot, Netlify static + SPA redirect) — NO SSR → no hydration risk for 3D; StrictMode ON (GSAP/R3F need proper cleanup; use useGSAP).
- Tailwind **v3** (3.4.18, darkMode class) + full shadcn token set in index.css (brand = violet-600→cyan-500 gradient tokens, --radius 0.5rem). 8 hand-copied shadcn/ui primitives; **NO components.json** (shadcn CLI never init'd — 21st.dev `npx shadcn add` won't work as-is). tailwindcss-animate present.
- Mixed theming convention: landing/header branch on `isDark` boolean per class string; rest uses `dark:` variants. Standardize new work on `dark:` + tokens.
- Landing page: 581-line self-contained component, deps = useTheme + local state ONLY, all content hardcoded arrays, no API calls. Sections: nav→hero(2col+stats)→how-it-works(3)→features(6)→tracks(6)→CTA→footer.
- ⚠️ Landing hero image HOTLINKED from huru.ai (competitor asset — replace); all landing nav/CTAs are plain `<a href>` = full page reloads (converting to router Link = behavior change, needs user decision in Phase 1); index.html title still "react-ts".
- Animation today: Framer Motion 12.23.26 (house lib; entrance/whileInView/whileHover), NO GSAP, NO three/R3F, **ZERO prefers-reduced-motion handling anywhere** (top a11y gap — Phase 2 foundation must add).
- React 19 pins: @react-three/fiber must be v9.x + drei 10.x (v8 incompatible); GSAP framework-agnostic OK.
- Bundle baseline for `/` (gzip): shared index 139.58 kB + landing chunk 5.19 kB + CSS 11.68 kB ≈ **156 kB**. No perf budget tooling exists.
- No CSP anywhere (WebGL unobstructed). Likely mid-range-mobile audience → scope 3D to single lazy hero element, DPR clamp.
- 🔴 Repo hygiene: ALL Job Search code (Phases 0–2) still uncommitted on main — commit BEFORE Phase 2 touches shared files.
**Phase 0 approved implicitly 2026-07-14 (user: "ok first commited then go next"); job-search work committed (6a30626c) + skill (0daff39e), pushed to origin/main — repo clean.**
**Phase 1 (strategy, no code) — DONE 2026-07-14, awaiting approval.** Plan highlights:
- Animation: **Framer Motion primary** (house lib, 0 new bundle; MotionConfig reducedMotion="user" global). **GSAP deferred** — only if a scrub-pinned sequence gets approved (then gsap + @gsap/react lazy in landing chunk).
- 3D: recommended **Option B = CSS-3D only** (arc hero perspective + pointer tilt, 0 kB) over A (R3F v9+drei deferred ~200 kB chunk) or C (B now, A later). USER DECIDES.
- 21st.dev: init shadcn CLI components.json (aliases exist, lib/utils.ts cn confirmed); install refs via `npx shadcn add <url>` one at a time, report deps before proceeding (pages are client-rendered — dep lists only visible at install); token pass per component (brand vars, dark: variants, cn()).
- Motion tokens (src/lib/motion.ts + src/components/motion/): fast 150/base 300/slow 500/hero 800ms; out-quint [0.22,1,0.36,1] entrances, spring 260/22 interactive; stagger 70ms cap 600ms; whileInView once -80px; no scroll-jack/pin v1. Reduced motion: instant transforms, ambient loops off, 3D never mounts.
- Mapping: limelight→nav, arc hero→hero (replaces hotlinked huru.ai img with local WebPs), interactive selector→Tracks, swiper→new product-tour strip, testimonials→new section (needs copy), social icons→footer.
- HARD BUDGET: initial home JS ≤160 kB gzip (baseline 145), CLS<0.1, transform/opacity only; 3D chunk (if A) ≤200 kB deferred.
- Phase 2 files: components.json, lib/motion.ts, components/motion/*, MotionConfig in main.tsx (only shared-file edit). Phase 3: components/landing/*, landing.tsx recomposed, src/assets/landing/.
- OPEN DECISIONS for user: (1) 3D option A/B/C; (2) keep `<a href>` reloads vs SPA Link; (3) fix index.html title/favicon; (4) placeholder testimonials OK.
**Phase 1 approved 2026-07-14 ("approval", no decision answers → defaults locked: Option B CSS-3D no new deps, keep `<a href>` reloads, fix title/favicon in P3, placeholder testimonials).**
**Phase 2 (foundation) — DONE 2026-07-14, awaiting approval.** Built:
- **21st.dev registry is now AUTH-GATED** (CLI 401 "Authentication required"; site copyGuard blocks anonymous copy; probed /r/, api., /api/r/ = 403; no public mirrors). AskUserQuestion went unanswered → proceeded with **faithful equivalents** built in-house (folded into the approved FM+Tailwind+tokens approach). If user later provides a 21st.dev API key, exact originals can drop into the same paths/props.
- 6 ui components (UNWIRED — nothing imports them until Phase 3): `components/ui/arc-gallery-hero.tsx` (fan-arc images, rotate→translate→counter-rotate, stagger entrance, CLS-safe reserved height), `limelight-nav.tsx` (layoutId="limelight" sliding glow pill, plain <a href> preserved), `testimonials.tsx` (stagger grid), `image-swiper.tsx` (FM drag, no embla; arrows/dots; NO autoplay by policy), `interactive-selector.tsx` (layout-animated expanding panels, vertical on mobile), `social-icons.tsx` (spring hover, gradient fill).
- Motion layer: `lib/motion.ts` (DUR fast/base/slow/hero .15/.3/.5/.8s, EASE_OUT [0.22,1,0.36,1], SPRING 260/22, STAGGER .07, VIEWPORT once -80px, variants fadeUp/fadeIn/scaleIn/staggerParent/staggerChild); `components/motion/reveal.tsx`, `stagger.tsx` (StaggerGroup/StaggerItem), `use-motion-safe.ts` (gates ambient/decorative motion).
- **main.tsx wrapped in `<MotionConfig reducedMotion="user">`** — app-wide OS reduced-motion compliance (the a11y gap from Phase 0, closed).
- `components.json` hand-written (shadcn CLI config; aliases → @/components, @/lib/utils) — enables future `npx shadcn add` (needs 21st.dev key for their registry).
- `.claude/launch.json` created (frontend dev server config for browser preview tooling).
- **Verified:** tsc clean, eslint clean on all new files, vite build OK. Landing chunk **byte-identical** 19.34 kB/5.19 gzip; index +0.29 kB raw (MotionConfig), gzip 139.58→139.46; CSS +0.51 kB gzip (Tailwind scans new files). Live render check on user's running dev server (localhost:5173): all sections present, zero console errors. NOTE: browser-pane screenshots time out in this env — verification via a11y text + console.
- No heavy deps added (Option B) → nothing to lazy-load yet; ui components join the landing chunk only when imported in Phase 3.
**2026-07-14: USER LIFTED APPROVAL GATES ("you dont wait for approval you have free hand to change") — proceed autonomously; other hard constraints (logic untouched, budget, reduced-motion) still apply.**
**Phase 3 (home page rebuild) — DONE 2026-07-14.** landing.tsx recomposed on the foundation:
- Limelight nav (desktop; same 5 links), arc-gallery hero (8 local SVG cards replace hotlinked huru.ai image + floating card), stats stagger, How-It-Works + Features on StaggerGroup, Tracks → InteractiveSelector (Start Practice stays NON-navigating — preserved dead UI from before; wire to /demo later if wanted), NEW product-tour ImageSwiper (3 SVG slides), NEW Testimonials (3 placeholder quotes marked in code comment), CTA + footer (SocialIcons, same # hrefs), "Made with ❤️" char fixed.
- 11 brand SVGs in src/assets/landing/ (arc-{interview,score,question,analytics,resume,voice,feedback,offer}, tour-{dashboard,interview,results}) — each <4 kB → Vite INLINES them into the landing chunk (zero extra requests). public/favicon.svg + index.html title "TalentPulseAI — AI-Powered Mock Interviews".
- Content arrays (tracks/features/steps/stats), all hrefs, useTheme/isDark handling: VERBATIM from old page. Only state dep still useTheme + mobileMenuOpen.
- **Verified:** tsc+eslint+build pass; initial home JS 139.45+12.96+1.62 ≈ **154 kB gzip ≤ 160 budget** (baseline ~145; landing chunk 5.19→12.96 due to inlined SVGs); CSS 12.16 ≤ 15. Live render on user's dev server: all sections, ZERO console errors; JS assertions: 11/11 images load (0 broken), swiper arrows+3 dots, nav hrefs exactly [#features,#how-it-works,#tracks,/explore,/demo,/auth/login,/auth/register].
- Deviation from P1 plan noted: sections kept inline in landing.tsx (single-file convention) instead of components/landing/* split.
**Landing v2 (bold redesign) — DONE 2026-07-14 (commit 51d1bb0d).** User rejected the conservative facelift ("you work according to previous ui i want major changes fully animation attractive") with refs: SPYLT Milk, Kumo matcha, Web3 marketplace dribbble, dock.cool, voltlites, opacity.com → direction = type-first, immersive, award-site energy. **DESIGN LANGUAGE NOW = BOLD** (use this for all future screens, NOT the old conservative style):
- Giant uppercase display type: `font-display` = Space Grotesk Variable (@fontsource-variable/space-grotesk 5.2.10, self-hosted; `@import` at top of index.css; tailwind fontFamily.display). Headings `text-[clamp(...)] font-bold uppercase tracking-tight leading-none`, gradient keyword spans.
- Hero: word-stagger headline, 6 floating arc-SVG cards (FloatingCard local comp: scroll parallax via useScroll+useTransform on outer, infinite float loop on inner; hidden below md), glow orbs + masked dot-grid, cursor-follow glow (useMotionValue+useSpring; gated motionSafe && pointer:fine), hero text drifts/fades on scroll, scroll progress bar (fixed top, spring scaleX).
- `ui/marquee.tsx` (pure-CSS infinite loop: duplicated row, translateX -50% keyframes in tailwind.config `marquee`/`marquee-reverse` 28s; motion-reduce:animate-none; one band tilted -rotate-1 gradient, one reversed subdued).
- `motion/count-up.tsx` (parses "50K+"→50+"K+"; animate() on useInView once; static under reduced motion; verified settles exact: 50K+/85%/24/7→"24"+"/7" works/4.9★). NOTE eslint react-hooks/set-state-in-effect: don't setState sync in effect body — derive static branch at render.
- Sections: outline-number rows ([-webkit-text-stroke:2px_rgba(...)] + text-transparent), bento features grid (md:grid-cols-4, cards 0&5 col-span-2, hover glow blob), swiper in gradient glow frame, massive CTA.
- Scroll-linked style={{y}} transforms BYPASS MotionConfig reducedMotion → always gate with useMotionSafe.
- Budget: initial JS 139.66+19.99+1.62 ≈ **161.3 kB gzip (1.3 over 160 target — accepted/disclosed)**; fonts = separate woff2 assets (~48 kB, latin+ext+viet subsets).
- ArcGalleryHero component now UNUSED by landing (kept in ui/ for reuse).
- Verify count-up in browser: element text is lowercase in textContent (CSS uppercase is render-only); IO fires only if element actually crosses viewport — instant scrolls can jump past.
**Landing v2.1 (user's 2nd reference batch) — DONE 2026-07-14 (commit 03868a34).** User referenced 4 more 21st.dev components + clip-path image effects → implemented as equivalents (registry still auth-gated):
- `ui/card-stack.tsx` (ruixen.ui/card-stack): depth-stacked deck, front card drag-to-dismiss (>90px), auto-cycle 4.5s (pause on hover, off under reduced motion, click-to-cycle fallback). USED FOR TESTIMONIALS. Cards need OPAQUE bg (bg-slate-900 / bg-white) — translucent glass shows stacked cards through each other.
- `ui/circular-flip-gallery.tsx` (minhxthanh/circular-flip-card-gallery): ring via rotate(θ)+translateX(r)+rotate(−θ); container `animate-spin-slow`, per-card `animate-spin-reverse` (same 45s linear — cards stay upright); hover/focus flip via [transform-style:preserve-3d]+[backface-visibility:hidden] rotateY 180; dashed ring guide; **md+ only — mobile renders flip-card grid**. USED FOR TRACKS (front: emoji+name, back: topics+Start Practice — still non-navigating).
- `ui/image-auto-slider.tsx` (waleedkibhen/image-auto-slider): reuses animate-marquee keyframe with images (alternating ±rotate-1), hover pause, motion-reduce freeze. Replaced the 2nd text marquee (tour + arc SVG mix).
- `motion/clip-reveal.tsx` (uilayout.contact/clip-path-image effect): clipPath inset curtain wipe on whileInView (left/right/bottom). **clipPath is NOT gated by MotionConfig reducedMotion → gates via useMotionSafe (renders plain div)**. Applied to the tour swiper.
- Hero: floating cards REPLACED by ArcGalleryHero fan (user re-referenced arc-gallery-hero; component back in use). Kept cursor glow, word-stagger, hero scroll drift.
- tailwind.config: added `spin-slow`/`spin-reverse` keyframes (45s linear infinite).
- Verified live: 0 console errors, 23/23 imgs, ring+slider+stack in DOM; landing chunk 21.10 kB gzip (total ≈162.4). NOTE: innerText checks must account for CSS `uppercase`/lowercase — use case-insensitive matching.
- Now UNUSED by landing (kept in ui/ for app-screen reuse): interactive-selector, testimonials, marquee still used (band 1).
**Fan CardStack adoption — DONE 2026-07-14 (commit be08a7f5).** User pasted the REAL 21st.dev @ruixen.ui/card-stack source ("apply this instead of current changes") → `ui/card-stack.tsx` fully replaced with it (fan arc: rotateZ spread/translateZ depth/rotateX tilt, active lifted+scaled, click/drag/arrow-keys/dots, loop+autoplay w/ hover pause, native useReducedMotion). API: `items: CardStackItem[]` (id/title/description + extra fields flow via generics) + `renderCard(item,{active})`. Adaptations: no "use client"/next-link (plain <a>); PanInfo-typed drag; **local cn join — importing lib/utils cn pulls tailwind-merge into the chunk (+8 kB gzip)**; dots explicit palette (`bg-foreground/30` silently fails — tokens lack <alpha-value>). Wired: features (icon renderCard, 3.2s autoplay — **orbit ring + TiltCard layout REMOVED per user**; motion/tilt-card.tsx kept unused) + testimonials (quote cards 4.5s). `stackCardWidth = min(520, innerWidth-72)` computed once in landing. Verified: dot-nav + auto-advance live, 0 new runtime errors trapped over 4s (stale HMR errors in console buffer reference old ?t= module — ignore). Landing 22.27 kB gzip.
**Features section rework (superseded by fan CardStack above) — was 2026-07-14 (commit 9138f4bc).** User screenshot feedback: bento grid → (right) **CardStack of the 6 feature cards** (auto-cycle 3.8s, drag-to-dismiss) each wrapped in NEW `motion/tilt-card.tsx` (**cursor-rotate 3D tilt**: rotateX/rotateY useSpring follow pointer, ±10° default; [perspective:1000px] on wrapper; gated motion-safe + pointer:fine); (left) heading + **orbiting icon ring** — 6 feature icons revolve around a glowing gradient hub (same spin-slow/spin-reverse counter-rotation pattern, radius 140, dashed guide, hidden below sm). Verified live: 0 console errors, 1 ring + 6 counter-spin icons + 4 stacked cards w/ correct titles. Landing chunk 21.50 kB gzip. GOTCHA: innerText may omit text inside transformed/stacked absolute elements — assert via textContent.
**Phase 4 rollout — DONE 2026-07-14 (commit 3c6d65a5).** Design language applied to ALL app screens (visual-layer only, logic untouched): font-display uppercase h1s + gradient keyword span on auth login/register, select-role, select-profile, quick-setup, interview-result, interview-now (light), dashboard welcome, profile, jobs, users; dashboard StatCard values → CountUp; jobs page Reveal on setup panel + match table; auth layout pulses motion-reduce'd; header logo font-display. Verified: tsc + build clean (code-split rebalanced: landing 19.37 kB gzip), /auth/login live-checked (Space Grotesk uppercase, form intact). **PRE-EXISTING eslint errors confirmed at HEAD, NOT fixed (no-refactor rule): select-profile.tsx:310-311 conditional useState (real bug risk — spawn_task chip created), interview-result.tsx:44 preserve-manual-memoization.** Protected screens verified by tsc/build only (no test credentials).

## 3D UI Research (2026-07-15, deep-research run wf_5488ad87-6fc; verification layer rate-limited — claims assessed manually)
- **Costs (gzip):** OGL ~15–29 kB (zero-dep, framework-agnostic, shader-level) · three.js core ~155 kB · +R3F v9 ~51 kB (three+R3F+drei ≈ 210–240 kB, at/over our 200 kB deferred budget) · Spline runtime ~549 kB (OUT) · Rive canvas-lite WASM ~222 kB brotli (2D motion, not 3D).
- **React 19 pin:** R3F v9 only (v8=React 18); **pin >=9.5.0** — bundles own reconciler since React 19.2 broke reconciler compat (unconfirmed exact ver — check at install).
- **Perf/a11y rules:** lazy-mount canvas post-idle; frameloop="demand" (R3F) or own rAF + IntersectionObserver pause (OGL); DPR clamp 1–1.5 (drei PerformanceMonitor/regress()); draw calls < few hundred, instancing for particles; prefers-reduced-motion → never mount canvas (static gradient); **WCAG 2.2.2: ambient animation >5s needs a pause control**.
- **DECISION RECOMMENDED (not yet approved): OGL cursor-reactive shader hero (~20 kB)** behind arc hero; R3F v9.5+ single scene only as a later tier; avoid Spline/GLTF-scenes/scroll-jacked 3D storytelling.

## Auth model (updated 2026-07-15, commit e9aca76b)
- **User table now:** `id` (int PK, internal FK target — unchanged), **`public_id`** (uuid4 hex, unique, auto-gen — the external handle for profile/interviews/etc.), `email` (unique), **`phone`** (unique, nullable at DB for legacy rows but REQUIRED by register API), `full_name`, `password`. Model default `_gen_public_id` fills public_id on INSERT.
- **Register (`signup_user`):** requires phone; 409 on dup email OR dup phone; phone normalized in `user_schema._normalize_phone` (optional leading `+`, digits only → "+91 98765 43210" == "+919876543210"). Previously the frontend already sent phone/full_name but `UserCreate` dropped them — now stored.
- **login + register responses include `user` {public_id,email,phone,full_name}**; auth-context persists it (login stores `data.user`). Token still `sub=email` (get_current_user unchanged).
- **Migration:** `migrations/phase8_user_public_id_phone.sql` — MUST run on existing DBs; create_all only covers fresh DBs. Backfills public_id via gen_random_uuid, adds unique indexes on public_id+phone. **APPLIED to local dev PG 2026-07-17** (2 rows backfilled; register 201/login 200 verified live locally). **⚠️ NOT YET RUN ON SUPABASE (prod)** — deployed API boots (Supabase back up) but /auth/login returns **500** because users.public_id/phone don't exist there; user must paste the phase8 SQL into the Supabase SQL editor. No Supabase creds on this machine (local .env = localhost only).
- **Frontend:** RegisterRequest.phone required; UserProfile.public_id added; register password min 8 (was 6, mismatched backend); profile page shows "User ID" = public_id. Register form already had the phone field.
- **Client-side validation (commit cabfee3a):** `lib/validation.ts` (validateName/Email/Phone/Password mirror backend regexes: email `^[^@\s]+@[^@\s]+\.[^@\s]+$`, phone `^\+?[0-9][0-9\s\-()]{6,18}$`, password 8–72). Login + register forms: per-field inline errors (red ring + aria-invalid), validate on blur + submit, clear on edit, `noValidate` on <form> so JS owns messages. Login checks email shape + password PRESENCE only (no length rule; real-credential failures stay the server's generic 401). Verified live.
- **Google login: DEFERRED** (user chose skip — needs a Google Cloud OAuth client id). Google buttons on login/register are still inert placeholders.
- **public_id is the user-facing unique id;** interviews/profile still keyed internally by numeric user_id (user chose "add UUID, keep numeric PK" — NOT full re-key). Deeper wiring of public_id into interview/job records is future work if wanted.
- Verified via SQLite functional test (7 cases) + tsc/build; NOT browser-e2e'd (needs phase8 SQL on a live DB first).

## Public site structure (2026-07-17, commit e7288871) — parent + two product pages
- **`/` = PARENT landing** (`app/pages/landing.tsx`): advertises BOTH sides, header has login/sign-up, dual hero CTA ("I want to practice" / "I want a job"), then the **"Pick Your Side" split** — `SIDES` array rendered as two panels; hovering one animates `flexGrow: 1.35` and dims the other to 0.62 (framer `layout` + spring). Then shared flow (`FLOW`: one resume → both engines), stats CountUp, testimonials CardStack, dual CTA.
- **`/practice`** (`app/pages/practice.tsx`) = interview product page — this is the OLD landing content (arc hero, features fan, flip-ring tracks, tour swiper), copied and re-shelled. Cross-links to /find-jobs.
- **`/find-jobs`** (`app/pages/find-jobs.tsx`) = the parallel job product page — agent hero (cyan/emerald accent vs violet), 3-step how-it-works, feature CardStack fan (image-filled), ImageAutoSlider band, **static demo status table** (Applied/Pending+reason/New) under ClipReveal. Cross-links to /practice.
- **Shared shell:** `components/landing/site-header.tsx` (logo→/, LimelightNav from `navItems` prop, theme toggle, Login + Get Started, mobile menu) and `site-footer.tsx` (Product column links both sides). Both use plain `<a>` = full page loads, matching prior landing behavior.
- Route registration in App.tsx (lazy). **Colour convention: interview side = violet/fuchsia, job side = cyan/emerald**, parent uses both.
- Chunk sizes gzip: landing 5.31 (was ~22 — heavy components moved out), practice 8.32, find-jobs 5.48.
- Verified live: all three render, cross-links present, 0 broken images, 0 console errors.

## App information architecture (2026-07-17, commit c49ddb98) — CURRENT
```
PUBLIC      /            parent landing (advertises both, login/signup)
            /practice    interview product page
            /find-jobs   job product page
            /auth/login, /auth/register
APP (protected, shared Header)
  COMMON    /dashboard   THE HUB (both sides launch from here)
            /profile     account (shows public_id)
  SIDE A    /interview/select-role → select-profile → quick-setup → start → result
  SIDE B    /jobs        setup → search → matches table
```
- **`components/app-nav.tsx`** (replaced `mode-switch.tsx`, deleted): ONE primary nav, four destinations **Home · Dashboard · Interview · Jobs**, sliding pill `layoutId="app-nav-pill"`. **Home (`/`) uses `exact: true`** — every path startsWith "/" so it would otherwise always match; `activeId` checks non-exact sections FIRST, then exact, so /dashboard etc. win. Active state from `pathname.startsWith(match)`; **shared pages like /profile intentionally highlight nothing** (the old 2-item switcher wrongly showed Interview active everywhere). Re-clicking the current section is a no-op (preserves in-flow progress). Props `stacked`/`onNavigate` for mobile.
- **Header:** logo → `/dashboard` (the hub, not landing); avatar dropdown is **account-only** (Profile, Logout) — destinations live in AppNav; mobile menu uses stacked AppNav, duplicates removed. "Quick Interview" button is `lg:` only.
- **Dashboard = hub:** two launcher cards at top (Interview Practice → /interview/select-role, Job Search → /jobs) with side accent colours, above the existing (still mock) stats.
- **Profile:** quick links to Dashboard / Start interview / Find jobs so it isn't a dead end.
- Convention reminder: interview side = violet/fuchsia, job side = cyan/emerald.

## Profile = real per-user account page (2026-07-29) — access-scoped, latest interview status, resumes
User ask: "full flow — show profile according to access per user, latest interview status, resume profile."
- **`GET /user/overview`** (`routes/user.py` → NEW `services/user_service.py::get_overview`) is the single payload the profile page needs. Everything is derived from the JWT's `current_user` — **no client-supplied user id anywhere**, so cross-user reads are impossible by construction (verified: 44-case SQLite functional test incl. Alice-cannot-see-Bob assertions).
  Shape: `user{public_id,email,full_name,phone}`, `stats{total_interviews,completed,unfinished,average_score,best_score}`, `latest_interview`, `latest_completed`, `recent_completed[≤5]`, `resumes[]`.
- **`GET /user/profile`** extended to return `public_id/full_name/phone` (was only `id`+`email`).
- **`GET /interview/list`** added — **must stay registered ABOVE `/{interview_id}`** or the literal path is swallowed by the catch-all (asserted in the test).
- `interview_service.summarize_interview()` / `list_interviews()` produce flat per-interview summaries that deliberately **omit the `answers`/`feedback` blobs** (only `score` is lifted out).
- **`latest_completed` vs `latest_interview` — the important subtlety.** A row is INSERTed the moment the setup wizard finishes, so abandoned setups are the norm, not an edge case (local dev DB: user 1 has **27 interviews, only 4 submitted**). Taking `interviews[0]` would mean the profile almost always headlines an abandoned stub and hides the user's real last score. The page therefore headlines `latest_completed`, and separately discloses the unfinished setup ("It can't be resumed — start a new interview").
- **`recent_completed` is scored-only** so history isn't a wall of "Not completed" stubs; truncation is disclosed ("showing 5 of N completed") because `stats.completed` carries the true count.
- **`feedback["total_questions"]`** is now written by `submit_interview` (count of the `questions` array in the submit payload) — stored **inside the existing feedback JSON, so no migration**. Without it, a report reopened later reported "answered 3/3" for an interview where 3 of 8 were answered. Absent on rows submitted before this change → falls back to `question_feedback.length`.
- **This page is CURRENT and lives at `/profile`.** A merge into the dashboard was tried on 2026-07-30 and fully reverted — see "Dashboard/profile merge — ATTEMPTED TWICE AND REVERTED".
- **Layout = 3 VERTICAL PARTITIONS (2026-07-30).** User feedback: "length very large and not width … summarise the screen like vertical partitions" — the old `max-w-4xl` single column scrolled for ~2 screens on a wide monitor. Now `max-w-7xl` with: header (title + the 3 action buttons on ONE row), a 4-tile stat strip (`grid-cols-2 lg:grid-cols-4`: Completed · Not completed · Average · Best — replaces the "Practice So Far" sentence), then `grid items-start gap-6 lg:grid-cols-3` = **Account | Interviews | Resumes & documents**. Each partition is a bordered panel with an icon header via the local `panelHeading()` helper. `items-start` stops short panels stretching. Dates in the partitions use `formatShortDate` to keep lines from wrapping. Verified at 1600×900: three 389px columns, whole page fits in ONE viewport (docHeight 900, no scroll, was ~2 screens); stacks to one column at 375px with no horizontal overflow. Content and logic unchanged — reflow only.
- **Frontend** `profile/profile.tsx`: server is the source of truth, cached login payload is the fallback. `openReport(interviewId)` fetches `GET /interview/{id}/results`, writes the same `{result,totalQuestions,answeredQuestions}` shape + `talentpulse_last_result` sessionStorage key that a fresh submit writes, then navigates to `/interview/result` — so the existing report page works unchanged and survives refresh. `getUserOverview()` in `api/userService.ts`; `ENDPOINTS.PROFILE.OVERVIEW`.
- **Never assert emptiness you can't verify:** `dataLoaded = overview !== null` gates every empty state. On a failed fetch the page says "couldn't be loaded", NOT "no interviews"/"no resume" (that bug shipped briefly and was caught live by stopping the backend).
- **Status vocabulary:** the backend only ever writes `initialized` or `submitted` (3 write sites, verified). UI labels them "Not completed" / "Completed" — **never "In progress"**, and never offers to resume: no questions/answers exist server-side before submit, so resumption is impossible.
- Verified: 44/44 backend checks; tsc + eslint + build clean; live on localhost with 4 seeded interviews — populated, empty, and API-down states all correct, 0 console errors, report round-trip + refresh OK.
- **Deferred (found by review, NOT fixed — all pre-existing or out of scope):** `talentpulse_last_result` is not cleared by `authService.clearClientSession()` → a report can outlive logout in a shared tab (fix: add the removeItem there; also covers interview-now.tsx:317); `axiosInstance` only rewrites `error.message` for timeouts, so inline banners app-wide show axios's generic string instead of the FastAPI `detail`; **dashboard is still mock and now visibly contradicts the profile's real numbers** (feed it this same endpoint); `/user/profile` still returns the internal sequential `id`; `list_resumes` is reached through `job_search_service`, bypassing the `ENABLE_JOB_SEARCH` gate (flag is never actually false); no pagination for >5 completed and `/interview/list` is unbounded + currently unused; "Change Password" is an inert button with full affordance.
- **Local dev seeded test data:** `localtest10413@test.com` (user id 3) now has 4 seeded interviews (2 submitted 72/84, 1 initialized, 1 abandoned "Data Analyst") + 1 fake `sample-resume.pdf` row, added to verify this page. Delete by `interview_id LIKE 'interview_3_seed%'` if unwanted.
- `.claude/launch.json` gained a **`backend`** config (uvicorn --reload on 127.0.0.1:8000) so the API can be started via the preview tooling alongside `frontend`.

## Dashboard/profile merge — ATTEMPTED TWICE AND REVERTED (2026-07-30)
User asked to merge the profile into the dashboard ("dashboard profile merge give all detail in dashboard"), then rejected both attempts and asked for the original back: **"this is not look good please restore original dashboard and profile"**. `dashboard.tsx`, `profile.tsx`, `App.tsx`, `header.tsx`, `count-up.tsx`, `api/userService.ts` and `services/user_service.py` were all restored byte-identical to 753c1e02 (verified: empty diff). **Current state = separate `/dashboard` (mock) and `/profile` (real) pages.**
- **Attempt 1** rewrote the dashboard around `/user/overview` and **deleted** the un-backed sections (skill radar, Upcoming, Achievements, AI Suggestions, sidebar). Rejected: *"i want to like not remove anythings on dashboard keep everything only adjust"*.
- **Attempt 2** restored every section and added Latest Interview / Your Account / Resumes cards, wired real data into the stat cards + chart + Recent list, and badged the un-backed sections with an amber "Sample" chip. Also rejected on look.
- **Lesson for next time: don't restructure this dashboard.** The visual design is the user's, and they want it intact. If real analytics are wanted, change data sources in place without moving/removing/relabelling sections, and ask before adding badges or new cards.
- **What was reverted along with it** (all additive, all gone): `score_trend` on `/user/overview`; `ScoreTrendPoint`/`score_trend` in `api/userService.ts`; the `/profile` → `/dashboard` redirect; the header avatar item going to `/dashboard` and its "Account" relabel; `CountUp`'s `startOnMount` prop; `StatCard`'s `hint` prop.
- **KEPT (asked for separately, not part of the merge):** `auth-context.login` still navigates to **`/dashboard`** after login (was `/interview/select-role`). One-line change in `contexts/auth-context.tsx` if it should go back.
- 🔴 **`CountUp` gotcha still LIVE (fix was reverted):** `CountUp` is scroll-triggered (`useInView once`) and its display state starts at `"0" + suffix`, so **any counter below the fold reads `0` until scrolled into view** — confirmed live (dashboard stat cards showed 0/0/0/0% in a short viewport, then 24/15 after scrolling). Harmless for decorative marketing numbers; a real hazard if these ever show real data, because a lingering "0" is indistinguishable from a fact. The fix was an opt-in `startOnMount` prop (`shouldRun = startOnMount || inView`) — re-add it if real numbers land here.

## Two-sided workspace (2026-07-17, commit d764e52c) — SUPERSEDED by the IA above (ModeSwitch → AppNav)
The product is now explicitly **two sides: Interview practice + Job Search**, switched globally from the header.
- `components/mode-switch.tsx` — segmented control (researched pattern: segmented control in top bar for mutually-exclusive global modes; top bar owns app-wide things). Gradient pill slides via `layoutId="mode-switch-pill"` + SPRING. **Active side derived from `useLocation().pathname`** (`/jobs*` → jobs, else interview) so deep links/back-forward stay correct. Clicking the current side is a no-op (doesn't reset progress in that flow). Props: `stacked` (mobile full-width), `onNavigate` (closes mobile menu). Homes: interview → `/interview/select-role`, jobs → `/jobs`.
- Header: switcher centered desktop (`hidden md:block`), top of mobile menu; "Quick Interview" button demoted to `lg:flex` for space.
- `/jobs` restyled to mirror interview step pages: JOB AGENT badge chip, display headline "FIND YOUR NEXT ROLE", 3-step rail (`FLOW_STEPS`) driven by `activeStep = mode==="setup" ? 0 : matches.length===0 ? 1 : 2`. All setup/table logic untouched.
- **Local dev DB drift fixed same session:** `phase4_add_content_hash_and_embedding_cache.sql` had never been applied locally → `/jobs/designations/suggest` 500'd on `resume_documents.content_hash does not exist`. Applied; now returns a graceful 404 ("upload a resume first") for users with no resume. **Local dev DB has phase4 + phase8 applied as of 2026-07-17.**
- Local test account for verifying protected pages: `localtest10413@test.com` / `secret1234` (has NO resume — job flow stops at the resume-required step).

## DESIGN SYSTEM — CURRENT (2026-08-03) — "Direction C", supersedes the BOLD language
User compared the product to **coderbyte.com** and **flowmingo.ai** ("this is look like mature but our website like unmature") and asked for research → plan → centralize → change → review → market-standard review. Full teardown, plan and final review live in `Frontend/document/UI_AUDIT_AND_REDESIGN_PLAN.md` — **read it before touching UI**.
- **The 2026-07-14 "BOLD" language (uppercase Space Grotesk, violet→cyan gradients, marquees, card-stack fans, cursor glows) is RETIRED.** It was the cause of the "unmature" read. Do not restore it.
- **Direction C = restraint + one accent.** Tokens in `src/index.css` as `rgb(var(--x) / <alpha-value>)`: `ink / ink-muted / ink-subtle / ink-inverse`, `canvas / surface / surface-strong`, `overlay` (modal scrim — ink in light, black in dark, so it darkens in both), `border / border-strong`, `accent (+hover/text/soft/fg)`, `success / warning / danger (+soft, +danger-fg)`. **Pages must never use a raw palette class (`slate-*`, `violet-*`) or an `isDark ? … : …` colour ternary again** — `isDark` is only for theme-toggle icons.
- **CURRENT VALUES (light = the Stitch 3D-hero export, 2026-08-05 — third and latest hue change; blue `#2563EB` and violet `#7C3AED` are both superseded in light):** accent `#540DDD`, hover `#4E00D2`, accent-text **`#540DDD`** (deep enough to be type at 8.0:1, so light no longer needs a separate type violet), accent-soft `#E7DEFF`. **The page itself is lavender, not white:** canvas `#FBF8FF` (page AND card fill), surface `#F4F2FD`, surface-strong `#E3E1EC` (footer band + Progress/ScoreRing track). Lines carry the depth: border `#CAC3D9`, border-strong `#ADA4BF`. Text ink `#1A1B22` / ink-muted `#494456` / ink-subtle `#625C6E`. Status unchanged (`#067647` / `#B54708` / `#B42318`).
  - **Dark mode stays on the tuned violet `#7C3AED`** (canvas `#0C0B10`, surface `#141320`, surface-strong `#1A1826`, border `#2A2740`, accent-text `#C4B5FD`, accent-soft `#1E1633`) — `#540DDD` measures only **2.28:1 against the dark canvas**, failing the 3:1 leg of the squeeze below. The export is light-only, so the two themes legitimately differ in hue.
  - **Why cards did not need to become white:** the export's own cards are `bg-surface` = the *same* value as its `background`, lifted only by a 1px `outline-variant` border — which is exactly `Panel`'s `flat`/`raised` (`bg-canvas` + `border`). So tinting canvas reproduces the export without inverting the ladder. `Panel tone="muted"` / `Section tone="muted"` keep painting the recessed `surface` band.
  - **`ink-subtle` is the floor for type.** The export's `outline` `#7A7487` is the tone small labels want but measures **4.27:1** on the tinted canvas — under AA — so `#625C6E` is used for text and `#7A7487`-class values for lines only.
- 🔴 **`--danger-fg` exists because dark mode's `danger` is a LIGHT red.** A filled danger control takes `text-danger-fg` (white in light, near-black in dark) — hardcoding `text-white` gives 2.8:1 in dark. Same trap applies to any future filled status control.
- 🔴 **The dark accent is boxed in on three sides:** white label on it ≥4.5:1, and ≥3:1 against BOTH `canvas` and `surface-strong` (the track behind Progress and ScoreRing). `#265BD6` passed the first two and failed the track at 2.79:1 — hence `#3569DE`. Re-check all three before touching it.
- Type: **Inter Variable** (`@fontsource-variable/inter`), scale `display/h1/h2/h3/h4/lead/body/small/overline` in tailwind.config, **recalibrated 2026-08-05 to the wireframes' caps**: display 46 (landing hero), h1 40 (product-page hero), h2 30, h3 22, h4 17, lead 17, body 15, small 13, overline 11. Clamps only scale *down* from each cap. **Sentence case** — uppercase only on the 11px `.overline` label. `font-display` still resolves (to Inter) so old code compiles.
- 4 radii (6/8/12/16) + pill; `2xl`/`3xl` collapse into the scale. Elevation `shadow-e1…e4` is now the wireframes' simpler ramp (`0 1px 2px` → `0 2px 4px, 0 12px 28px`), cast in `--overlay` not black; **`e5` is ours** for the tilted 3D hero planes only. Layout: `.wrap` 1120px / `.wrap-narrow` 736px / `.section`.
- **Primitives (use these, don't hand-roll):** `ui/button` (primary|ink|secondary|subtle|ghost|danger|link × sm|md|lg|icon, `pill`/`block`, **`loading`/`loadingLabel`** — skipped under `asChild`, which can't host a spinner), `ui/panel`, `ui/section`, `ui/badge`, `ui/stat` (+`delta`/`deltaTone`), `ui/empty-state`, `ui/page-header`, `ui/field` (Field/TextInput/Select), `ui/data-table` (TableWrap/Table/**SortableTh**/Th/Td/**TdBusy**/Tr with **`selected`/`busy`**), `ui/stepper`, `brand/logo`, `landing/product-frame`.
- **Added 2026-08-05 from the wireframes' component library (all UNWIRED — nothing imports them yet):** `ui/spinner` (SVG, so the faint track can be currentColor at low alpha — Tailwind can't alpha `currentColor`), `ui/alert` (info|success|warning|danger, colour rail + title + optional action; **body stays `ink-muted`** because a tinted body fails AA on the warning tint), `ui/skeleton` (Skeleton/SkeletonText, `animate-shimmer`), `ui/progress`, `ui/status-strip` (offline / session-expired), `ui/score-ring` (ScoreRing/ScoreSummary — **never derives the band word**, the caller passes it so it matches what the scorer said), `ui/kbd`, `ui/breadcrumb`, `ui/tab-nav`, `ui/pagination` (computes its own range from page/size/total), `ui/confirm-dialog` (**focuses Cancel on open** so Enter is never destructive), `ui/copy-field`, `ui/chips-input` (case-insensitive dedupe, `max`), `ui/password-input` (show/hide + caps-lock via `getModifierState`), `ui/toast` + `ui/toast-pill` (`notify.success/error/pending/dismiss` over react-hot-toast).
- `ui/dialog` was still raw shadcn (`bg-background`, `bg-black/80`, `text-lg`) and is now token-driven.
- **Where each message type belongs** (decided while building them): `Alert` = the outcome of a fetch, inline beside the thing that failed. `StatusStrip` = a standing condition of the session. `notify` = the outcome of an action the user just took. A toast is the wrong home for anything the reader may need to read twice.
- 🔴 **`lib/utils.ts` uses `extendTailwindMerge`** declaring our fontSize + shadow class groups. Without it `cn()` treats `text-small` as a colour and **silently deletes `text-accent-fg`** → dark text on violet buttons. Any new custom `text-*` scale key must be added there.
- **Honesty rule (user decision):** invented traction numbers and testimonials are gone from the marketing pages ("50K+ interviews", "85% success rate", "4.9★", "0 spam applications", the 3 fake quotes, "cheating detection"). Only claims the code backs may ship; the one sample table on `/find-jobs` is labelled "Example". Header notifications show an empty state instead of 3 fake alerts. Don't reintroduce them.
- Converted: landing, practice, find-jobs, site-header/footer, auth layout+login+register, header, app-nav, protected-layout/route, error-boundary, all 5 interview screens, profile, jobs, users, dashboard (**colours/typography only — layout untouched, see the two rejected merges**).
- Verified: tsc clean; eslint 2 errors both pre-existing (`button.tsx`/`form.tsx` react-refresh); build passes; home JS 153.9 kB gzip (≤160); CSS 11.68 kB; **0 gradient elements at runtime**; **0 WCAG AA contrast failures** on `/`, `/practice`, `/find-jobs`, `/auth/login` in light and dark; no horizontal overflow at 375/768/1280. Protected screens NOT live-verified (needs a login).
- Fixed in passing: `select-profile.tsx` conditional-`useState` hook-order bug; dead "Back to dashboard"/"Skip for now"/"← Back" buttons; `interview-result` memoization lint error. `--ink-subtle` darkened to `#6A6F79` after measuring 4.40:1 on surface.
- ⚠️ **Now dead code (zero importers), awaiting user's go-ahead to delete:** `app/pages/userProfile.tsx` (unrouted, unconverted, still full of gradients) and 10 showpiece components — `card-stack`, `marquee`, `circular-flip-gallery`, `image-swiper`, `image-auto-slider`, `interactive-selector`, `limelight-nav`, `social-icons`, `testimonials`, `arc-gallery-hero`. Also unused: `motion/clip-reveal`, `motion/tilt-card`, `motion/count-up` (dashboard still uses CountUp).
- Remaining gaps: no social proof/logos/compliance page; dashboard data still mock and now contradicts `/profile`.

## Claude Design wireframes import (2026-08-05) — the marketing pages now follow the doc
Source: claude.ai/design project `58defc11-b9e2-4eba-9efa-49c405e59be9` ("TalentPulseAI design system"), file `TalentPulseAI Wireframes.dc.html`, read via the **DesignSync** tool (`get_file` returns JSON-wrapped content; unwrap before reading). Five turns, newest first:
| Turn | Content | Palette |
|---|---|---|
| 5 | Landing w/ recruiter dashboard, pricing, FAQ | Dark `#09090B`, violet→cyan **gradients + glows** |
| 4 | `/practice` + `/find-jobs` full pages | Light, blue |
| 3 | Landing hero + CSS-3D tilted product stack | Light, blue |
| 2 | Full component library + applied dashboard | Light, blue |
| 1 | Low-fi density explorations (superseded by 2) | Greyscale |
- **Turns 2–4 ARE Direction C** — same token names, same 6/8/12/16 radii, same e1–e4, same type ladder. Only the accent hue and the exact neutrals differed. **Turn 5 is a REJECTED direction**: user chose turns 2–4 explicitly, so the dark/gradient landing was NOT built. Don't resurrect it, and note it also advertises a recruiter dashboard, coding assessment, £0/£79/Enterprise pricing and an API/webhooks — none of which exist.
- **Built:** landing hero → 3a (badge, "Rehearse the interview before it counts.", CSS-3D stack, three-claim row), `/practice` hero + 4-step "How a run works" + limits panel → 4a, `/find-jobs` hero + "What a run gives you" + limits panel → 4b. The rest of each page (sides split, features, tour, tracks, FAQ, CTA) was left alone.
- **`landing/product-stack.tsx` + `landing/product-planes.tsx`** — the hero visual is layered DOM in CSS perspective, not an image, so it can't drift from the product. **Two variants** (`variant` prop): `"tilt"` (default, `/practice` + `/find-jobs`) rotates the whole 400×300 stage `rotateX(12) rotateY(-20) rotateZ(3)` at rest; `"layered"` (landing, 2026-08-05) keeps the stage square to the reader, spaces the planes on Z alone (−80 / 0 / +80 at `perspective:1200px`, so they render 375 / 400 / 429px wide) and only tilts on `group-hover`. **Below `md` the perspective is dropped and only the front panel renders flat** — a 400px stage rotated 20° doesn't survive 375px. Stage reserves height at every size (25rem tilt, 28rem layered).
- ⚠️ **`product-planes.tsx` must export ONLY constants and `product-stack.tsx` ONLY components**, else `react-refresh/only-export-components` fires. Same reason `toast-pill.tsx` is split from `toast.tsx`.
- **Doc claims corrected against the code before shipping** (the doc is a design artefact, not a spec — verify every claim it makes):
  - "Safari and Firefox do not support the speech API" → **Safari does**; only Firefox lacks it.
  - "Parsing takes up to 30 seconds" → the client allows **120s** (`LLM_TIMEOUT_MS`).
  - "It does not record video" → it **does** record (MediaRecorder, audio+video), but only into an in-browser object URL in component state for local playback; **never uploaded**, discarded on unmount. Only answer text is submitted.
  - "Mark anything applied, pending or **closed**" → real statuses are `new → reviewed → pending_apply → applied → dismissed`.
  - "Progress is shown per company, and you can leave the page" → a run is one synchronous request; leaving cancels it. It reports `companies_checked` as a **count**, not names.
  - Verified as true and kept: 12-skill cap (`quick-setup.tsx:68`), 8 roles, answers editable by typing (`interview-now.tsx:511` textarea), answers held client-side until submit.
- **Verified:** tsc + `tsc -b` clean; eslint back to the same **2 pre-existing** errors (`button.tsx`/`form.tsx` react-refresh); build passes. Live on localhost: **0 console errors**, **0 gradients**, and **0 AA contrast failures across 111/106/118 rendered text nodes on `/`, `/practice`, `/find-jobs` in BOTH themes**; no page-level horizontal overflow at 375/768/1280; tilted stage correctly `display:none` below md.
- 🔴 **Auditing colour in the Browser pane: freeze transitions first.** The pane doesn't composite frames, so `transition-colors` elements sit stuck at `currentTime: 0` and `getComputedStyle` returns the **pre-toggle** colour forever. This produced 12 phantom dark-mode failures (header/footer links reading 2.39–2.58:1) that vanish once you inject `*{transition:none!important;animation:none!important}`. Screenshots also time out here — verify via DOM assertions.
- **Budget:** home route **158.7 kB gzip JS** (150.53 shared + 3.61 section + 3.88 landing + 0.43 badge + 0.23 reveal) vs the 160 kB target — was 153.9, so only **1.3 kB of headroom left**. CSS 12.60 kB gzip (was 11.68).
- **Known deviation:** input borders use the doc's `border-strong` `#D7DBE2` at 1.39:1 on canvas. WCAG 1.4.11 wants 3:1 for a form-control boundary, which would need ~`#949BA6` — far heavier than the doc's look, and no worse than the `#D3D7DD` already shipping. Left as the doc specifies; revisit if a11y is audited formally.

## Stitch prototype — BUILT 2026-08-05 (accent is VIOLET again; sidebar shell is live)
User decisions after the analysis below: **go violet, match the prototype's colours**, **"same to same" scope**, **leave the invented features out**. What shipped:
- ⚠️ **The light values in this bullet are SUPERSEDED** by the deeper `#540DDD` palette in "DESIGN SYSTEM — CURRENT" (same day, after the user said the hero still didn't look like the export). The dark values below are still live.
- **Tokens (light):** accent `#7C3AED` (5.7:1 white), hover `#6D28D9`, accent-text `#5B21B6` (9.0:1), accent-soft **`#F1EDFE`** — the prototype's `#EDE9FE` put `ink-subtle` at **4.48:1**, two hundredths under AA, so the tint is one step lighter. Neutrals are **lavender-tinted**: canvas `#FFF`, surface `#F8F7FE`, surface-strong `#F1EFFB`, border `#EBE9F5`, border-strong `#D8D4EA`. `ink-subtle` darkened `#67707D` → **`#636C79`** (the old value measured 4.41:1 on the new surface-strong).
- **Tokens (dark):** canvas `#0C0B10`, surface `#141320`, **surface-strong `#1A1826`**, border `#2A2740`. 🔴 **Violet has almost no room in the dark three-way squeeze** (white ≥4.5:1, ≥3:1 vs canvas AND vs surface-strong): the usable luminance window is 0.137–0.183 and `#7C3AED` sits at 0.134, while violet-500 `#8B5CF6` drops white text to 4.24:1. Resolved by **darkening the TRACK to `#1A1826`** (buys 3.06:1) rather than moving the accent. Dark hover `#8449F0` (5.0:1 white), accent-text `#C4B5FD` (10.6:1), accent-soft `#1E1633`. Re-measure all three before touching either value.
- **Sidebar shell:** NEW `components/app-sidebar.tsx` (240px rail: brand block, Dashboard/Interviews/Jobs/Profile, **solid** accent pill via `layoutId="app-sidebar-pill"`, bottom account group with theme toggle + log out) and `components/app-topbar.tsx` (hamburger, Quick interview, notifications with the honest empty state — **no global search**, there is no search endpoint). `protected-layout.tsx` rewritten with a **`chrome` prop**: `"app"` = sidebar (all destinations), **`"focus"`** = the prototype's minimal wizard bar (logo + "Secure session", no nav) wired to the 4 funnel routes in App.tsx. Below `lg` the rail becomes a **drawer** with scrim.
- 🔴 **Do NOT use a negative z-index for the active-nav pill.** `-z-10` risks being painted over by the sidebar's own `bg-surface`, because in-flow block backgrounds paint AFTER negative-z-index descendants. The pill sits at auto z-index with the icon+label lifted to `relative` instead. (Also: an ancestor-walking contrast audit cannot see a sibling pill layer — it reported a phantom 1.06:1 failure; white on `#7C3AED` is 5.7:1.)
- 🔴 **The dashboard had its OWN decorative 256px sidebar** — that is what prototype screenshot 1 shows — so the new rail made **two rails side by side**. The duplicate (plus its mobile topbar/drawer) was removed; **every content section was kept**, so this is not one of the rejected restructures. Its items were Schedule/Achievements/Notifications, i.e. exactly the fiction being left out. Also in-place: launcher cards → **dashed border + accent-soft icon tiles** (blur blobs gone), stat icon tiles → accent-soft + accent glyph (the always-`bg-accent` `color` prop was dead and is gone), h1 un-uppercased.
- **Recharts now reads the tokens** via a local `useChartColors(isDark)` that resolves `--accent`/`--border`/`--ink-subtle` off `<html>` — `rgb(var(--x))` is NOT reliable in an SVG presentation attribute, and the file previously hardcoded cyan/slate hexes. `isDark` is the intentional (lint-disabled) dep: the values live on the theme class.
- **`ui/score-ring` gained an `xl` size** (112px) and is wired into `interview-result` beside the number, with a `scoreRingTone` helper mirroring the existing 80/65 bands.
- **Verified:** tsc + `tsc -b` clean; eslint back to the same **2 pre-existing** errors (`button.tsx`/`form.tsx` react-refresh); build passes. Live, logged in as the local test user, **0 AA contrast failures in BOTH themes** on `/` (107 nodes), `/dashboard` (124), `/interview/select-role` (70, incl. a selected role card), `/profile` (55), `/jobs` (34), `/interview/result` (45, real score 84 fetched through the profile → report round-trip); **0 gradients**; no horizontal overflow at 375 or 1440; drawer opens to x=0/239px and lists the 4 destinations. Remaining console errors are the pre-existing `[API Error]` logs from the intentional `/jobs/setup` 404 (no job profile for this user).
- ⚠️ **`components/header.tsx` and `components/app-nav.tsx` are now dead** (the shell replaced them). Left in place rather than deleted — they were not part of the ask.
- **NOT built** (prototype screens with no backing feature): live-session 3-column layout, code pane, video dock, enterprise/recruiter screens, scheduling, achievements, settings, global search, readiness/heatmap metrics. **Still open from the plan:** jobs table → card list with match badges + tag pills (P4), and wiring `skeleton`/`alert`/`chips-input`/`tab-nav`/`progress` into their screens (P2 partially done — only `score-ring` and `spinner` landed).

## Stitch 3D-hero export — BUILT 2026-08-05 (landing hero + public nav + footer)
Source: a **second, different** Stitch export supplied as a folder (`~/Downloads/stitch_talentpulseai_3d_hero_infrastructure/` — `code.html` + `DESIGN.md` + `screen.png`). One page only: top nav, a hero with a 3-panel CSS-3D stack, footer. Its `DESIGN.md` is Inter / 8px grid / e1-e2-e5 / "no gradients" — structurally Direction C already.
- 🔴 **Layout fidelity is not colour fidelity.** The first pass shipped the export's layout on our existing tokens and the user's verdict was *"this is not look like same please apply same color design and style"* — twice. The palette gap was the whole complaint: our page was **white** where the export's is lavender `#FBF8FF`, our violet was the lighter `#7C3AED` not `#540DDD`, our borders `#EBE9F5` were nearly invisible against the export's `#CAC3D9`, our footer band `#F1EFFB` against its `#E3E1EC`, and our text was cooler (`#101418`/`#4A5563` vs `#1A1B22`/`#494456`). **When a reference ships a palette, re-point the tokens in the same pass** — five token values were the difference between "same layout" and "same design". New values + the reasoning live in "DESIGN SYSTEM — CURRENT".
- The wordmark went **all violet** (`accent-text`) too; the old ink + accent split (`TalentPulse` + `AI`) read as two words next to the export's single violet brand.
- **What the export actually renders vs what its CSS implies:** the `.hero-panel` rule carrying `rotateX(12) rotateY(-20)` is **never applied to any element**, so the rest state in `screen.png` is three flat panels offset diagonally by `translateZ` alone, with the tilt appearing only on `:hover`. Built as rendered, not as the dead rule implies — hence the new `variant="layered"`.
- **User decisions:** adapt the fictional panel, keep the headline but make the subcopy real, scope = landing hero + nav + footer.
- **Built:** headline verbatim ("Transform your career profile into high-fidelity signal."), real subcopy, `Get started for free` → `/auth/register` + `Try the demo` (play icon) → `/demo`; hero padding opened to `py-20 md:py-28`; hero badge and small print dropped (the announcement bar already states the beta/no-card claim). Nav: brand and links now **one left cluster** (`Practice / Find jobs / How it works / FAQ`), auth actions right. Footer: **4 columns** on `bg-surface-strong`, © under the brand.
- **Panels are now the product's three real stages** — back: sections extracted from the resume + "Personal details removed before indexing"; mid: a **dark session slab** (`bg-ink`, traffic-light dots, mono `live session · 01:42`, question, transcript bars, "Listening"); front: `Performance insight` with an 88 ring, one Strength card (accent-soft) and one "What to fix" card. Front panel is `bg-canvas/95 backdrop-blur-sm` so the dark slab reads through it, which is what makes the stack look layered.
- ⚠️ **A dark slab must not stay dark in dark mode** — `--ink` inverts to near-white, and a slab darker than the `#0C0B10` canvas is just a hole. The session plane is `bg-ink dark:bg-surface` with its text `text-ink-inverse/… dark:text-ink…`; measured 5.13–18.5:1 in dark, 5.07–18.5:1 in light.
- **`StackPlane` gained `className`** so a plane can override its own surface; `cn()`/twMerge correctly drops the base `bg-canvas` for `bg-ink`.
- **Hover motion is gated:** `motion-safe:group-hover:*` → the emitted rules sit inside `@media (prefers-reduced-motion: no-preference)`; transition is `duration-500 cubic-bezier(0.16,1,0.3,1)` on transform+opacity only. Nothing is clickable, so no `cursor-pointer` (the export has one).
- **Left out as fiction (same standing rule as the other export):** the `interview.ts` / `twoSum` **code editor** (no coding assessment — replaced by the live session), "EQ-driven simulation and verifiable transparency", the `Signal: High Fidelity` / `EQ Context: Mapped` readouts, and the nav/footer's Pricing · Blog · Guides · Support · About · Careers · Contact (no such pages, no billing).
- **Also changed beyond the ask:** `pill` dropped from every public-page CTA (landing, `/practice`, `/find-jobs`, `SiteHeader`) so button shape matches the export's rounded rectangles — 8px `sm` / 12px `lg`. App-shell buttons (`app-topbar`, dead `header.tsx`) were left as pills.
- **Verified (after the palette pass):** tsc clean; build clean; home route **154.5 kB gzip** (150.63 shared + 3.88 landing) vs the 160 kB target, CSS 13.01 kB. Live: 0 console errors; **0 AA failures in BOTH themes on every public route** — `/` 121 nodes, `/practice` 107, `/find-jobs` 119, `/auth/login` 10; 0 gradients; no horizontal overflow at 375 / 800 / 1280; below `md` the stage is `display:none` and only the insight panel renders flat (335px). Protected screens not live-verified (needs a login).
- **Known deviation carried forward:** input/secondary-button borders are now `border-strong` `#ADA4BF` = **2.09:1** on canvas (was 1.39:1 — better, still under the 3:1 WCAG 1.4.11 wants for a control boundary). The export's own component spec says a 1px light border too, so it is left as specified.
- ⚠️ **Port 5173 was held by another chat's dev server**, which `preview_start {name}` refuses to adopt. Workaround used: `preview_start {url: "http://localhost:5173/"}` — same folder, so HMR already had the edits. Screenshots still time out here (pane not compositing); everything above was asserted via DOM/CSSOM.

### Light palette re-pointed to the export (2026-08-05, second pass)
The first pass matched the export's LAYOUT but kept our own tokens, and the user's verdict was "this is not look like same". Light mode now IS the export's Material palette; **dark mode is unchanged** (the export has none, and dark's violet is boxed in by the documented three-way squeeze — `#540DDD` only reaches 2.28:1 against the dark canvas, so dark keeps `#7C3AED`).
| token | was | now | export source |
|---|---|---|---|
| accent / hover / text | #7C3AED / #6D28D9 / #5B21B6 | **#540DDD / #4E00D2 / #540DDD** | `primary`, `on-primary-fixed-variant` |
| accent-soft | #F1EDFE | **#E7DEFF** | `primary-fixed` |
| canvas | #FFFFFF | **#FBF8FF** | `background` — the page is lavender, not white |
| surface / surface-strong | #F8F7FE / #F1EFFB | **#F4F2FD / #E3E1EC** | `surface-container-low` / `-highest` |
| border / border-strong | #EBE9F5 / #D8D4EA | **#CAC3D9 / #ADA4BF** | `outline-variant` |
| ink / -muted / -subtle | #101418 / #4A5563 / #636C79 | **#1A1B22 / #494456 / #625C6E** | `on-surface`, `on-surface-variant` |
- 🔑 **The ladder direction did NOT change, and that is the whole trick.** The export's own cards are `bg-surface` = the SAME tone as its page, lifted only by a 1px `outline-variant` border — which is exactly what `Panel` (`flat`/`raised` = `bg-canvas` + border) already does. So re-pointing values was enough; inverting canvas↔surface would have been wrong and would have broken every `tone="muted"` band and the app sidebar.
- The export's `outline` **#7A7487 is a LINE colour, not a text colour** — 4.27:1 on the tinted canvas, under AA. `ink-subtle` stops at #625C6E (6.2:1 canvas, 5.0:1 on surface-strong, 5.1:1 on accent-soft).
- `--ring` and `--chart-1` moved to `260 89% 46%` to track the new accent. **Logo wordmark is now violet throughout** (was ink + accent "AI", which read as two words).

### Polish pass (2026-08-05, "make more polished and sharper")
- 🔑 **Anchor a CSS-3D stack's readable plane at Z=0.** The front plane was at `translateZ(80px)` under `perspective:1200px`, i.e. upscaled 1.071× — text rasterised then resized, which reads as soft. The ladder now runs front `0` / mid `-60` / back `-120`: the front renders **exactly 400px = 1:1** and the others recede, so the composition (front largest) is identical and the type is crisp. Panels also get `transform-gpu [backface-visibility:hidden]`.
- Depth ramp no longer skips: back `e2`, mid `e4`, front `e5` (was e3/e5/e5).
- **The session slab has the export's "lens" inner stroke** — `ring-1 ring-inset ring-ink-inverse/10 dark:ring-border`. DESIGN.md calls for it by name; without it a dark slab reads as a hole cut in the page.
- **The 88 dial is an SVG arc** (`r=19.5`, `strokeWidth 3`, `strokeDasharray "107.8 122.5"`, `-rotate-90`), not a closed border-circle. Deliberately NOT `ui/score-ring`: that draws with a conic-gradient, which would be the only gradient element on a page whose audit asserts **0 gradients**.
- Miniature padding onto the 8px grid (outer `p-4`, nested `p-3`); transcript bars `h-1.5`.
- Page: `text-balance` on h1 + every `SectionHeading` title, `text-pretty` on lead/subtitle/FAQ answers; a 2px accent rule above each of the three hero claims; **FAQ disclosure is a chevron with the whole row as the hit target** plus an inset focus ring (was a rotating "+" whose target was only as tall as its text); capability icon tiles 32→36px to match the FLOW tiles.
- Global: `scroll-padding-top: 5rem` (in-page anchors were landing their heading under the 64px sticky header), `scroll-behavior: smooth` gated on `prefers-reduced-motion`, and a `::selection` in `accent-soft`. Header/footer links now hover to `accent-text` (the export's `hover:text-primary`); `Button size="lg"` carries `font-semibold`.
- **Verified:** tsc clean; build clean; **0 AA failures in BOTH themes** — 117 text nodes on `/` at 1280, 102 at 375, 107 on `/practice`; 0 gradients; no overflow at 375/1280; front plane measured at exactly 400px.
- ⚠️ **Re-freeze transitions BEFORE reading, not after.** Removing the freeze style and toggling the theme in the same call reproduced the documented phantom failures exactly — 13 of them at 375px, all gone once the freeze was re-injected before the read.
- 🔑 **`.wrap` is now `max-w-[90rem]` (1440px), up from 70rem/1120px.** The export's DESIGN.md states a **1440px desktop container** and we had never applied it — on a 1920px screen that left ~400px of dead margin per side, which the user flagged as "left and right side gap not proper cover for width". Side gap is now 233px. Text measures are unaffected because the hero caps its own column (`h1` max-w-xl = 576px, lead max-w-md = 448px) and `SectionHeading` caps at max-w-2xl — widening the container without those caps would have stretched body copy past a readable measure. `.wrap-narrow` unchanged at 46rem.
- **Layer offsets opened from 20px to ~26px per step** (back `translate(52px,-44px)`, mid `translate(26px,-22px)`, front at origin). At 20px — combined with the Z re-basing, which shrank the back planes — each panel peeked only a few px and the stack read as ONE panel with odd edges. Now each layer shows ~27px at the top and ~29px at the right, so it reads as three.
- ⚠️ **Multi-agent Workflow runs currently die on the account spend limit** — a 5-lens polish audit returned 0 findings with all 5 agents erroring "You've hit your individual spend limit" after ~437k subagent tokens. Budget for that before planning fan-out work.

## Stitch prototype analysis (2026-08-05) — the teardown the build above came from
Source: Google Stitch preview `6460829871356169998?node-id=d3f51c43…`. **The preview is auth-gated** — it renders in a cross-origin `app-companion-430619.appspot.com` iframe and paints nothing for an anonymous viewer, so don't try to fetch it; analysis came from **8 user-supplied screenshots**. A screen recording was also supplied but is unreadable here (no video decode, no `ffmpeg`). Full teardown: `Frontend/document/STITCH_PROTOTYPE_ANALYSIS.md` — read it before acting on the prototype.
- Screens: developer dashboard (sidebar), enterprise "Overview", jobs list, live interview session, wizard step 2, role select (×2), resume-parse result.
- **The prototype's component vocabulary is ~70% primitives we ALREADY BUILT** — `stat` (delta), `stepper`, `alert` (its colour-rail insight cards), `score-ring` (its readiness donut), `progress` (its skill heatmap), `skeleton` (its document preview), `spinner`, `chips-input`, `tab-nav`, `badge`, `panel`, `.overline`. Eight of those are still unwired. Genuinely new: sidebar shell, topbar, activity timeline, dashed-target line chart, code pane, video dock.
- 🔴 **Blocking conflict — the prototype's accent is VIOLET**, the hue we retired on 2026-08-05 in favour of blue `#2563EB`. Its neutrals are lavender-tinted too (`#F8F7FE` canvas, `#EDEBF5` border) vs our hue-neutral set. Both are cheap token swaps but they REVERSE a 2-day-old decision — get the user's word first, and re-check the three dark-accent constraints (white ≥4.5:1; ≥3:1 vs BOTH `canvas` and `surface-strong`).
- 🟠 It replaces the top `Header`+`AppNav` (2026-07-17 IA decision) with a ~230px **left sidebar**. Cheap in practice — all protected screens render inside `protected-layout`. But the prototype is **internally inconsistent**: sidebar on 3 screens, no nav on the live session, HORIZONTAL top nav on the resume screen; active state is accent-*soft* on one screen and *solid* on another; and the two sidebars list different nav items (only Dashboard/Interviews/Jobs/Profile is buildable).
- 🟡 The uppercase `WELCOME BACK,` heading is **our own retired BOLD style** echoed back from an old screenshot of our dashboard — not a design instruction. Keep sentence case. Prototype also has **no dark mode**; every value needs a dark counterpart we invent.
- 🔴 **Honesty audit — the prototype invents a lot** and building it literally would restore fabricated capability 2 days after we stripped it: `€0` credits, **scheduling** (Upcoming/Join/Prepare Now/"3 scheduled"), Achievements, Notifications page, Settings page, Enterprise Tier/Engineering Org/Invite Team/API Docs/Help Center (same recruiter fiction as the REJECTED wireframes turn 5), global search, **code editor + live coding**, **live AI analysis / "Inject into chat" / an interviewer seat viewing "Candidate: Alex Chen"**, a two-participant video call (we only record locally, never upload), and "DevAssess AI" as the product name. Invented metrics: salary ranges, company logos, "42 results", `CONFIDENCE SCORE 94%`, Experience Vector / Seniority L6 / Total Tenure / Domain Fit / Growth Trajectory / Behavioral Cues, per-skill heatmap %, `AI Readiness 88/100`, `Top 12%`, `Pre-cleared`. Contradictions: "up to 3 languages" (real cap **12**, `quick-setup.tsx:68`), a seniority **slider** (experience is a discrete enum), **5** role cards (we ship **8**), a "Reports" tab.
- **Recommended order:** P0 token decision → P1 sidebar shell + topbar → P2 wire the 8 idle primitives → P3 funnel polish → P4 jobs cards (rail only if backed by real `match_reasons`) → P5 dashboard **in-place only** (two restructures already rejected 2026-07-30). NOT planned: live-session layout, code pane, video dock, enterprise screens, scheduling, achievements.

## Deployment / Ops
- **Deployed API base URL: `https://talentpulseai-api.onrender.com`** (from `render.yaml`'s `name: talentpulseai-api`). Verified live 2026-08-06: `/openapi.json` → 200, 22 routes, `/auth/login` present.
- **Running the local frontend against the ONLINE backend** (2026-08-06): create `Frontend/.env.local` (gitignored, loaded after `.env`, so it wins) with `VITE_API_BASE_URL` + `VITE_API_URL` = the Render URL and `VITE_API_TIMEOUT=90000`. Delete the file to go back to the local API. `axiosInstance` resolves `VITE_API_BASE_URL || VITE_API_URL || http://127.0.0.1:8000`; **restart the dev server after touching env files**. Confirm the resolved value at runtime with `import('/src/api/axiosInstance.ts').then(m => m.default.defaults.baseURL)` — reading the served `.ts` source is misleading, dev does not inline `import.meta.env` there.
- ✅ **CORS already allows `http://localhost:5173`** — Render's `ALLOWED_ORIGINS` returns `access-control-allow-origin: http://localhost:5173` on both a simple GET and an `OPTIONS /auth/login` preflight (allow-credentials true, max-age 600). No dashboard change needed to develop locally against production.
- **Cold start measured 61.5s** on the first request after idle (free plan spins down ~15 min) — hence the 90s local timeout; the 30s default would abort before the first response.
- ⚠️ **Against the online backend, question generation falls back to deterministic templates**: `render.yaml` still pins `GOOGLE_CHAT_MODEL: gemini-2.0-flash`, the model whose free quota is exhausted (limit:0). Update that env var to `gemini-2.5-flash` in the Render dashboard to get real LLM questions online.
- **Frontend:** Netlify (static + SPA redirect, `netlify.toml`). **Backend:** Render **free plan** (`render.yaml`, `startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT`). Deployed URLs live in dashboard env vars (`VITE_API_BASE_URL` on Netlify, `ALLOWED_ORIGINS`/`DATABASE_URL`/`GOOGLE_API_KEY` on Render — `sync:false`, not in repo). Local `.env` points frontend at `127.0.0.1:8000`.
- **Online login "time limit exceeded" — ROOT CAUSE (2026-07-15):** Render free tier **spins down after ~15 min idle**; cold start ~50s > axios 30s timeout → first login after idle times out. **FIX APPLIED (commit 4e28fe55):** login/register get 90s per-request timeout (fast DB endpoints keep 30s); axios interceptor maps timeout/ECONNABORTED/ERR_NETWORK → "server is waking up, try again" (toast + login/register error text). **Still TODO (ops, not code):** keep-warm cron ping (UptimeRobot/cron-job.org every ~10 min) so it never sleeps; OR upgrade Render plan.
- ⚠️ **`render.yaml` sets `GOOGLE_CHAT_MODEL: gemini-2.0-flash`** — the model with exhausted free quota (limit:0, see Gemini quota note). Local .env uses 2.5-flash. **Online question generation will fall back to deterministic** until the Render env var is updated to `gemini-2.5-flash`.

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
- 2026-08-05 — **Re-pointed the light palette to the Stitch 3D-hero export** after "not look like same, apply same color design and style" (said twice — the first pass had shipped the export's layout on our own tokens). Light accent `#7C3AED` → **`#540DDD`** (accent-text collapses onto it at 8.0:1), page canvas white → **`#FBF8FF`**, surface `#F4F2FD`, surface-strong `#E3E1EC`, border `#EBE9F5` → **`#CAC3D9`**, text to `#1A1B22`/`#494456`/`#625C6E`, wordmark all violet. Dark mode deliberately stays on `#7C3AED` (`#540DDD` is 2.28:1 on the dark canvas). Cards did NOT need to become white — the export's cards are the same tone as its page with a visible border, which is what `Panel` already does. 0 AA failures in both themes, 0 gradients, 154.5 kB gzip home route. **Lesson recorded: re-point tokens in the same pass as a reference's layout.**
- 2026-08-06 — **Page container widened to the export's 1440px** after "left and right side gap not proper cover for width" — `.wrap` 70rem → **90rem**, cutting ~400px of dead margin per side on a 1920 screen down to 233px. Safe because the hero and `SectionHeading` cap their own measures. Also opened the hero stack's layer offsets 20px → ~26px per step: after the Z re-basing the back planes had shrunk and barely peeked, so three panels were reading as one. Verified 0 AA failures both themes at 1920, no overflow at 375/1280/1920 on `/` and `/practice`.
- 2026-08-05 — **Polish pass** ("make more polished and sharper"). The hero stack's readable plane is re-anchored to **Z=0** so it renders exactly 1:1 instead of being upscaled 1.071× and rasterised soft; depth ramp fixed to e2/e4/e5; the 88 dial became a real **SVG arc** (not `ui/score-ring`, whose conic-gradient would be the page's only gradient); the session slab gained the export's white-10% "lens" inner stroke; miniature padding onto the 8px grid. Page: text-balance/text-pretty, a 2px accent rule per hero claim, a **chevron FAQ with the whole row as the hit target** + inset focus ring, 36px capability tiles, `scroll-padding-top: 5rem` (anchors were landing headings under the sticky header), gated smooth scroll, `::selection`, `hover:text-accent-text` on header/footer links, `font-semibold` on `size="lg"` buttons. Verified: 0 AA failures in both themes across **326 text nodes** (`/` at 1280 and 375, `/practice`), 0 gradients, no overflow, front plane measured at exactly 400px. The 5-lens audit workflow that was meant to cross-check this **died on the account spend limit** and returned nothing. See "Polish pass".
- 2026-08-05 — **Built the Stitch 3D-hero export** (a second, separate Stitch folder: landing hero + nav + footer). Its palette was already ours, so no token work. Key finding: the export's tilt rule is never applied to an element, so the shipped rest state is a head-on `translateZ`-only stack that tilts on hover — added as `ProductStack variant="layered"` alongside the existing `"tilt"`. Panels now tell the real three-stage story (sections extracted → dark live-session slab → 88-score insight), with the export's coding-assessment pane and EQ readouts left out per the honesty rule. `pill` dropped from all public CTAs. 154.5 kB gzip home route, 0 AA failures both themes. See "Stitch 3D-hero export".
- 2026-08-05 — **Built the Stitch prototype's UI** (user chose violet + "same to same" + leave the fiction out). Accent back to violet `#7C3AED` with lavender-tinted neutrals; **new 240px sidebar shell** (`app-sidebar` + `app-topbar` + a `chrome="focus"` mode for the wizard) replacing the top `AppNav`; the dashboard's own duplicate sidebar removed (content untouched); Recharts moved onto the tokens; `score-ring` wired into the result page. Two contrast traps solved: violet's dark three-way squeeze (fixed by darkening the ring/progress track, not the accent) and `accent-soft` needing one step lighter than the prototype's value. 0 AA failures in both themes across 6 screens, 0 gradients, eslint back to the 2 pre-existing errors. See "Stitch prototype — BUILT".
- 2026-08-05 — **Analysed the Stitch prototype** (8 user screenshots; the preview itself is auth-gated and unfetchable, the supplied recording unreadable). Verdict: ~70% of it is primitives we already built (8 still unwired), the one real new piece is a left-sidebar app shell. Two things need the user's word before code: the accent is **violet** (reverses the 2-day-old move to blue) and the shell replaces the 2026-07-17 top-nav IA. The prototype also invents scheduling, achievements, an enterprise/recruiter tier, live AI analysis, a code editor, a video call, and ~10 resume/readiness metrics that don't exist — flagged against the standing honesty rule. Teardown + 6-phase build order in `Frontend/document/STITCH_PROTOTYPE_ANALYSIS.md`. No code written. See "Stitch prototype".
- 2026-08-05 — **Imported the Claude Design wireframes** (`TalentPulseAI Wireframes.dc.html`). User picked turns 2–4 (light, blue) over turn 5's dark/gradient landing, scope "marketing + primitives". Accent violet→**blue #2563EB**, neutrals/elevation/type retuned to the doc, `--danger-fg` + `overlay` + `e5` added; **16 new primitives** from the doc's component library (alert, skeleton, progress, status-strip, score-ring, spinner, kbd, breadcrumb, tab-nav, pagination, confirm-dialog, copy-field, chips-input, password-input, toast, + button `loading` and table row states); landing/`/practice`/`/find-jobs` heroes rebuilt on 3a/4a/4b with a CSS-3D product stack. **Six of the doc's factual claims were wrong and were corrected against the code** (Safari speech support, 30s parsing, "does not record video", a "closed" status, per-company progress). 0 AA failures both themes, 0 console errors, eslint back to the 2 pre-existing errors. Home JS 158.7 kB gzip (1.3 under budget). See "Claude Design wireframes import".
- 2026-08-03 — **Whole-UI redesign to "Direction C"** after the user compared us to coderbyte.com / flowmingo.ai. Measured teardown of both (Coderbyte: Inter 56/64 w500, navy #03263B, pill buttons w/ 10px uppercase labels, proof in every section; Flowmingo: SF Pro, #171717, 8px radius, 5-stop micro-shadows, 1024px container, zero saturated colour). Our audit found 443 `isDark` ternaries, 125 gradients, 470 raw `slate-*`, 8 radii, 8 heading clamps, and fabricated traction numbers. Built a central token/type/radius/elevation layer + 13 primitives, converted 20 screens, retired the BOLD language, and deleted the invented proof. 0 gradients and 0 AA contrast failures at runtime; home JS 153.9 kB gzip. See "DESIGN SYSTEM — CURRENT" and `Frontend/document/UI_AUDIT_AND_REDESIGN_PLAN.md`.
- 2026-07-30 — **Profile relaid out as 3 vertical partitions** (Account | Interviews | Resumes) at `max-w-7xl`, practice summary condensed into a 4-tile stat strip. Was a narrow `max-w-4xl` column about two screens tall; now fits one 1600×900 viewport, stacks at 375px. Reflow only — no content or logic changed.
- 2026-07-30 — **Dashboard/profile merge REVERTED.** Two attempts (delete-placeholders, then keep-everything-and-badge) were both rejected on look; all 7 touched files restored byte-identical to 753c1e02, so `/dashboard` (mock) and `/profile` (real) are separate again. Only the post-login redirect to `/dashboard` was kept. Don't restructure the dashboard — see "Dashboard/profile merge — ATTEMPTED TWICE AND REVERTED" for what was tried, what got reverted, and the still-live `CountUp` scroll-trigger gotcha.
- 2026-07-29 — **Profile is now a real per-user account page**: new `GET /user/overview` (+ `user_service.py`, `GET /interview/list`, `summarize_interview`/`list_interviews`) feeds identity, stats, latest interview status and resumes, all scoped to the JWT user. Key insight: abandoned setup rows are the norm (27 rows / 4 submitted for user 1), so the page headlines `latest_completed` and discloses the unfinished setup instead of showing a stub as "latest". `feedback["total_questions"]` now persisted so reopened reports stop claiming every question was answered. Empty states never assert emptiness on a failed fetch. 44/44 functional checks + live verification. See "Profile = real per-user account page".
- 2026-07-17 — **Home button + job-side resume choice** (42f4bb0c): AppNav gains exact-matched Home→landing; new GET /jobs/resumes lets the job agent target its own resume (separate from the interview's), with selectable cards + empty state in job setup.
- 2026-07-17 — **App IA finalized** (c49ddb98): AppNav (Dashboard·Interview·Jobs) replaces ModeSwitch; logo→hub; avatar menu account-only; dashboard gets both-side launchers; profile gets cross-links. No false active state on shared pages. See "App information architecture".
- 2026-07-17 — **Question difficulty ladder** (1ab30c96): interviews now open with basic "what is/why is" fundamentals from the candidate's stack, then applied resume Qs, then tricky ones; tier enforced server-side even on jumbled LLM output. Root cause of the old behavior: the prompt explicitly banned generic questions.
- 2026-07-17 — **Parent landing + two parallel product pages** (e7288871): `/` advertises both sides with a hover-split "Pick Your Side"; `/practice` (interview) and `/find-jobs` (jobs) are twins on a shared SiteHeader/SiteFooter. Landing chunk 22→5.31 kB gzip. See "Public site structure".
- 2026-07-17 — **Two-sided workspace** (d764e52c): Interview/Jobs segmented switcher in header (route-derived active state), /jobs restyled as a 3-step flow page. Also applied missing phase4 migration to local dev DB (fixed designations 500). See "Two-sided workspace".
- 2026-07-15 — **Auth form validation** (cabfee3a): lib/validation.ts + inline per-field errors on login/register mirroring backend rules; verified live.
- 2026-07-15 — **Auth: mandatory unique phone + public_id UUID** (e9aca76b): register requires+dedups phone, per-user public_id handle, responses return user object, phase8 migration. Google login deferred (no OAuth id). See "Auth model".
- 2026-07-15 — **Fixed online login timeout** (4e28fe55): root cause = Render free-tier cold start (~50s) > 30s axios timeout. Auth calls now 90s + friendly "waking up" message. Ops TODO: keep-warm ping. Flagged stale gemini-2.0-flash in render.yaml.
- 2026-07-15 — **3D UI deep research done** (verifiers rate-limited; 25 claims manually assessed): OGL shader hero (~20 kB) recommended over three/R3F (~220 kB) for the next hero upgrade; Spline out. See "3D UI Research" section.
- 2026-07-14 — **Phase 4 rollout DONE** (3c6d65a5): display type + gradient keywords on every app screen h1, dashboard CountUp stats, jobs Reveal entrances, reduced-motion fixes. Pre-existing hook bugs flagged (not fixed).
- 2026-07-14 — **Feature fan cards image-filled** (46b3fbde): full-bleed arc/tour SVG art per feature (object-cover + bottom gradient + white icon/title/desc overlay). Mapping: question/tourInterview/tourDashboard/resume/interview/feedback. Verified live 5/5, 0 errors.
- 2026-07-14 — **Fan CardStack adopted** (be08a7f5): user-supplied ruixen source replaces simple stack; features + testimonials now 3D fan carousels; orbit/tilt layout removed. tailwind-merge/cn chunk gotcha + alpha-value dot gotcha recorded.
- 2026-07-14 — **Features section rework DONE** (9138f4bc): bento → cursor-tilt CardStack + orbiting icon ring (new motion/tilt-card.tsx). Verified live, 0 errors.
- 2026-07-14 — **Landing v2.1 DONE** (03868a34): 2nd user reference batch — card-stack testimonials (drag+auto-cycle), circular flip ring for tracks (spin/counter-spin), image auto-slider band, clip-path reveal on tour, arc-gallery fan back in hero. All verified live, 0 console errors.
- 2026-07-14 — **Landing v2 bold redesign DONE** (51d1bb0d): user pivoted from conservative facelift to award-site style (SPYLT/Kumo/Web3 refs). Giant display type (Space Grotesk), word-stagger hero + floating parallax cards + cursor glow, marquee bands, count-up stats, bento grid, outline numbers, massive CTA. Verified live incl. count-up settling. 161.3 kB gzip (+1.3 over target, disclosed). Design language for future screens = BOLD.
- 2026-07-14 — **UI redesign Phase 3 home page DONE** (gates lifted by user): arc hero w/ 11 inlined brand SVGs, limelight nav, interactive tracks, product swiper, testimonials, social icons; content/links/logic verbatim; 154 kB gzip ≤ 160 budget; render + assertions verified, zero console errors.
- 2026-07-14 — **UI redesign Phase 2 foundation DONE:** motion tokens + Reveal/Stagger/useMotionSafe, global MotionConfig reducedMotion="user", 6 in-house equivalents of the 21st.dev refs (registry now auth-gated — equivalents chosen after unanswered question; reversible via API key), components.json, launch.json. tsc+eslint+build pass; landing chunk byte-identical; live render verified, zero console errors. Awaiting approval.
- 2026-07-14 — **Job Search committed & pushed** (6a30626c feat 16 files, 0daff39e docs) — repo clean. **UI redesign Phase 1 strategy DONE** (FM-primary/GSAP-deferred, 3D Option B recommended, shadcn CLI init plan, motion tokens, 160 kB budget, 4 open decisions). Awaiting approval.
- 2026-07-14 — **UI redesign Phase 0 discovery DONE** (read-only): CSR SPA/no SSR, Tailwind v3 + shadcn tokens (no components.json), Framer Motion house lib, zero reduced-motion handling, R3F-v9-only pin for React 19, home-route baseline 156 kB gzip, hotlinked hero image + `<a href>` reload navigation flagged. Awaiting user approval for Phase 1.
- 2026-07-13 — **Job Search Agent Phase 2 DONE:** job_search_service (job-vs-chunks matching w/ canonical-doc-id fix + keyword/LLM degradation), /jobs routes (8 endpoints, ENABLE_JOB_SEARCH gate), frontend /jobs page (setup chips wizard + status table + header nav). Backend functional test + tsc + vite build all pass. Uncommitted.
- 2026-07-13 — **Job Search Agent BUILD START.** Phase 0 schema (4 models + phase7 SQL, create_all verified) + Phase 1 Greenhouse connector (pluggable job_sources package, live-verified 46 jobs from GitLab board). Committed 6261eea0 first (flow-gap fixes). See "Job Search Agent — BUILD IN PROGRESS".
- 2026-08-03 — **Netlify build fix:** `interview-result.tsx` coerces `completed_at` null to `undefined` for `formatCompletedAt`; removed unused `React` import in `stepper.tsx` (tsc -b strict).
- 2026-07-13 — Designed **Job Search Agent** feature roadmap with user (planning only, no code). Assisted-apply status table + ATS-connector sourcing (Greenhouse/Lever/Workday) + resume-RAG matching + APScheduler digest. Setup flow mirrors interview wizard (resume-only first); designations auto-derived by Gemini but user-overridable/non-permanent (one resume → many roles, incl. a role different from profile). See "Proposed Feature — Job Search Agent".
- 2026-07-02 — **Flow-gap fixes (user request: verify upload→extract→questions flow):** (1) Gemini-vision OCR fallback for scanned/image PDFs (`ocr_pdf_with_gemini`, trigger `_MIN_PDF_TEXT_CHARS=120`, flag `ENABLE_PDF_OCR`) — previously image PDFs hard-failed with "Resume text is empty"; (2) web research of commonly-asked questions per role/experience via Google Search grounding (`question_research_service.py`, flag `ENABLE_QUESTION_RESEARCH`), blended into LLM prompt + fallback; (3) shared `llm_service.generate_content_rest` REST helper. All live-tested OK (OCR exact transcription; research source=web). Note: flow has NO queue — indexing/generation are synchronous request/response (fine at current scale).
- 2026-06-26 — **Diagnosed repetitive-questions root cause: Gemini free-tier quota = `limit: 0`** (live 429 test). LLM never runs → deterministic fallback every time. See AI Layer § CRITICAL KNOWN ISSUE.
- 2026-06-26 — Question generation hardened: personalized RAG query (role/experience/skills), prompts force resume-specific questions, full traceback logging, content-aware fallback (real resume text, not generic templates). Files: routes/interview.py, services/question_service.py.
- 2026-06-26 — Added LLM-based intelligent resume extraction (`resume_parser.extract_sections` → `parse_sections_llm`, Gemini temp 0, heuristic fallback) gated by `ENABLE_LLM_RESUME_PARSING`. `strip_pii` extended with `_LOCATION_PATTERNS` (city/state/India). index_resume now calls `extract_sections`. Verified PII removal + content preservation on the real resume.
- 2026-06-26 — Fixed local boot bug: `config.Settings` rejected `.env`'s `ALLOWED_ORIGINS` (extra key) → added `extra = "ignore"` to Settings.Config. `ALLOWED_ORIGINS` is read directly in main.py via os.environ.
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
