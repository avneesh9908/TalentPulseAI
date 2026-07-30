# TalentPulse AI — Project Context

## Overview
TalentPulseAI is a full-stack AI-powered mock-interview platform. Users upload a resume or select an existing profile, configure an interview (role, experience, difficulty, skills), then take a live interview with Web Speech API transcription and video recording. The backend uses RAG (resume chunked into a pgvector store) to supply context for question generation. Answers are scored automatically and a feedback report is returned.

**Completion state:** ~85% complete. Core auth, full interview setup → execution → scoring → results flow, RAG pipeline, PII stripping, embedding dedup, and UI flow guards are all done. **The dashboard is the single merged account+analytics page** — real per-user data throughout (identity, stats, score chart, interview history, resumes); `/profile` is merged into it and now redirects there. Editing your details / changing password is still not built. No Alembic migrations (tables created via `create_all`).

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
    dashboard/          dashboard.tsx THE merged hub — real GET /user/overview data: account details, stats, score chart, latest interview + history w/ report re-open, resumes, both side launchers
    interview/
      select-role.tsx   Step 1 — role selection (8 roles)
      select-profile.tsx Step 2 — upload resume or existing profile (step guard: needs role)
      quick-setup.tsx   Step 3 — experience/difficulty/skills + API submission (step guard: needs role+profile)
      interview-now.tsx Step 4 — live interview (Web Speech API, 2-min timer, video)
      interview-result.tsx Results (reads from location.state OR sessionStorage fallback)
    (profile/profile.tsx DELETED 2026-07-30 — merged into dashboard.tsx; /profile route is a <Navigate to="/dashboard">)
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
- Dashboard analytics are REAL as of 2026-07-30 (stats, score chart, latest interview, recent list, account, resumes). Four sections remain design placeholders and are kept **with a "Sample" badge** at the user's explicit request: Skill Analysis radar, Upcoming, AI Suggestions, Achievements. Keep the badge until real data backs them.
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
| Dashboard (merged hub, real data) | ✅ Done |
| Dashboard real analytics | ✅ Done (stats + score chart from /user/overview) |
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
- **MERGED INTO THE DASHBOARD 2026-07-30** (see "Dashboard = merged account + analytics hub" below). The bullets below describe logic that now lives in `dashboard/dashboard.tsx`; `profile/profile.tsx` was deleted.
- **Frontend** (originally `profile/profile.tsx`): server is the source of truth, cached login payload is the fallback. `openReport(interviewId)` fetches `GET /interview/{id}/results`, writes the same `{result,totalQuestions,answeredQuestions}` shape + `talentpulse_last_result` sessionStorage key that a fresh submit writes, then navigates to `/interview/result` — so the existing report page works unchanged and survives refresh. `getUserOverview()` in `api/userService.ts`; `ENDPOINTS.PROFILE.OVERVIEW`.
- **Never assert emptiness you can't verify:** `dataLoaded = overview !== null` gates every empty state. On a failed fetch the page says "couldn't be loaded", NOT "no interviews"/"no resume" (that bug shipped briefly and was caught live by stopping the backend).
- **Status vocabulary:** the backend only ever writes `initialized` or `submitted` (3 write sites, verified). UI labels them "Not completed" / "Completed" — **never "In progress"**, and never offers to resume: no questions/answers exist server-side before submit, so resumption is impossible.
- Verified: 44/44 backend checks; tsc + eslint + build clean; live on localhost with 4 seeded interviews — populated, empty, and API-down states all correct, 0 console errors, report round-trip + refresh OK.
- **Deferred (found by review, NOT fixed — all pre-existing or out of scope):** `talentpulse_last_result` is not cleared by `authService.clearClientSession()` → a report can outlive logout in a shared tab (fix: add the removeItem there; also covers interview-now.tsx:317); `axiosInstance` only rewrites `error.message` for timeouts, so inline banners app-wide show axios's generic string instead of the FastAPI `detail`; **dashboard is still mock and now visibly contradicts the profile's real numbers** (feed it this same endpoint); `/user/profile` still returns the internal sequential `id`; `list_resumes` is reached through `job_search_service`, bypassing the `ENABLE_JOB_SEARCH` gate (flag is never actually false); no pagination for >5 completed and `/interview/list` is unbounded + currently unused; "Change Password" is an inert button with full affordance.
- **Local dev seeded test data:** `localtest10413@test.com` (user id 3) now has 4 seeded interviews (2 submitted 72/84, 1 initialized, 1 abandoned "Data Analyst") + 1 fake `sample-resume.pdf` row, added to verify this page. Delete by `interview_id LIKE 'interview_3_seed%'` if unwanted.
- `.claude/launch.json` gained a **`backend`** config (uvicorn --reload on 127.0.0.1:8000) so the API can be started via the preview tooling alongside `frontend`.

## Dashboard = merged account + analytics hub (2026-07-30) — CURRENT
User ask: "after login render on home / dashboard profile merge give all detail in dashboard / all details shift on dashboard show profile type and dashboard."
- **Login now lands on `/dashboard`** (`auth-context.login` → `navigate("/dashboard")`, was `/interview/select-role`). Register auto-logins, so it follows too.
- **`/profile` is merged away:** route is `<Route path="/profile" element={<Navigate to="/dashboard" replace />} />` (kept so old links/bookmarks resolve); `app/pages/profile/profile.tsx` **deleted**; header avatar menu item relabelled **"Account"** and points at `/dashboard`.
- **`dashboard.tsx` now holds everything**, all from one `GET /user/overview` call: welcome line, the two side launchers (Interview Practice / Job Search), 4 real stat cards (Interviews Completed +unfinished hint · Average · Best · Resumes On File), a real **Score History** area chart, the Latest Interview card (status/score/View report + unfinished-setup disclosure + earlier-interviews list with per-row Report), an **Your Account** card (avatar, name, email, phone, public_id) and a **Resumes** card. Same `openReport()` contract as before (fetch results → sessionStorage + navigate to `/interview/result`).
- **`score_trend` added to `/user/overview`**: scored interviews only, **oldest-first**, capped at 12, each `{interview_id, role, score, completed_at}`. Chart renders only at ≥2 points (1 point = "complete another to see a trend", 0 = empty state); a real `ReferenceLine` at `stats.average_score` replaced the old invented "target" series.
- ⚠️ **First attempt DELETED the placeholder sections; user rejected that** ("i want to like not remove anythings on dashboard keep everything only adjust"). **Current rule: keep every section, badge the un-backed ones.** The original dashboard was restored from 753c1e02 and the real data + account/resume cards were added into it.
  - **Real (per-user, from /user/overview):** stat cards (Total · Completed · Not Completed · Average +best hint), Performance Over Time chart + its Best/Improvement/Completed tiles, NEW Latest Interview card, Recent list (real scored interviews, each with View report), NEW Your Account card, NEW Resumes card, welcome name, avatars, today's date.
  - **Placeholder, kept but flagged with `<SampleBadge />`** (amber "Sample" chip + honest subtitle): Skill Analysis radar (no per-skill scores exist), Upcoming (no scheduling concept), AI Suggestions, Achievements. `scoreHistoryPlaceholder` also backs the chart when the user has <2 scored interviews, badged in that state. **Don't un-badge or reintroduce these as real without real data behind them.**
  - `StatCard` lost the invented `change` percentages and gained an optional factual `hint`. Sidebar nav items now navigate for real (Dashboard/Interview/Job Search) and it gained an account snapshot; dead "Join"/"View all"/"Full history" buttons dropped.
  - Dashboard chunk 399 → 417 kB raw (114.7 → 118.7 gzip) — grew because the page now holds both the original sections and the merged account/resume/latest-interview content.
- 🔴 **`CountUp` GOTCHA (fixed, but know why):** `CountUp` is scroll-triggered (`useInView once`) and its state starts at `"0" + suffix`, so **until it scrolls into view it renders `0`**. Harmless for the landing page's decorative "50K+", but on a stat card "0 Interviews Completed" is indistinguishable from real data — and it was reproducing exactly that (all four cards read 0 in a 393px-tall viewport). Fixed by adding an opt-in **`startOnMount`** prop (`shouldRun = startOnMount || inView`); the dashboard passes it. Default stays `false` so landing/practice counters keep their scroll-triggered behaviour (re-verified live: 50K+/85%/24/7/4.9★ still animate). **Any future real-data CountUp must pass `startOnMount`.**
- Verified: 47/47 backend checks; tsc + eslint + build clean; live — stats 2/78/84/1 matching seeded data, chart with 2 points + avg line, `/profile`→`/dashboard` redirect, report re-open (score 84, 0 console errors), correct on mobile 375px with cards off-screen. Login redirect verified by code only (can't submit credentials).

## Two-sided workspace (2026-07-17, commit d764e52c) — SUPERSEDED by the IA above (ModeSwitch → AppNav)
The product is now explicitly **two sides: Interview practice + Job Search**, switched globally from the header.
- `components/mode-switch.tsx` — segmented control (researched pattern: segmented control in top bar for mutually-exclusive global modes; top bar owns app-wide things). Gradient pill slides via `layoutId="mode-switch-pill"` + SPRING. **Active side derived from `useLocation().pathname`** (`/jobs*` → jobs, else interview) so deep links/back-forward stay correct. Clicking the current side is a no-op (doesn't reset progress in that flow). Props: `stacked` (mobile full-width), `onNavigate` (closes mobile menu). Homes: interview → `/interview/select-role`, jobs → `/jobs`.
- Header: switcher centered desktop (`hidden md:block`), top of mobile menu; "Quick Interview" button demoted to `lg:flex` for space.
- `/jobs` restyled to mirror interview step pages: JOB AGENT badge chip, display headline "FIND YOUR NEXT ROLE", 3-step rail (`FLOW_STEPS`) driven by `activeStep = mode==="setup" ? 0 : matches.length===0 ? 1 : 2`. All setup/table logic untouched.
- **Local dev DB drift fixed same session:** `phase4_add_content_hash_and_embedding_cache.sql` had never been applied locally → `/jobs/designations/suggest` 500'd on `resume_documents.content_hash does not exist`. Applied; now returns a graceful 404 ("upload a resume first") for users with no resume. **Local dev DB has phase4 + phase8 applied as of 2026-07-17.**
- Local test account for verifying protected pages: `localtest10413@test.com` / `secret1234` (has NO resume — job flow stops at the resume-required step).

## Deployment / Ops
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
- 2026-07-30 — **Dashboard restored + profile added into it** (follow-up): the first pass deleted the placeholder sections and the user rejected that — keep every section, wire real data into the ones that can be real, and badge the rest "Sample". Original dashboard restored from 753c1e02; Latest Interview / Your Account / Resumes cards added; stat cards, chart and Recent list now real.
- 2026-07-30 — **Dashboard + profile merged into one real hub**: login lands on `/dashboard`, `/profile` redirects there (profile.tsx deleted), and the dashboard now serves account details, real stats, a real score-history chart (`score_trend` added to /user/overview), interview history with report re-open, and resumes. All fabricated sections (upcoming interviews, achievements, AI suggestions, skill radar, fake sidebar/date/change-badges) deleted rather than shown next to real data. Found and fixed a real bug: `CountUp` renders `0` until scrolled into view, so all four stat cards showed 0 — new opt-in `startOnMount` prop, required for any real-data counter. See "Dashboard = merged account + analytics hub".
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
