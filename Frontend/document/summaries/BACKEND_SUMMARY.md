# TalentPulseAI — Backend Summary

**Last Updated:** 2026-06-19  
**Stack:** FastAPI 0.110 · SQLAlchemy 2.0 · PostgreSQL · pgvector · LangChain · Google AI

---

## What It Does

REST API for an AI-powered mock-interview platform. Handles user auth, interview session lifecycle, resume RAG indexing (with PII stripping and embedding dedup), answer scoring, and feedback generation.

---

## Entry Point

`app/main.py` — FastAPI app, CORS (localhost:3000/5173), `Base.metadata.create_all`, 3 routers: `/auth`, `/user`, `/interview`.

**Run:** `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`  
**Docs:** http://localhost:8000/docs

---

## Folder Structure

```
TalentPulseAI-fastAPI/
├── app/
│   ├── main.py
│   ├── core/          config.py, jwt.py, security.py
│   ├── database/      db.py (engine), deps.py (get_db)
│   ├── dependencies/  auth.py (get_current_user)
│   ├── models/        user, profile, skill, education, document, preferences, interview, resume
│   ├── routes/        auth.py, user.py, interview.py
│   ├── schemas/       user_schema.py, interview_schema.py, resume_rag_schema.py
│   └── services/      auth, interview, scoring, resume_rag, embedding, resume_parser
├── migrations/        phase4_add_content_hash_and_embedding_cache.sql
├── requirements.txt
└── .env               (not committed — contains DB URLs and API keys)
```

---

## Database

**Two PostgreSQL instances:**
| | Port | Purpose |
|---|---|---|
| Main DB | 5432 | App data (users, interviews, etc.) |
| Vector DB | 5433 | pgvector embeddings |

**Tables (created via `create_all`, no Alembic):**

| Table | Key Columns |
|---|---|
| `users` | id, email, password |
| `profiles` | user_id (1:1), full_name, phone, location, linkedin_url, github_url |
| `skills` | user_id, name, level (1–5), category |
| `education` | user_id, degree, university, field |
| `documents` | user_id, type, file_url (S3) |
| `career_preferences` | user_id (1:1), preferred_role, work_mode, salary range |
| `interviews` | interview_id, user_id, role, experience, difficulty, skills (JSON), status, answers (JSON), feedback (JSON), completed_at |
| `resume_documents` | user_id, interview_id, raw_text, content_hash (SHA-256), parsed_sections (JSON) |
| `resume_chunks` | resume_document_id, chunk_index, section, chunk_text, metadata_json |
| `embedding_cache` | user_id, content_hash UNIQUE, source_resume_document_id — dedup table |

**Manual migration needed for existing DBs:**
```sql
ALTER TABLE resume_documents ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);
-- See migrations/phase4_add_content_hash_and_embedding_cache.sql for full script
```

---

## API Endpoints

### Auth (`/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Create account → returns JWT |
| POST | `/auth/login` | ❌ | Login → returns JWT |

### User (`/user`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/user/profile` | ✅ | Fetch current user's profile |

### Interview (`/interview`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/interview/setup` | ✅ | Create interview session (role, experience, difficulty, skills) |
| POST | `/interview/resume/index` | ✅ | Index resume into pgvector (RAG) |
| POST | `/interview/context/retrieve` | ✅ | Similarity search for question context |
| GET | `/interview/{id}` | ✅ | Get interview details |
| PUT | `/interview/{id}/progress` | ✅ | Save partial progress |
| POST | `/interview/{id}/submit` | ✅ | Submit answers → scores + feedback |
| GET | `/interview/{id}/results` | ✅ | Fetch persisted score/feedback |

---

## Service Layer

### `auth_service.py`
- `signup_user()` — hash password, create User + Profile, check email uniqueness
- `login_user()` — verify bcrypt, generate JWT HS256 (30 min expiry)

### `interview_service.py`
- `create_interview()` — inserts Interview row, returns record
- `get_interview()` — lookup by interview_id + user_id
- `submit_interview()` — calls scoring, writes answers/feedback/completed_at to DB

### `scoring_service.py` (pure functions, no external AI)
- `score_answer(answer, skills)` — word count (depth) + STAR markers (structure) + keyword match → 0–100
- `build_interview_feedback(answers, skills)` — aggregates scores, generates strengths/improvements/next_steps
- Tiers: excellent ≥80, good ≥65, developing <65

### `resume_parser.py`
- `extract_text_from_pdf_b64()` — base64 decode → pypdf
- `parse_sections()` — splits resume into safe sections (summary, experience, projects, skills, education, certifications, achievements); drops the PII-heavy "general" header block
- `strip_pii(text)` — removes email, phone, address, postal code, URLs via regex
- `compute_content_hash(sections)` — SHA-256 of sorted, PII-stripped sections (used for dedup)
- `extract_summary()` — detects years, email, phone from raw text (stored in DB metadata only, never embedded)

### `embedding_service.py`
- Provider dispatch via `get_embeddings_for_settings(settings)`:
  - `EMBEDDING_PROVIDER=google` → `GoogleGenerativeAIEmbeddings` (model: `text-embedding-004`, 768-dim)
  - `EMBEDDING_PROVIDER=cursor` → `OpenAIEmbeddings` (legacy, 1536-dim)
  - Fallback → `LocalHashEmbeddings` (SHA-256 bucketing, 768-dim, deterministic)
- All clients `@lru_cache`'d — built once per process
- `get_vector_store()` → PGVector (langchain-postgres or langchain-community)

### `resume_rag_service.py` + `get_rag_service()`
- `ResumeRAGService` is a singleton via `@lru_cache(maxsize=1)` on `get_rag_service()`
- **`index_resume()`:**
  1. Parse → section-aware chunks (700 chars / 120 overlap)
  2. Strip PII from each chunk
  3. Check `EmbeddingCache` for content hash → if hit, copy chunks, skip embedding
  4. If miss: embed → store in pgvector → write `EmbeddingCache` entry
  5. Fallback chain: Google → LocalHash → SQL-only (no vectors)
- **`retrieve_context()`:**
  1. Enriched query (role + experience + difficulty + skills + question)
  2. pgvector similarity search filtered by (user_id, interview_id, setup_id)
  3. Fallback: LocalHash store → SQL chunks

---

## Configuration (`app/core/config.py`)

Key env vars (in `.env`, never committed):

| Variable | Purpose | Default |
|---|---|---|
| `DATABASE_URL` | Main PostgreSQL connection | — |
| `VECTOR_DB_URL` | pgvector PostgreSQL connection | — |
| `SECRET_KEY` | JWT signing key | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `30` |
| `EMBEDDING_PROVIDER` | `google` or `cursor` | `google` |
| `GOOGLE_API_KEY` | Google AI free tier key | — |
| `GOOGLE_EMBEDDING_MODEL` | Embedding model | `models/text-embedding-004` |
| `CURSOR_API_KEY` | Legacy (expired) | — |
| `RAG_COLLECTION` | pgvector collection name | `talentpulse_resume_chunks` |

---

## Completion Status

| Area | Status |
|---|---|
| Auth endpoints | ✅ Complete |
| Interview setup + submission | ✅ Complete |
| RAG indexing (upload path) | ✅ Complete |
| PII stripping | ✅ Complete |
| Embedding dedup | ✅ Complete |
| Scoring engine | ✅ Complete |
| Feedback persistence | ✅ Complete |
| User profile GET | ✅ Complete |
| User profile PUT/edit | ❌ Not started |
| Interview list endpoint | ❌ Not started |
| "Use Existing Profile" RAG | ❌ Not started |
| Dashboard analytics API | ❌ Not started |
| S3 document upload | ❌ Not started |
| Alembic migrations | ❌ Not started |
| Docker/deployment | ❌ Not started |
| Test suite | ❌ Not started |
