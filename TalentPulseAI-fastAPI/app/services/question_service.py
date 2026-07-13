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
    "You are a senior technical interviewer conducting a real interview. "
    "You have been given actual chunks from the candidate's resume. "
    "Generate questions that are DIRECTLY tied to what this specific candidate has done — "
    "mention their actual project names, company names, technologies, and decisions. "
    "NEVER generate generic questions like 'tell me about yourself' or 'what are your strengths'. "
    "Every question must reference something concrete from their resume. "
    "Each question must be a single clear spoken sentence ending with '?'. No markdown, no numbering."
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
    research: Dict = None,
) -> List[Dict]:
    """Content-aware fallback — builds questions from actual resume chunks. No API calls."""
    items: List[Dict] = []
    seen_sections: dict = {}

    # Group chunks by section so we use the fullest text per section
    for chunk in context_pack:
        section = (chunk.get("section") or "experience").strip()
        text = re.sub(r"\s+", " ", chunk.get("text", "")).strip()
        if section not in seen_sections or len(text) > len(seen_sections[section]):
            seen_sections[section] = text

    # Generate one targeted question per section using its full text
    section_order = ["experience", "work_experience", "projects", "skills", "achievements", "certifications", "education", "summary"]
    ordered = sorted(seen_sections.keys(), key=lambda s: section_order.index(s) if s in section_order else 99)

    question_templates = {
        "experience": "You worked on {snippet} — walk me through your specific technical decisions and what you would do differently today",
        "work_experience": "Your resume mentions {snippet} — describe the biggest technical challenge you faced and how you solved it",
        "projects": "You built {snippet} — explain the architecture, the trade-offs you made, and how you handled scale or edge cases",
        "skills": "You list {snippet} as a skill — describe a real scenario where you applied this and what the outcome was",
        "achievements": "You achieved {snippet} — explain the approach, the obstacles, and what made this possible",
        "certifications": "You have {snippet} — give a concrete example from a project where this knowledge was critical",
        "education": "During your time at {snippet} — what was the most technically challenging thing you built or learned",
        "summary": "Your background shows {snippet} — for a {role} role at {difficulty} level, which part of this is most relevant and why",
    }

    for section in ordered:
        if len(items) >= _MAX_QUESTIONS - 1:
            break
        text = seen_sections[section]
        # Use up to 200 chars for a more meaningful snippet
        snippet = text[:200].rsplit(" ", 1)[0] if len(text) > 200 else text
        template = question_templates.get(section, "From your {section} section, explain: {snippet} — what was your specific contribution and the measurable outcome")
        q = template.format(snippet=snippet, section=section, role=role or "developer", difficulty=difficulty or "medium")
        items.append({
            "question": _normalize_sentence(q),
            "section": section,
            "type": "technical" if section in ("projects", "experience", "work_experience") else "behavioral",
            "expected_signals": ["specific example", "technical depth", "measurable outcome"],
        })

    # Blend in up to 2 questions interviewers commonly ask this profile (web research)
    for common_q in (research or {}).get("common_questions", [])[:2]:
        if len(items) >= _MAX_QUESTIONS:
            break
        items.append({
            "question": _normalize_sentence(common_q),
            "section": "industry",
            "type": "behavioral",
            "expected_signals": ["structured answer", "role-relevant depth", "concrete example"],
        })

    # Fill remaining slots with skill-specific questions
    for skill in skills:
        if len(items) >= _MAX_QUESTIONS:
            break
        items.append({
            "question": _normalize_sentence(
                f"For a {role or 'developer'} position, describe a real {skill} problem you solved — "
                f"what was the context, what did you try, and what was the final result"
            ),
            "section": "skills",
            "type": "system-design",
            "expected_signals": ["real problem", "solution approach", "result"],
        })

    # Ultimate fallback if no context at all
    if not items:
        items.append({
            "question": _normalize_sentence(
                f"Walk me through your most impactful {role or 'developer'} project — "
                f"what problem it solved, your role, and the outcome"
            ),
            "section": "intro",
            "type": "behavioral",
            "expected_signals": ["clear narrative", "ownership", "impact"],
        })

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


def _build_research_block(research: Dict) -> str:
    if not research:
        return ""
    lines: List[str] = ["=== WHAT INTERVIEWERS COMMONLY ASK THIS PROFILE (web research) ==="]
    topics = research.get("topics") or []
    if topics:
        lines.append(f"Frequently probed topics: {', '.join(topics)}")
    for q in (research.get("common_questions") or [])[:8]:
        lines.append(f"- {q}")
    lines.append("=== END RESEARCH ===")
    return "\n".join(lines)


def generate_questions(
    context_pack: List[Dict],
    role: str,
    experience: str,
    difficulty: str,
    skills: List[str],
    research: Dict = None,
) -> Dict:
    """
    Returns {"questions": [...], "source": "llm"|"fallback"}.
    Each question: {question, section, type, expected_signals}.
    `research` (optional) is the commonly-asked-questions digest from
    question_research_service — blended in so ~2 of the questions match what
    interviewers actually ask this role/experience, personalized to the resume.
    """
    if not llm_service.llm_enabled():
        return {"questions": _fallback_questions(context_pack, role, difficulty, skills, research), "source": "fallback"}

    context_block = _build_context_block(context_pack)
    research_block = _build_research_block(research)
    mix_instruction = (
        f"Generate exactly {_MAX_QUESTIONS} interview questions: {_MAX_QUESTIONS - 2} must be "
        "grounded in the candidate's actual resume content above, and 2 must be adapted from "
        "the commonly-asked questions in the research block — personalize those 2 with the "
        "candidate's real projects, tools, or companies rather than copying them verbatim. "
        if research_block
        else f"Using the resume above, generate exactly {_MAX_QUESTIONS} interview questions. "
    )
    user_prompt = (
        f"Candidate is interviewing for: {role}\n"
        f"Experience level: {experience}\n"
        f"Difficulty: {difficulty}\n"
        f"Skills to probe: {', '.join(skills) if skills else 'general'}\n\n"
        f"=== CANDIDATE'S ACTUAL RESUME CONTENT ===\n{context_block}\n"
        f"=== END RESUME ===\n\n"
        + (f"{research_block}\n\n" if research_block else "")
        + mix_instruction
        + "Reference specific projects, companies, tools, and decisions from the resume. "
        "Return ONLY a valid JSON array — no explanation, no markdown — where each item is:\n"
        '{"question": "<specific question referencing their actual experience>", '
        '"section": "<resume section this covers>", '
        '"type": "behavioral|technical|system-design", '
        '"expected_signals": ["<signal 1>", "<signal 2>", "<signal 3>"]}'
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
        import traceback
        print(f"[question_service] LLM generation failed, using fallback.\nerror={err}\n{traceback.format_exc()}")
        return {"questions": _fallback_questions(context_pack, role, difficulty, skills, research), "source": "fallback"}
