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

# Real interviews warm up before they dig. Questions are produced and ordered in
# these tiers so the candidate starts on fundamentals and ends on the hard stuff.
_TIER_BASIC = "basic"
_TIER_INTERMEDIATE = "intermediate"
_TIER_ADVANCED = "advanced"
_TIER_ORDER = {_TIER_BASIC: 0, _TIER_INTERMEDIATE: 1, _TIER_ADVANCED: 2}
# Of _MAX_QUESTIONS: how many open the interview as easy fundamentals.
_BASIC_COUNT = 2
_INTERMEDIATE_COUNT = 2

_SYSTEM_PROMPT = (
    "You are a senior technical interviewer conducting a real interview. "
    "You have been given actual chunks from the candidate's resume. "
    "A real interview RAMPS UP: it opens with easy fundamentals to settle the candidate, "
    "then moves to applied questions about their own work, and only then gets tricky. "
    "Follow that order strictly — never open with the hardest question. "
    "Never ask filler like 'tell me about yourself' or 'what are your strengths'. "
    "Each question must be a single clear spoken sentence ending with '?'. No markdown, no numbering."
)

# Easy opening questions, chosen by what the candidate actually lists as skills.
# Definitional 'what is / why is' warm-ups — the tier the user asked to lead with.
_BASIC_CONCEPT_BANK: List[tuple] = [
    ("typescript", [
        "What is TypeScript and how is it different from JavaScript",
        "What is an interface in TypeScript and when would you use one instead of a type",
    ]),
    ("javascript", [
        "What is the difference between let, const and var in JavaScript",
        "What is a promise in JavaScript and why is it useful",
    ]),
    ("react", [
        "What is a React component and what is the difference between props and state",
        "Why is the key prop needed when you render a list in React",
    ]),
    ("python", [
        "What is a list comprehension in Python and why would you use one",
        "What is the difference between a list and a tuple in Python",
    ]),
    ("java", [
        "What are the four pillars of object oriented programming",
        "What is the difference between an abstract class and an interface in Java",
    ]),
    ("c++", [
        "What is a pointer in C++ and why do we need one",
        "What is the difference between a reference and a pointer in C++",
    ]),
    ("node", [
        "What is the event loop in Node.js and why does it matter",
        "What is middleware in Express and when would you use it",
    ]),
    ("sql", [
        "What is a primary key and why does a table need one",
        "What is the difference between an INNER JOIN and a LEFT JOIN",
    ]),
    ("mongo", [
        "What is a document database and how does it differ from a relational one",
        "What is an index in MongoDB and why does it speed up a query",
    ]),
    ("oop", [
        "What are the four pillars of object oriented programming",
        "What is encapsulation and why is it useful",
    ]),
    ("data", [
        "What is the difference between supervised and unsupervised learning",
        "What is overfitting and why is it a problem",
    ]),
]

# Used when a candidate's skills don't match the bank — still easy, still concrete.
_GENERIC_BASICS = [
    "What is a variable and how does its scope affect where you can use it",
    "What is the difference between a for loop and a while loop, and when would you pick each",
    "What is a function and why do we break code into functions",
    "What is the difference between an array and an object as a data structure",
]

_BASIC_SIGNALS = ["clear definition", "correct terminology", "simple example"]


def _normalize_sentence(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text or "").strip().strip('"')
    if not cleaned:
        return ""
    return cleaned if cleaned.endswith("?") else f"{cleaned}?"


def _basic_questions(skills: List[str], role: str, limit: int = _BASIC_COUNT) -> List[Dict]:
    """
    Easy openers ('what is…', 'why is…') matched to the candidate's own stack,
    so the interview starts on fundamentals before it gets hard.
    """
    haystack = " ".join([*(skills or []), role or ""]).lower()
    picked: List[str] = []

    for keyword, questions in _BASIC_CONCEPT_BANK:
        if keyword in haystack:
            for q in questions:
                if q not in picked:
                    picked.append(q)
                if len(picked) >= limit:
                    break
        if len(picked) >= limit:
            break

    for q in _GENERIC_BASICS:  # top up when the stack isn't in the bank
        if len(picked) >= limit:
            break
        if q not in picked:
            picked.append(q)

    return [
        {
            "question": _normalize_sentence(q),
            "section": "fundamentals",
            "type": "technical",
            "difficulty_tier": _TIER_BASIC,
            "expected_signals": list(_BASIC_SIGNALS),
        }
        for q in picked[:limit]
    ]


def _fallback_questions(
    context_pack: List[Dict],
    role: str,
    difficulty: str,
    skills: List[str],
    research: Dict = None,
) -> List[Dict]:
    """Content-aware fallback — builds questions from actual resume chunks. No API calls."""
    # Tier 1: warm-up fundamentals, always first.
    items: List[Dict] = _basic_questions(skills, role)
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
            "difficulty_tier": _TIER_INTERMEDIATE,
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
            "difficulty_tier": _TIER_INTERMEDIATE,
            "expected_signals": ["structured answer", "role-relevant depth", "concrete example"],
        })

    # Tier 3: the tricky ones — trade-offs and failure modes, asked last.
    for skill in skills:
        if len(items) >= _MAX_QUESTIONS:
            break
        items.append({
            "question": _normalize_sentence(
                f"Tell me about the hardest {skill} bug or bottleneck you have hit — how did you "
                f"diagnose it, what trade-off did you accept, and what would you do differently now"
            ),
            "section": "skills",
            "type": "system-design",
            "difficulty_tier": _TIER_ADVANCED,
            "expected_signals": ["root-cause reasoning", "trade-off awareness", "hindsight"],
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
            "difficulty_tier": _TIER_INTERMEDIATE,
            "expected_signals": ["clear narrative", "ownership", "impact"],
        })

    return _order_by_tier(items)[:_MAX_QUESTIONS]


def _order_by_tier(items: List[Dict]) -> List[Dict]:
    """Easy first, tricky last — stable so same-tier questions keep their order."""
    return sorted(items, key=lambda q: _TIER_ORDER.get(q.get("difficulty_tier"), 1))


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
    advanced_count = _MAX_QUESTIONS - _BASIC_COUNT - _INTERMEDIATE_COUNT

    ladder_instruction = (
        f"Generate exactly {_MAX_QUESTIONS} questions IN THIS ORDER, an easy-to-hard ramp:\n"
        f"1) The first {_BASIC_COUNT} are tier \"basic\": short definitional warm-ups about the "
        "fundamentals of the technologies this candidate lists — the kind that start with "
        "'What is…' or 'Why is…' (e.g. what is TypeScript, what is an interface, what are the "
        "pillars of OOP, what is a variable's scope, when do you use a for vs while loop). "
        "These are plain concept questions and must NOT reference the candidate's projects.\n"
        f"2) The next {_INTERMEDIATE_COUNT} are tier \"intermediate\": applied questions grounded "
        "in the candidate's ACTUAL resume — name their real projects, companies and tools, and "
        "ask how they used something or what they built.\n"
        f"3) The final {advanced_count} are tier \"advanced\": the tricky ones — trade-offs, "
        "failure modes, debugging the hardest issue, scaling and edge cases, or how they would "
        "redesign something today.\n"
    )
    if research_block:
        ladder_instruction += (
            "Adapt up to 2 of the intermediate/advanced questions from the research block, "
            "personalized with the candidate's real work rather than copied verbatim.\n"
        )

    user_prompt = (
        f"Candidate is interviewing for: {role}\n"
        f"Experience level: {experience}\n"
        f"Difficulty: {difficulty}\n"
        f"Skills to probe: {', '.join(skills) if skills else 'general'}\n\n"
        f"=== CANDIDATE'S ACTUAL RESUME CONTENT ===\n{context_block}\n"
        f"=== END RESUME ===\n\n"
        + (f"{research_block}\n\n" if research_block else "")
        + ladder_instruction
        + "\nReturn ONLY a valid JSON array in ramp order — no explanation, no markdown — "
        "where each item is:\n"
        '{"question": "<the question>", '
        '"section": "<fundamentals, or the resume section it covers>", '
        '"type": "behavioral|technical|system-design", '
        '"difficulty_tier": "basic|intermediate|advanced", '
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
            tier = str(item.get("difficulty_tier") or "").strip().lower()
            questions.append(
                {
                    "question": q_text,
                    "section": str(item.get("section") or "experience"),
                    "type": str(item.get("type") or "technical"),
                    # Unknown/missing tier sorts as intermediate — never ahead of the warm-ups.
                    "difficulty_tier": tier if tier in _TIER_ORDER else _TIER_INTERMEDIATE,
                    "expected_signals": [str(s) for s in signals if s][:5],
                }
            )
            if len(questions) >= _MAX_QUESTIONS:
                break

        if not questions:
            raise ValueError("LLM returned no usable questions")
        # Enforce the ramp even if the model returned them out of order.
        questions = _order_by_tier(questions)
        # If the model skipped the warm-ups entirely, prepend real ones.
        if not any(q["difficulty_tier"] == _TIER_BASIC for q in questions):
            questions = (_basic_questions(skills, role) + questions)[:_MAX_QUESTIONS]
        return {"questions": questions, "source": "llm"}
    except Exception as err:  # noqa: BLE001 — any failure must degrade gracefully
        import traceback
        print(f"[question_service] LLM generation failed, using fallback.\nerror={err}\n{traceback.format_exc()}")
        return {"questions": _fallback_questions(context_pack, role, difficulty, skills, research), "source": "fallback"}
