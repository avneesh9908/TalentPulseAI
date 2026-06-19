from functools import lru_cache
from typing import Any, Dict, List, Tuple

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.resume import EmbeddingCache, ResumeChunk, ResumeDocument
from app.schemas.resume_rag_schema import ContextRetrieveRequest, ResumeIndexRequest
from app.services import embedding_service, resume_parser


class ResumeRAGService:
    def __init__(self) -> None:
        self.collection_name = settings.RAG_COLLECTION
        self.vector_db_url = settings.VECTOR_DB_URL or settings.VECTOR_DATABASE_URL
        # Validate provider config early so errors surface at startup, not mid-request.
        self._embeddings = embedding_service.get_embeddings_for_settings(settings)

    def _get_vector_store(self, embeddings: Any) -> Any:
        return embedding_service.get_vector_store(
            embeddings=embeddings,
            collection_name=self.collection_name,
            vector_db_url=self.vector_db_url,
        )

    def index_resume(
        self,
        db: Session,
        user_id: int,
        payload: ResumeIndexRequest,
    ) -> Tuple[ResumeDocument, int, bool]:
        raw_text = resume_parser.normalize_resume_text(payload)
        sections = resume_parser.parse_sections(raw_text)
        parsed_summary = resume_parser.extract_summary(raw_text, payload.skills)
        content_hash = resume_parser.compute_content_hash(sections)

        resume_doc = ResumeDocument(
            user_id=user_id,
            interview_id=payload.interview_id,
            setup_id=payload.setup_id,
            role=payload.role,
            experience=payload.experience,
            difficulty=payload.difficulty,
            skills=payload.skills,
            profile_option=payload.profile_option,
            source=payload.resume.source,
            file_name=payload.resume.file_name,
            mime_type=payload.resume.mime_type,
            raw_text=raw_text,
            content_hash=content_hash,
            parsed_sections=sections,
            parsed_summary=parsed_summary,
        )
        db.add(resume_doc)
        db.flush()

        # ── Dedup short-circuit ────────────────────────────────────────────────
        # If this user has already embedded the exact same resume content, copy
        # the chunk rows from the cached document and skip all embedding calls.
        cache_entry = (
            db.query(EmbeddingCache)
            .filter(
                EmbeddingCache.user_id == user_id,
                EmbeddingCache.content_hash == content_hash,
            )
            .first()
        )
        if cache_entry:
            source_chunks = (
                db.query(ResumeChunk)
                .filter(ResumeChunk.resume_document_id == cache_entry.source_resume_document_id)
                .order_by(ResumeChunk.chunk_index.asc())
                .all()
            )
            copied_rows = [
                ResumeChunk(
                    resume_document_id=resume_doc.id,
                    chunk_index=row.chunk_index,
                    section=row.section,
                    chunk_text=row.chunk_text,
                    metadata_json={
                        **row.metadata_json,
                        "resume_document_id": resume_doc.id,
                        "interview_id": payload.interview_id,
                        "setup_id": payload.setup_id,
                    },
                )
                for row in source_chunks
            ]
            db.add_all(copied_rows)
            db.commit()
            db.refresh(resume_doc)
            return resume_doc, len(copied_rows), True  # vectors already exist in store

        # ── Build chunks ───────────────────────────────────────────────────────
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=payload.chunking.chunk_size,
            chunk_overlap=payload.chunking.chunk_overlap,
            separators=["\n\n", "\n", ". ", " "],
        )

        docs: List[Document] = []
        rows: List[ResumeChunk] = []
        chunk_index = 0

        for section_name, section_text in sections.items():
            split_texts = splitter.split_text(section_text)
            for piece in split_texts:
                piece = resume_parser.strip_pii(piece)
                if not piece:
                    continue
                metadata = {
                    "resume_document_id": resume_doc.id,
                    "user_id": user_id,
                    "interview_id": payload.interview_id,
                    "setup_id": payload.setup_id,
                    "role": payload.role,
                    "experience": payload.experience,
                    "difficulty": payload.difficulty,
                    "skills": payload.skills,
                    "profile_option": payload.profile_option,
                    "section": section_name,
                    "chunk_index": chunk_index,
                }
                docs.append(Document(page_content=piece, metadata=metadata))
                rows.append(
                    ResumeChunk(
                        resume_document_id=resume_doc.id,
                        chunk_index=chunk_index,
                        section=section_name,
                        chunk_text=piece,
                        metadata_json=metadata,
                    )
                )
                chunk_index += 1

        db.add_all(rows)

        # ── Embed and store vectors ────────────────────────────────────────────
        vector_indexed = True
        try:
            embeddings = self._embeddings
            vector_store = self._get_vector_store(embeddings)
            vector_store.add_documents(docs)
        except Exception as err:
            try:
                local_embeddings = embedding_service.get_local_embeddings()
                local_store = self._get_vector_store(local_embeddings)
                local_store.add_documents(docs)
            except Exception as fallback_err:
                vector_indexed = False
                print(
                    "[ResumeRAGService] Vector indexing unavailable; continuing without vectors. "
                    f"primary_error={err} "
                    f"fallback_error={fallback_err}"
                )

        # ── Record in cache (only when vectors were successfully written) ──────
        if vector_indexed:
            db.add(
                EmbeddingCache(
                    user_id=user_id,
                    content_hash=content_hash,
                    source_resume_document_id=resume_doc.id,
                    chunk_count=len(docs),
                )
            )

        db.commit()
        db.refresh(resume_doc)

        return resume_doc, len(docs), vector_indexed

    def _fallback_context_from_chunks(
        self,
        db: Session,
        user_id: int,
        payload: ContextRetrieveRequest,
    ) -> List[Dict]:
        resume_doc = (
            db.query(ResumeDocument)
            .filter(
                ResumeDocument.user_id == user_id,
                ResumeDocument.interview_id == payload.interview_id,
                ResumeDocument.setup_id == payload.setup_id,
            )
            .order_by(ResumeDocument.id.desc())
            .first()
        )

        if not resume_doc:
            return []

        chunk_rows = (
            db.query(ResumeChunk)
            .filter(ResumeChunk.resume_document_id == resume_doc.id)
            .order_by(ResumeChunk.chunk_index.asc())
            .limit(payload.top_k)
            .all()
        )

        return [
            {
                "chunk_id": row.id,
                "section": row.section,
                "score": 0.0,
                "text": row.chunk_text,
                "metadata": row.metadata_json or {},
            }
            for row in chunk_rows
        ]

    def retrieve_context(
        self,
        db: Session,
        user_id: int,
        payload: ContextRetrieveRequest,
    ) -> List[Dict]:
        enriched_query = (
            f"Role={payload.role}; Experience={payload.experience}; Difficulty={payload.difficulty}; "
            f"Skills={', '.join(payload.skills)}; ProfileOption={payload.profile_option}; "
            f"Question={payload.query}"
        )

        shared_filter = {
            "user_id": user_id,
            "interview_id": payload.interview_id,
            "setup_id": payload.setup_id,
        }

        try:
            vector_store = self._get_vector_store(self._embeddings)
            matches = vector_store.similarity_search_with_score(enriched_query, k=payload.top_k, filter=shared_filter)
        except Exception as remote_err:
            try:
                local_embeddings = embedding_service.get_local_embeddings()
                local_store = self._get_vector_store(local_embeddings)
                matches = local_store.similarity_search_with_score(enriched_query, k=payload.top_k, filter=shared_filter)
            except Exception as local_err:
                print(
                    "[ResumeRAGService] Context retrieval fallback to SQL chunks. "
                    f"remote_error={remote_err}; local_error={local_err}"
                )
                return self._fallback_context_from_chunks(db=db, user_id=user_id, payload=payload)

        context_pack: List[Dict] = []
        for doc, score in matches:
            if payload.min_score is not None and score > payload.min_score:
                continue

            chunk_row = (
                db.query(ResumeChunk)
                .filter(
                    ResumeChunk.resume_document_id == doc.metadata.get("resume_document_id"),
                    ResumeChunk.chunk_index == doc.metadata.get("chunk_index"),
                )
                .first()
            )

            context_pack.append(
                {
                    "chunk_id": chunk_row.id if chunk_row else -1,
                    "section": doc.metadata.get("section"),
                    "score": float(score),
                    "text": doc.page_content,
                    "metadata": doc.metadata,
                }
            )

        return context_pack


@lru_cache(maxsize=1)
def get_rag_service() -> ResumeRAGService:
    """Singleton RAG service — validates config once per process instead of per request."""
    return ResumeRAGService()
