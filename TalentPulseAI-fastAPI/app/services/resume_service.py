"""
Resume management for the account page: view the extracted content and delete.

Scoping contract: every function takes the authenticated user's id and filters by
it, so a client can never reach another user's document by guessing an id.

Note on "view": the original PDF is NOT stored anywhere (no file storage is
configured). What we hold is the extracted text plus the PII-stripped sections
that were embedded, so that is what a viewer can honestly show.
"""
from typing import Dict, List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.job_search import JobSearchProfile
from app.models.resume import EmbeddingCache, ResumeChunk, ResumeDocument


def _owned_resume(db: Session, user_id: int, resume_document_id: int) -> ResumeDocument:
    doc = (
        db.query(ResumeDocument)
        .filter(
            ResumeDocument.id == resume_document_id,
            ResumeDocument.user_id == user_id,
        )
        .first()
    )
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found for this user",
        )
    return doc


def get_resume_detail(db: Session, user_id: int, resume_document_id: int) -> Dict:
    """Metadata plus the extracted sections — never the original file (not stored)."""
    doc = _owned_resume(db, user_id, resume_document_id)
    chunk_count = (
        db.query(ResumeChunk).filter(ResumeChunk.resume_document_id == doc.id).count()
    )
    sections = doc.parsed_sections or {}
    return {
        "id": doc.id,
        "file_name": doc.file_name or "Resume",
        "mime_type": doc.mime_type,
        "role": doc.role,
        "experience": doc.experience,
        "difficulty": doc.difficulty,
        "skills": list(doc.skills or []),
        "source": doc.source,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "chunk_count": chunk_count,
        # Ordered so the viewer renders sections predictably.
        "sections": [
            {"name": name, "text": text}
            for name, text in sections.items()
            if isinstance(text, str) and text.strip()
        ],
        # The original upload is not retained; say so rather than implying a download.
        "original_file_available": False,
    }


def _delete_vectors_for_document(doc_id: int, user_id: int) -> Tuple[bool, int]:
    """
    Remove this document's rows from the pgvector store. Returns (ok, rows_removed).

    Done with SQL rather than `PGVector.delete()` because that method only accepts
    `ids` (extra kwargs are swallowed), so a filter-based call would report success
    while deleting nothing. Metadata lives in `langchain_pg_embedding.cmetadata`,
    which is what index_resume writes resume_document_id/user_id into.

    Never raises: the SQL rows are the source of truth for the UI, and both
    retrieval paths already degrade (SQL chunks / keyword scoring) without vectors.
    """
    url = settings.VECTOR_DB_URL or settings.VECTOR_DATABASE_URL
    if not url:
        return False, 0
    try:
        engine = create_engine(url, pool_pre_ping=True)
        statement = text(
            """
            DELETE FROM langchain_pg_embedding
             WHERE cmetadata->>'resume_document_id' = :doc_id
               AND cmetadata->>'user_id' = :user_id
               AND collection_id IN (
                     SELECT uuid FROM langchain_pg_collection WHERE name = :collection
                   )
            """
        )
        with engine.begin() as conn:
            result = conn.execute(
                statement,
                {
                    "doc_id": str(doc_id),
                    "user_id": str(user_id),
                    "collection": settings.RAG_COLLECTION,
                },
            )
            removed = result.rowcount or 0
        engine.dispose()
        return True, removed
    except Exception as err:  # noqa: BLE001 — deletion must not 500 the request
        print(f"[resume_service] vector cleanup failed for doc {doc_id}: {err}")
        return False, 0


def delete_resume(db: Session, user_id: int, resume_document_id: int) -> Dict:
    """
    Delete a resume and everything keyed to it.

    Ordering matters because of two FKs into resume_documents:
      1. job_search_profiles.resume_document_id — detached (set NULL) so the job
         agent doesn't point at a deleted row.
      2. embedding_cache.source_resume_document_id — NOT NULL, so any cache row
         naming this document must go before the document can be removed.

    When this document is the canonical vector source for a deduped set, the cache
    row and the vectors are removed together. Sibling copies keep their SQL chunks
    and fall back to SQL retrieval / keyword scoring; leaving a cache row pointing
    at vectors that no longer exist would be worse, and re-pointing it is not
    possible because the vectors carry this document's id in their metadata.
    """
    doc = _owned_resume(db, user_id, resume_document_id)
    file_name = doc.file_name or "Resume"

    detached_job_setup = (
        db.query(JobSearchProfile)
        .filter(
            JobSearchProfile.user_id == user_id,
            JobSearchProfile.resume_document_id == doc.id,
        )
        .update({JobSearchProfile.resume_document_id: None}, synchronize_session=False)
    )

    cache_rows = (
        db.query(EmbeddingCache)
        .filter(
            EmbeddingCache.user_id == user_id,
            EmbeddingCache.source_resume_document_id == doc.id,
        )
        .all()
    )
    was_vector_source = bool(cache_rows)
    for row in cache_rows:
        db.delete(row)

    # Always attempt cleanup: a document can also hold vectors without a cache row
    # (when caching was skipped), and for a dedup copy the filter simply matches
    # nothing because its vectors live under the source document's id.
    vector_cleanup_ok, vectors_removed = _delete_vectors_for_document(doc.id, user_id)

    # Chunks go with it via the ResumeDocument.chunks cascade.
    db.delete(doc)
    db.commit()

    return {
        "deleted_id": resume_document_id,
        "file_name": file_name,
        "was_vector_source": was_vector_source,
        "vector_cleanup_ok": vector_cleanup_ok,
        "vectors_removed": vectors_removed,
        "job_setup_detached": bool(detached_job_setup),
        "message": f"Deleted {file_name}",
    }


def list_resume_ids(db: Session, user_id: int) -> List[int]:
    """Ids only — used by tests/callers that just need to confirm what remains."""
    return [
        row_id
        for (row_id,) in db.query(ResumeDocument.id)
        .filter(ResumeDocument.user_id == user_id)
        .order_by(ResumeDocument.id.desc())
        .all()
    ]


def resume_count(db: Session, user_id: int, resume_document_id: Optional[int] = None) -> int:
    query = db.query(ResumeDocument).filter(ResumeDocument.user_id == user_id)
    if resume_document_id is not None:
        query = query.filter(ResumeDocument.id == resume_document_id)
    return query.count()
