"""
Question generation — turns retrieved resume context into real interview
questions using Google Gemini (free tier). Falls back to deterministic
templates when the LLM is disabled or unavailable, so the flow never breaks.
"""
import re
from typing import Dict, List

from app.services import llm_service

# Generation knobs
_MAX_QUESTIONS = 6
_MAX_CONTEXT_CHARS = 4000  # cap prompt size to stay fast and within free-tier limits

_SYSTEM_PROMPT = (
    "You are a senior technical interviewer. Using the candidate's resume context, "
    "generate focused, role-appropriate interview questions calibrated to the given "
    "difficulty. Mix behavioral, technical, and system-design questions grounded in "
    "the candidate's actual experience. Each question must be a single, clear, "
    "spoken-style prompt (no markdown, no numbering)."
)


def _normalize_sentence(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text or "").strip().strip('"')
    if not cleaned:
        return ""
    return cleaned if cleaned.endswith("?") else f"{cleaned}?"


def _fallback_questions(
    context_pack: List[Dict],
    role: str,
    difficulty: str,
    skills: List[str],
) -> List[Dict]:
    """Deterministic template set — mirrors the frontend fallback. No API calls."""
    items: List[Dict] = [
        {
            "question": _normalize_sentence(
                f"Introduce yourself and highlight your most relevant {role or 'developer'} "
                f"project for a {difficulty or 'medium'} interview"
            ),
            "section": "intro",
            "type": "behavioral",
            "expected_signals": ["clear self-summary", "relevant project", "role alignment"],
        }
    ]
    seen_sections = set()
    for chunk in context_pack:
        if len(items) >= _MAX_QUESTIONS:
            break
        section = (chunk.get("section") or "experience").strip()
        if section in seen_sections:
            continue
        seen_sections.add(section)
        snippet = re.sub(r"\s+", " ", chunk.get("text", "")).strip()[:130]
        items.append(
            {
                "question": _normalize_sentence(
                    f"From your {section}, explain this in detail: \"{snippet}\" and your exact contribution"
                ),
                "section": section,
                "type": "technical",
                "expected_signals": ["specific contribution", "technical detail", "outcome"],
            }
        )
    for skill in skills[:2]:
        if len(items) >= _MAX_QUESTIONS:
            break
        items.append(
            {
                "question": _normalize_sentence(
                    f"Design a practical {skill} solution and explain tradeoffs, edge cases, "
                    "and performance considerations"
                ),
                "section": "skills",
                "type": "system-design",
                "expected_signals": ["tradeoffs", "edge cases", "performance reasoning"],
            }
        )
    return items[:_MAX_QUESTIONS]


def _build_context_block(context_pack: List[Dict]) -> str:
    lines: List[str] = []
    used = 0
    for chunk in context_pack:
        section = chunk.get("section") or "experience"
        snippet = re.sub(r"\s+", " ", chunk.get("text", "")).strip()
        if not snippet:
            continue
        line = f"[{section}] {snippet}"
        if used + len(line) > _MAX_CONTEXT_CHARS:
            break
        lines.append(line)
        used += len(line)
    return "\n".join(lines) if lines else "(no resume context available)"


def generate_questions(
    context_pack: List[Dict],
    role: str,
    experience: str,
    difficulty: str,
    skills: List[str],
) -> Dict:
    """
    Returns {"questions": [...], "source": "llm"|"fallback"}.
    Each question: {question, section, type, expected_signals}.
    """
    if not llm_service.llm_enabled():
        return {"questions": _fallback_questions(context_pack, role, difficulty, skills), "source": "fallback"}

    user_prompt = (
        f"Role: {role}\n"
        f"Experience level: {experience}\n"
        f"Difficulty: {difficulty}\n"
        f"Target skills: {', '.join(skills) if skills else 'general'}\n\n"
        f"Resume context (PII-stripped chunks):\n{_build_context_block(context_pack)}\n\n"
        f"Generate exactly {_MAX_QUESTIONS} interview questions. "
        "Return ONLY a JSON array, no prose, where each item is:\n"
        '{"question": "<text>", "section": "<resume section or topic>", '
        '"type": "behavioral|technical|system-design", '
        '"expected_signals": ["<what a strong answer demonstrates>", ...]}'
    )

    try:
        model = llm_service.chat_model(temperature=0.6)
        response = model.invoke(
            [("system", _SYSTEM_PROMPT), ("human", user_prompt)]
        )
        raw = getattr(response, "content", "") or ""
        parsed = llm_service.extract_array(raw)

        questions: List[Dict] = []
        for item in parsed:
            if not isinstance(item, dict):
                continue
            q_text = _normalize_sentence(str(item.get("question", "")))
            if not q_text:
                continue
            signals = item.get("expected_signals") or []
            questions.append(
                {
                    "question": q_text,
                    "section": str(item.get("section") or "experience"),
                    "type": str(item.get("type") or "technical"),
                    "expected_signals": [str(s) for s in signals if s][:5],
                }
            )
            if len(questions) >= _MAX_QUESTIONS:
                break

        if not questions:
            raise ValueError("LLM returned no usable questions")
        return {"questions": questions, "source": "llm"}
    except Exception as err:  # noqa: BLE001 — any failure must degrade gracefully
        print(f"[question_service] LLM generation failed, using fallback. error={err}")
        return {"questions": _fallback_questions(context_pack, role, difficulty, skills), "source": "fallback"}
