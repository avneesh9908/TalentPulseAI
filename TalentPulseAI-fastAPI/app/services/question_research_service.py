"""
Web research on the interview questions most commonly asked for the candidate's
profile (role + experience + skills). Primary path uses Gemini with Google Search
grounding (free tier) so results reflect what interviewers actually ask today;
falls back to the model's own knowledge, then to no research — question
generation works unchanged either way.

Results are cached per profile for the process lifetime: the wizard offers a
fixed set of roles/levels, so repeat interviews cost zero extra API calls.
"""
import threading
from typing import Dict, List, Optional, Tuple

from app.core.config import settings
from app.services import llm_service

_MAX_TOPICS = 8
_MAX_QUESTIONS = 10

_cache: Dict[Tuple, Dict] = {}
_cache_lock = threading.Lock()


def research_enabled() -> bool:
    return bool(settings.ENABLE_QUESTION_RESEARCH and settings.GOOGLE_API_KEY)


def _profile_key(role: str, experience: str, skills: List[str]) -> Tuple:
    return (
        (role or "").strip().lower(),
        (experience or "").strip().lower(),
        tuple(sorted((s or "").strip().lower() for s in (skills or []))[:5]),
    )


def _build_prompt(role: str, experience: str, skills: List[str]) -> str:
    skills_str = ", ".join(skills) if skills else "general"
    return (
        f"Research the interview questions MOST COMMONLY asked of a \"{role}\" candidate "
        f"with {experience} experience (key skills: {skills_str}). Consider interview-prep "
        f"sites, candidate interview reviews, and recent hiring guides for this exact "
        f"designation and seniority.\n\n"
        "Return ONLY a JSON object, no markdown, shaped as:\n"
        "{\n"
        f'  "topics": ["<topic interviewers repeatedly probe for this profile>", ... up to {_MAX_TOPICS}],\n'
        f'  "common_questions": ["<frequently asked question, worded as an interviewer would speak it>", ... up to {_MAX_QUESTIONS}]\n'
        "}"
    )


def _parse_research(raw: str) -> Optional[Dict]:
    data = llm_service.parse_json(raw)
    if not isinstance(data, dict):
        return None
    topics = [str(t).strip() for t in (data.get("topics") or []) if str(t).strip()]
    questions = [str(q).strip() for q in (data.get("common_questions") or []) if str(q).strip()]
    if not topics and not questions:
        return None
    return {"topics": topics[:_MAX_TOPICS], "common_questions": questions[:_MAX_QUESTIONS]}


def research_common_questions(role: str, experience: str, skills: List[str]) -> Optional[Dict]:
    """
    Returns {"topics": [...], "common_questions": [...], "source": "web"|"llm_knowledge"}
    or None. Never raises — any failure degrades to None so the interview flow
    continues on resume context alone.
    """
    if not research_enabled():
        return None

    key = _profile_key(role, experience, skills)
    with _cache_lock:
        cached = _cache.get(key)
    if cached:
        return cached

    prompt = _build_prompt(role, experience, skills)
    result: Optional[Dict] = None

    try:
        raw = llm_service.generate_content_rest(
            parts=[{"text": prompt}],
            tools=[{"google_search": {}}],
            temperature=0.2,
        )
        parsed = _parse_research(raw)
        if parsed:
            result = {**parsed, "source": "web"}
    except Exception as err:  # noqa: BLE001 — grounded search is best-effort
        print(f"[question_research] Google Search grounding failed: {err}")

    if result is None:
        try:
            model = llm_service.chat_model(temperature=0.2)
            response = model.invoke([("human", prompt)])
            parsed = _parse_research(getattr(response, "content", "") or "")
            if parsed:
                result = {**parsed, "source": "llm_knowledge"}
        except Exception as err:  # noqa: BLE001
            print(f"[question_research] Knowledge fallback failed: {err}")

    if result:
        with _cache_lock:
            _cache[key] = result
    return result
