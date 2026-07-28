"""
Job Search Agent service.

Efficiency contract (locked with user):
- The resume is NEVER re-embedded here. Matching is "job-vs-chunks": each new
  job description is embedded once (one batched call per run) and searched
  against the user's EXISTING resume chunk vectors created at interview time.
- A listing is scored at most once per user (JobMatch UNIQUE(user_id, listing));
  re-fetches of unchanged postings cost zero embedding/LLM calls.
- Every AI step degrades: embeddings fail -> keyword score; LLM fail -> match
  stored without reasons. A search run never 500s because one provider is down.
"""
import re
from typing import Dict, List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.job_search import JobListing, JobMatch, JobSearchProfile, TargetCompany
from app.models.resume import EmbeddingCache, ResumeDocument
from app.services import embedding_service, llm_service
from app.services.job_sources import available_ats_types, get_connector

MATCH_STATUSES = {"new", "reviewed", "pending_apply", "applied", "dismissed"}
# Below this vector/keyword score a listing is considered noise and not stored.
_MIN_STORE_SCORE = 25.0
# Only the strongest matches get an LLM why-fits/gaps pass (quota control).
_LLM_REASON_TOP_N = 10
_EMBED_TEXT_CHARS = 4000
_RESUME_PROMPT_CHARS = 3000


# ── Resume + setup ────────────────────────────────────────────────────────────
def resolve_resume_document(
    db: Session, user_id: int, resume_document_id: Optional[int] = None
) -> ResumeDocument:
    query = db.query(ResumeDocument).filter(ResumeDocument.user_id == user_id)
    if resume_document_id is not None:
        doc = query.filter(ResumeDocument.id == resume_document_id).first()
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume document not found for this user",
            )
        return doc
    doc = query.order_by(ResumeDocument.id.desc()).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found — upload a resume via the interview flow first",
        )
    return doc


def list_resumes(db: Session, user_id: int) -> List[Dict]:
    """
    Resumes this user has indexed, newest first — so the job side can choose
    its OWN source explicitly instead of silently inheriting whichever resume
    the interview flow happened to upload last.
    """
    docs = (
        db.query(ResumeDocument)
        .filter(ResumeDocument.user_id == user_id)
        .order_by(ResumeDocument.id.desc())
        .all()
    )
    return [
        {
            "id": d.id,
            "file_name": d.file_name or "Resume",
            "role": d.role,
            "experience": d.experience,
            "skills": list(d.skills or [])[:8],
            "source": d.source,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in docs
    ]


def _resume_text(doc: ResumeDocument, limit: int = _RESUME_PROMPT_CHARS) -> str:
    sections = doc.parsed_sections or {}
    joined = "\n\n".join(f"{name}: {text}" for name, text in sections.items() if text)
    return joined[:limit]


def suggest_designations(
    db: Session, user_id: int, resume_document_id: Optional[int] = None
) -> Dict:
    """Gemini derives target job titles from the resume; user edits before saving."""
    doc = resolve_resume_document(db, user_id, resume_document_id)
    text = _resume_text(doc)
    if llm_service.llm_enabled() and text:
        prompt = (
            "Based on this resume content, list the job designations (titles) this "
            "candidate is qualified to apply for today. Include adjacent roles their "
            "skills support, not just their current title.\n"
            "Return ONLY a JSON array of 3-6 short title strings, e.g. "
            '["Python Developer", "Backend Developer"].\n\n'
            f"Resume (PII removed):\n{text}"
        )
        try:
            content = llm_service.chat_model(temperature=0.2).invoke(prompt).content
            titles = [str(t).strip() for t in llm_service.parse_json(content) if str(t).strip()]
            if titles:
                return {"resume_document_id": doc.id, "designations": titles[:6], "source": "llm"}
        except Exception as err:
            print(f"[job_search] designation suggestion LLM failed: {err}")
    fallback = [doc.role] if doc.role else []
    return {"resume_document_id": doc.id, "designations": fallback, "source": "fallback"}


def get_setup(db: Session, user_id: int) -> Optional[JobSearchProfile]:
    return db.query(JobSearchProfile).filter(JobSearchProfile.user_id == user_id).first()


def save_setup(db: Session, user_id: int, payload) -> JobSearchProfile:
    """Upsert — re-setup overwrites the single row per user."""
    doc = resolve_resume_document(db, user_id, payload.resume_document_id)
    profile = get_setup(db, user_id)
    if profile is None:
        profile = JobSearchProfile(user_id=user_id)
        db.add(profile)
    profile.setup_source = "resume"
    profile.resume_document_id = doc.id
    profile.target_designations = [d.strip() for d in payload.target_designations if d.strip()]
    profile.locations = payload.locations or []
    profile.remote_ok = payload.remote_ok
    profile.seniority = payload.seniority
    profile.min_salary = payload.min_salary
    profile.is_active = True
    db.commit()
    db.refresh(profile)
    return profile


def setup_response(profile: JobSearchProfile) -> Dict:
    return {
        "id": profile.id,
        "setup_source": profile.setup_source,
        "resume_document_id": profile.resume_document_id,
        "target_designations": profile.target_designations or [],
        "locations": profile.locations or [],
        "remote_ok": profile.remote_ok,
        "seniority": profile.seniority,
        "min_salary": profile.min_salary,
        "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
    }


# ── Target companies ──────────────────────────────────────────────────────────
def list_companies(db: Session) -> List[TargetCompany]:
    return db.query(TargetCompany).order_by(TargetCompany.name.asc()).all()


def add_company(db: Session, payload) -> TargetCompany:
    ats = (payload.ats_type or "").strip().lower()
    if get_connector(ats) is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported ats_type '{ats}'. Available: {available_ats_types()}",
        )
    slug = (payload.board_slug or "").strip().lower()
    existing = (
        db.query(TargetCompany)
        .filter(TargetCompany.ats_type == ats, TargetCompany.board_slug == slug)
        .first()
    )
    if existing:
        existing.name = payload.name
        existing.careers_url = payload.careers_url
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return existing
    row = TargetCompany(name=payload.name, ats_type=ats, board_slug=slug, careers_url=payload.careers_url)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


# ── Matching internals ────────────────────────────────────────────────────────
def _canonical_vector_doc_id(db: Session, doc: ResumeDocument) -> int:
    """
    Chunks copied via the embedding-dedup short-circuit keep the ORIGINAL
    document's id in vector-store metadata, so vector filters must target the
    cache's source document, not the copy.
    """
    if doc.content_hash:
        entry = (
            db.query(EmbeddingCache)
            .filter(
                EmbeddingCache.user_id == doc.user_id,
                EmbeddingCache.content_hash == doc.content_hash,
            )
            .first()
        )
        if entry:
            return entry.source_resume_document_id
    return doc.id


def _embed_job_texts(texts: List[str]) -> Optional[List[List[float]]]:
    """One batched embedding call per search run; None → caller uses keyword fallback."""
    if not texts:
        return []
    try:
        embeddings = embedding_service.get_embeddings_for_settings(settings)
        return embeddings.embed_documents(texts)
    except Exception as err:
        print(f"[job_search] job embedding failed; using keyword fallback: {err}")
        return None


def _tokens(value: str) -> List[str]:
    return [t for t in re.split(r"[^a-z0-9+#]+", (value or "").lower()) if len(t) >= 3]


def _keyword_score(listing: JobListing, designations: List[str], skills: List[str]) -> float:
    """Deterministic fallback score when embeddings are unavailable."""
    haystack = f"{listing.title} {(listing.description or '')[:1500]}".lower()
    terms = {tok for src in list(designations) + list(skills) for tok in _tokens(src)}
    if not terms:
        return 30.0
    hits = sum(1 for t in terms if t in haystack)
    return round(min(70.0, 30.0 + 40.0 * hits / len(terms)), 1)


def _designation_for_title(title: str, designations: List[str]) -> Optional[str]:
    t = (title or "").lower()
    for d in designations:
        if any(tok in t for tok in _tokens(d)):
            return d
    return designations[0] if designations else None


def _score_listings(
    db: Session,
    user_id: int,
    resume_doc: ResumeDocument,
    candidates: List[JobListing],
    designations: List[str],
) -> List[Tuple[JobListing, float]]:
    """Job-vs-chunks: job vector queried against the user's existing resume vectors."""
    if not candidates:
        return []
    skills = list(resume_doc.skills or [])
    texts = [f"{l.title}\n{(l.description or '')[:_EMBED_TEXT_CHARS]}" for l in candidates]
    vectors = _embed_job_texts(texts)

    store = None
    if vectors:
        try:
            embeddings = embedding_service.get_embeddings_for_settings(settings)
            store = embedding_service.get_vector_store(
                embeddings=embeddings,
                collection_name=settings.RAG_COLLECTION,
                vector_db_url=settings.VECTOR_DB_URL or settings.VECTOR_DATABASE_URL,
            )
        except Exception as err:
            print(f"[job_search] vector store unavailable; using keyword fallback: {err}")

    if not vectors or store is None:
        return [(l, _keyword_score(l, designations, skills)) for l in candidates]

    vector_filter = {
        "user_id": user_id,
        "resume_document_id": _canonical_vector_doc_id(db, resume_doc),
    }
    results: List[Tuple[JobListing, float]] = []
    for listing, vec in zip(candidates, vectors):
        try:
            matches = store.similarity_search_with_score_by_vector(vec, k=4, filter=vector_filter)
            # PGVector returns cosine distance (lower = closer).
            sims = [max(0.0, min(1.0, 1.0 - float(dist))) for _, dist in matches]
            if sims:
                score = round(100.0 * (0.6 * max(sims) + 0.4 * (sum(sims) / len(sims))), 1)
            else:
                score = _keyword_score(listing, designations, skills)
        except Exception as err:
            print(f"[job_search] vector scoring failed for listing={listing.id}: {err}")
            score = _keyword_score(listing, designations, skills)
        results.append((listing, score))
    return results


def _llm_reasons(resume_text: str, top: List[Tuple[JobListing, float]]) -> Dict[int, Dict]:
    """One batched Gemini call for why-fits/gaps on the strongest matches. Best-effort."""
    if not top or not llm_service.llm_enabled():
        return {}
    job_lines = "\n".join(
        f"{i}. {l.title} @ {l.company} — {(l.description or '')[:400]}"
        for i, (l, _) in enumerate(top)
    )
    prompt = (
        "You are screening job postings for a candidate. For EACH numbered job below, "
        "compare it against the resume and return STRICT JSON only:\n"
        '[{"index": <job number>, "fits": ["short reason", ...], "gaps": ["short gap", ...]}]\n'
        "Max 3 fits and 2 gaps per job, each under 12 words.\n\n"
        f"Resume (PII removed):\n{resume_text}\n\nJobs:\n{job_lines}"
    )
    try:
        content = llm_service.chat_model(temperature=0.2).invoke(prompt).content
        data = llm_service.parse_json(content)
        out: Dict[int, Dict] = {}
        for entry in data if isinstance(data, list) else []:
            idx = entry.get("index")
            if isinstance(idx, int) and 0 <= idx < len(top):
                out[idx] = {
                    "fits": [str(x) for x in (entry.get("fits") or [])][:3],
                    "gaps": [str(x) for x in (entry.get("gaps") or [])][:2],
                }
        return out
    except Exception as err:
        print(f"[job_search] match-reason LLM failed (matches stored without reasons): {err}")
        return {}


# ── Search run ────────────────────────────────────────────────────────────────
def run_search(db: Session, user_id: int) -> Dict:
    profile = get_setup(db, user_id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job search setup not found — complete setup first",
        )
    resume_doc = db.get(ResumeDocument, profile.resume_document_id) if profile.resume_document_id else None
    if resume_doc is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Setup has no linked resume — run re-setup",
        )

    designations = list(profile.target_designations or [])
    companies = db.query(TargetCompany).filter(TargetCompany.is_active.is_(True)).all()

    # ── Fetch + upsert listings (dedup by (source, external_id)) ──────────────
    listings_fetched = 0
    new_listings = 0
    seen: Dict[Tuple[str, str], JobListing] = {}
    for company in companies:
        connector = get_connector(company.ats_type)
        if connector is None:
            print(f"[job_search] no connector for ats_type={company.ats_type}; skipping {company.name}")
            continue
        raw_jobs = connector.fetch(company.board_slug, company.name, designations)
        listings_fetched += len(raw_jobs)
        for raw in raw_jobs:
            key = (raw.source, raw.external_id)
            if key in seen:
                continue
            listing = (
                db.query(JobListing)
                .filter(JobListing.source == raw.source, JobListing.external_id == raw.external_id)
                .first()
            )
            if listing is None:
                listing = JobListing(
                    source=raw.source,
                    external_id=raw.external_id,
                    company=raw.company,
                    title=raw.title,
                    location=raw.location,
                    remote=raw.remote,
                    url=raw.url,
                    description=raw.description,
                    salary=raw.salary,
                    posted_at=raw.posted_at,
                    content_hash=raw.content_hash,
                )
                db.add(listing)
                new_listings += 1
            elif listing.content_hash != raw.content_hash:
                listing.title = raw.title
                listing.location = raw.location
                listing.remote = raw.remote
                listing.url = raw.url
                listing.description = raw.description
                listing.salary = raw.salary
                listing.posted_at = raw.posted_at
                listing.content_hash = raw.content_hash
            seen[key] = listing
    db.flush()  # assign ids to new listings

    # ── Score only listings this user hasn't been matched against yet ─────────
    already_matched = {
        row[0]
        for row in db.query(JobMatch.job_listing_id).filter(JobMatch.user_id == user_id).all()
    }
    candidates = [l for l in seen.values() if l.id not in already_matched]

    scored = _score_listings(db, user_id, resume_doc, candidates, designations)
    kept = sorted(
        (item for item in scored if item[1] >= _MIN_STORE_SCORE),
        key=lambda item: item[1],
        reverse=True,
    )
    reasons = _llm_reasons(_resume_text(resume_doc), kept[:_LLM_REASON_TOP_N])

    new_matches = 0
    for i, (listing, score) in enumerate(kept):
        db.add(
            JobMatch(
                user_id=user_id,
                job_search_profile_id=profile.id,
                job_listing_id=listing.id,
                designation=_designation_for_title(listing.title, designations),
                match_score=score,
                match_reasons=reasons.get(i, {}),
                status="new",
                apply_url=listing.url,
            )
        )
        new_matches += 1
    db.commit()

    matches_total = db.query(JobMatch).filter(JobMatch.user_id == user_id).count()
    message = "Search complete"
    if not companies:
        message = "No target companies configured — add companies via POST /jobs/companies"
    return {
        "companies_checked": len(companies),
        "listings_fetched": listings_fetched,
        "new_listings": new_listings,
        "new_matches": new_matches,
        "matches_total": matches_total,
        "message": message,
    }


# ── Matches table ─────────────────────────────────────────────────────────────
def _match_row(match: JobMatch, listing: JobListing) -> Dict:
    return {
        "id": match.id,
        "company": listing.company,
        "title": listing.title,
        "location": listing.location,
        "remote": listing.remote,
        "url": listing.url,
        "designation": match.designation,
        "match_score": match.match_score,
        "match_reasons": match.match_reasons or {},
        "status": match.status,
        "apply_url": match.apply_url,
        "pending_reason": match.pending_reason,
        "posted_at": listing.posted_at.isoformat() if listing.posted_at else None,
        "created_at": match.created_at.isoformat() if match.created_at else None,
    }


def list_matches(db: Session, user_id: int, status_filter: Optional[str] = None) -> List[Dict]:
    query = (
        db.query(JobMatch, JobListing)
        .join(JobListing, JobMatch.job_listing_id == JobListing.id)
        .filter(JobMatch.user_id == user_id)
    )
    if status_filter:
        query = query.filter(JobMatch.status == status_filter)
    rows = query.order_by(JobMatch.match_score.desc(), JobMatch.id.desc()).all()
    return [_match_row(match, listing) for match, listing in rows]


def update_match_status(
    db: Session,
    user_id: int,
    match_id: int,
    new_status: str,
    pending_reason: Optional[str] = None,
) -> Dict:
    if new_status not in MATCH_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status '{new_status}'. Allowed: {sorted(MATCH_STATUSES)}",
        )
    match = (
        db.query(JobMatch)
        .filter(JobMatch.id == match_id, JobMatch.user_id == user_id)
        .first()
    )
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    match.status = new_status
    if pending_reason is not None:
        match.pending_reason = pending_reason
    db.commit()
    db.refresh(match)
    listing = db.get(JobListing, match.job_listing_id)
    return _match_row(match, listing)
