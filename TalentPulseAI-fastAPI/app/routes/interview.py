"""
Interview routes — thin HTTP glue delegating to the service layer.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.deps import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.interview_schema import InterviewSetupRequest, InterviewSetupResponse
from app.schemas.resume_rag_schema import (
    ContextRetrieveRequest,
    ContextRetrieveResponse,
    QuestionGenerateRequest,
    QuestionGenerateResponse,
    ResumeIndexRequest,
    ResumeIndexResponse,
)
from app.services import interview_service, question_service
from app.services.resume_rag_service import ResumeRAGService, get_rag_service

router = APIRouter()


@router.post("/setup", response_model=InterviewSetupResponse)
def setup_interview(
    payload: InterviewSetupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        record = interview_service.create_interview(db, current_user.id, payload)
        return {
            "interview_id": record.interview_id,
            "setup_id": record.setup_id,
            "user_id": current_user.id,
            "role": record.role,
            "experience": record.experience,
            "difficulty": record.difficulty,
            "skills": record.skills,
            "profile_option": record.profile_option,
            "status": record.status,
            "started_at": record.started_at,
            "message": "Interview session initialized successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to setup interview: {e}")


@router.post("/resume/index", response_model=ResumeIndexResponse)
def index_resume_for_rag(
    payload: ResumeIndexRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: ResumeRAGService = Depends(get_rag_service),
):
    try:
        resume_doc, chunk_count, vector_indexed = service.index_resume(
            db=db, user_id=current_user.id, payload=payload
        )
        return {
            "interview_id": payload.interview_id,
            "resume_id": resume_doc.id,
            "chunks_indexed": chunk_count,
            "vector_collection": service.collection_name,
            "status": "indexed" if vector_indexed else "indexed_without_vectors",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Resume indexing failed: {e}")


@router.post("/context/retrieve", response_model=ContextRetrieveResponse)
def retrieve_context_for_question_generation(
    payload: ContextRetrieveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: ResumeRAGService = Depends(get_rag_service),
):
    try:
        context_pack = service.retrieve_context(db=db, user_id=current_user.id, payload=payload)
        return {
            "interview_id": payload.interview_id,
            "retrieved_count": len(context_pack),
            "context_pack": context_pack,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Context retrieval failed: {e}")


@router.post("/questions/generate", response_model=QuestionGenerateResponse)
def generate_interview_questions(
    payload: QuestionGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    service: ResumeRAGService = Depends(get_rag_service),
):
    try:
        retrieve_payload = ContextRetrieveRequest(
            interview_id=payload.interview_id,
            setup_id=payload.setup_id,
            role=payload.role,
            experience=payload.experience,
            difficulty=payload.difficulty,
            skills=payload.skills,
            profile_option=payload.profile_option,
            query=(
                "Resume context for generating interview questions covering projects, "
                "skills, architecture, debugging, and communication."
            ),
            top_k=payload.top_k,
        )
        context_pack = service.retrieve_context(db=db, user_id=current_user.id, payload=retrieve_payload)
        result = question_service.generate_questions(
            context_pack=context_pack,
            role=payload.role,
            experience=payload.experience,
            difficulty=payload.difficulty,
            skills=payload.skills,
        )
        return {
            "interview_id": payload.interview_id,
            "source": result["source"],
            "questions": result["questions"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Question generation failed: {e}")


@router.get("/{interview_id}")
def get_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = interview_service.get_interview(db, current_user.id, interview_id)
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return {
        "interview_id": interview.interview_id,
        "user_id": current_user.id,
        "setup_id": interview.setup_id,
        "role": interview.role,
        "experience": interview.experience,
        "difficulty": interview.difficulty,
        "skills": interview.skills,
        "profile_option": interview.profile_option,
        "status": interview.status,
        "started_at": interview.started_at,
        "message": "Interview details retrieved",
    }


@router.put("/{interview_id}/progress")
def save_progress(
    interview_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {
        "interview_id": interview_id,
        "step": payload.get("step"),
        "status": "progress_saved",
        "message": "Interview progress saved successfully",
    }


@router.post("/{interview_id}/submit")
def submit_interview(
    interview_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    answers = payload.get("answers", {})
    completed_at_client = payload.get("completed_at")
    questions = payload.get("questions") or []

    result = interview_service.submit_interview(
        db, current_user.id, interview_id, answers, questions
    )
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    feedback, completed_at_stored = result
    return {
        "interview_id": interview_id,
        "status": "submitted",
        "score": feedback["score"],
        "completed_at": completed_at_client or completed_at_stored,
        "message": "Interview submitted successfully",
        "feedback": feedback,
    }


@router.get("/{interview_id}/results")
def get_interview_results(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    interview = interview_service.get_interview(db, current_user.id, interview_id)
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    if interview.status != "submitted" or not interview.feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Results not available — interview has not been submitted yet",
        )
    return {
        "interview_id": interview_id,
        "status": interview.status,
        "score": interview.feedback.get("score", 0),
        "completed_at": interview.completed_at.isoformat() if interview.completed_at else None,
        "message": "Interview results retrieved",
        "feedback": interview.feedback,
    }
