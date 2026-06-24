import re
from typing import Dict, List, Optional

from app.services import llm_service


def count_words(answer: str) -> int:
    return len(re.findall(r"\b[\w'-]+\b", answer.lower()))


def score_answer(answer: str, skills: List[str]) -> Dict:
    text = (answer or "").strip()
    if not text:
        return {
            "score": 0,
            "feedback": "No answer captured. Add a clear response with an example.",
        }

    words = count_words(text)
    structure_markers = ["because", "for example", "tradeoff", "challenge", "result", "impact"]
    technical_markers = [s.lower() for s in skills[:8] if s]
    structure_hits = sum(1 for marker in structure_markers if marker in text.lower())
    technical_hits = sum(1 for marker in technical_markers if marker and marker in text.lower())

    depth_score = min(1.0, words / 90.0)
    structure_score = min(1.0, structure_hits / 3.0)
    technical_score = min(1.0, technical_hits / 2.0) if technical_markers else 0.6

    total = int(round((depth_score * 0.5 + structure_score * 0.25 + technical_score * 0.25) * 100))
    if total >= 80:
        feedback = "Strong response with solid depth and good technical clarity."
    elif total >= 60:
        feedback = "Good baseline. Add one concrete metric/result to strengthen impact."
    else:
        feedback = "Too brief or generic. Use STAR format and include technical specifics."

    return {"score": total, "feedback": feedback}


def build_interview_feedback(answers: Dict, skills: List[str]) -> Dict:
    per_question = []
    for key, value in answers.items():
        raw = " ".join(value) if isinstance(value, list) else str(value or "")
        scored = score_answer(raw, skills)
        per_question.append(
            {
                "question_id": key,
                "score": scored["score"],
                "feedback": scored["feedback"],
                "word_count": count_words(raw),
            }
        )

    if not per_question:
        return {
            "score": 0,
            "strengths": [],
            "improvements": ["No answers were submitted. Try the interview again with full responses."],
            "overall_feedback": "No responses were captured.",
            "question_feedback": [],
            "next_steps": [
                "Practice answering with STAR format.",
                "Speak 60-120 seconds per question.",
            ],
        }

    avg_score = int(round(sum(item["score"] for item in per_question) / len(per_question)))
    avg_words = int(round(sum(item["word_count"] for item in per_question) / len(per_question)))
    answered_with_depth = sum(1 for item in per_question if item["word_count"] >= 45)

    strengths = []
    improvements = []
    if avg_score >= 75:
        strengths.append("Responses show strong technical depth and clear communication.")
    if answered_with_depth >= max(1, len(per_question) // 2):
        strengths.append("Most answers include enough detail to evaluate your experience.")
    if skills:
        strengths.append(f"Relevant skills were covered: {', '.join(skills[:4])}.")

    if avg_words < 45:
        improvements.append("Increase answer depth: target 60-120 words per question.")
    if any(item["score"] < 60 for item in per_question):
        improvements.append("Strengthen weaker answers using a Situation-Task-Action-Result structure.")
    improvements.append("Add measurable outcomes (latency, scale, revenue, accuracy) to improve credibility.")

    level = "excellent" if avg_score >= 80 else "good" if avg_score >= 65 else "developing"
    overall_feedback = (
        f"Overall performance is {level}. You scored {avg_score}/100. "
        f"Average answer length was {avg_words} words."
    )

    return {
        "score": avg_score,
        "strengths": strengths[:3],
        "improvements": improvements[:3],
        "overall_feedback": overall_feedback,
        "question_feedback": per_question,
        "next_steps": [
            "Do one timed mock round focusing on weaker questions.",
            "Prepare concise project stories with metrics and trade-offs.",
            "Review top role-specific concepts before your next interview.",
        ],
    }


def _answer_text(value) -> str:
    return " ".join(value) if isinstance(value, list) else str(value or "")


_JUDGE_SYSTEM_PROMPT = (
    "You are a strict but fair senior technical interviewer scoring a mock interview. "
    "Judge each answer ONLY against the question asked and the expected signals — reward "
    "correctness, relevant depth, structure, and clear communication; penalise vague, "
    "off-topic, or keyword-stuffed answers. Do not reward length alone. Be specific and "
    "actionable. Scores are 0-100."
)


def build_interview_feedback_llm(
    answers: Dict,
    skills: List[str],
    questions: List[Dict],
    role: str = "",
    experience: str = "",
    difficulty: str = "",
) -> Dict:
    """
    LLM-as-judge feedback. `questions` is a list of {question_id, question, expected_signals}.
    Raises on any failure so the caller can fall back to the heuristic scorer.
    """
    by_id = {q.get("question_id"): q for q in (questions or []) if q.get("question_id")}

    qa_blocks: List[str] = []
    for key, value in answers.items():
        q = by_id.get(key, {})
        q_text = q.get("question") or "(question text unavailable)"
        signals = ", ".join(q.get("expected_signals") or []) or "(none provided)"
        qa_blocks.append(
            f"- id: {key}\n  question: {q_text}\n  expected_signals: {signals}\n  answer: {_answer_text(value).strip() or '(no answer)'}"
        )

    user_prompt = (
        f"Role: {role}; Experience: {experience}; Difficulty: {difficulty}; "
        f"Target skills: {', '.join(skills) if skills else 'general'}\n\n"
        "Question/answer set:\n" + "\n".join(qa_blocks) + "\n\n"
        "Return ONLY a JSON object (no prose) with this exact shape:\n"
        '{"score": <0-100 overall>, '
        '"strengths": ["..."], "improvements": ["..."], '
        '"overall_feedback": "<2-3 sentences>", '
        '"next_steps": ["..."], '
        '"question_feedback": [{"question_id": "<id>", "score": <0-100>, "feedback": "<specific, 1-2 sentences>"}]}'
    )

    model = llm_service.chat_model(temperature=0.2)
    response = model.invoke([("system", _JUDGE_SYSTEM_PROMPT), ("human", user_prompt)])
    data = llm_service.parse_json(getattr(response, "content", "") or "")
    if not isinstance(data, dict):
        raise ValueError("Judge did not return a JSON object")

    raw_items = {
        str(item.get("question_id")): item
        for item in (data.get("question_feedback") or [])
        if isinstance(item, dict)
    }

    # Rebuild per-question feedback from the actual answers so word_count is authoritative
    # and every answered question is represented even if the judge omitted one.
    per_question: List[Dict] = []
    for key, value in answers.items():
        raw = _answer_text(value)
        judged = raw_items.get(key, {})
        try:
            q_score = int(round(float(judged.get("score"))))
        except (TypeError, ValueError):
            q_score = score_answer(raw, skills)["score"]
        per_question.append(
            {
                "question_id": key,
                "score": max(0, min(100, q_score)),
                "feedback": str(judged.get("feedback") or "No detailed feedback available for this answer."),
                "word_count": count_words(raw),
            }
        )

    if not per_question:
        raise ValueError("No answers to score")

    try:
        overall = int(round(float(data.get("score"))))
    except (TypeError, ValueError):
        overall = int(round(sum(item["score"] for item in per_question) / len(per_question)))

    def _str_list(value) -> List[str]:
        return [str(v) for v in value if v] if isinstance(value, list) else []

    return {
        "score": max(0, min(100, overall)),
        "strengths": _str_list(data.get("strengths"))[:3],
        "improvements": _str_list(data.get("improvements"))[:3],
        "overall_feedback": str(data.get("overall_feedback") or f"You scored {overall}/100."),
        "question_feedback": per_question,
        "next_steps": _str_list(data.get("next_steps"))[:4]
        or [
            "Do one timed mock round focusing on weaker questions.",
            "Prepare concise project stories with metrics and trade-offs.",
        ],
    }


def generate_feedback(
    answers: Dict,
    skills: List[str],
    questions: Optional[List[Dict]] = None,
    role: str = "",
    experience: str = "",
    difficulty: str = "",
) -> Dict:
    """Score with the LLM judge when available; otherwise the heuristic scorer."""
    if answers and llm_service.llm_enabled():
        try:
            return build_interview_feedback_llm(
                answers, skills, questions or [], role, experience, difficulty
            )
        except Exception as err:  # noqa: BLE001 — any failure degrades to heuristic
            print(f"[scoring_service] LLM judging failed, using heuristic. error={err}")
    return build_interview_feedback(answers, skills)
