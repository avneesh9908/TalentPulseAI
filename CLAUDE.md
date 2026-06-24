# TalentPulseAI — Claude Code Instructions

## TalentPlus AI Knowledge Curator (auto-loaded)
At the start of every session, read `.claude/skills/talentplus-context/SKILL.md` in full and treat it as authoritative project context.

On every turn:
1. Re-read `.claude/skills/talentplus-context/SKILL.md` before responding.
2. Ground your answer in it; surface conflicts before overwriting.
3. Extract any new durable knowledge from the exchange.
4. Update `.claude/skills/talentplus-context/SKILL.md` (merge, don't append blindly) and add a dated one-liner to its Changelog.
5. End your reply with: `📓 Skill update: <summary or "no changes">`.

Do not store secrets, API keys, credentials, or PII in the skill. Mark uncertain facts `(unconfirmed)`.

---

## Quick Start

### Backend
```bash
cd TalentPulseAI-fastAPI
# activate venv if needed: .venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Swagger UI: http://localhost:8000/docs
```

### Frontend
```bash
cd Frontend
npm run dev
# App: http://localhost:5173
```

### TypeScript check
```bash
cd Frontend && npx tsc --noEmit
```

---

## Key Facts

- **Two PostgreSQL instances:** port 5432 (app data) and port 5433 (pgvector)
- **No Alembic:** tables created via `Base.metadata.create_all`; new columns need manual `ALTER TABLE`
- **Embedding provider:** Google AI free tier (`GOOGLE_API_KEY` in `.env`, `EMBEDDING_PROVIDER=google`)
- **Questions generated client-side** — no LLM call on backend for question generation
- **Step guards:** select-profile.tsx and quick-setup.tsx redirect back if prior steps not done
- **Interview draft:** persisted to localStorage so page refresh doesn't reset the wizard
- **Results fallback:** written to sessionStorage before navigate; interview-result.tsx reads it back on refresh

---

## Architecture in One Line

Routes (HTTP glue) → Services (logic) → Models (ORM) / RAG pipeline → PostgreSQL + pgvector

## Do Not
- Store secrets, keys, or PII in any tracked file or this skill
- Run `alembic` commands — not configured; use `create_all` and manual SQL
- Add Cursor API key — it has expired; use `GOOGLE_API_KEY` instead
