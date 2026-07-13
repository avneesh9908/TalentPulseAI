"""
Shared Gemini chat-model access (free tier). Lazy import + cached clients so
both question generation and answer scoring reuse one configured client per
(model, temperature). Mirrors the embedding_service pattern.
"""
import json
import re
from functools import lru_cache
from typing import Any, List

from app.core.config import settings


@lru_cache(maxsize=8)
def get_chat_model(api_key: str, model: str, temperature: float):
    from langchain_google_genai import ChatGoogleGenerativeAI

    return ChatGoogleGenerativeAI(model=model, google_api_key=api_key, temperature=temperature)


def llm_enabled() -> bool:
    return bool(settings.ENABLE_LLM_QUESTIONS and settings.GOOGLE_API_KEY)


def chat_model(temperature: float = 0.4):
    """Convenience accessor using the configured key/model. Caller must check llm_enabled() first."""
    return get_chat_model(settings.GOOGLE_API_KEY, settings.GOOGLE_CHAT_MODEL, temperature)


_GEMINI_REST_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def generate_content_rest(
    parts: List[dict],
    tools: Any = None,
    model: str = "",
    temperature: float = 0.2,
    timeout: int = 60,
) -> str:
    """
    Call Gemini generateContent over REST for capabilities the langchain client
    doesn't expose: inline PDF vision (OCR of scanned resumes) and Google Search
    grounding (web research). Returns the concatenated text of the first candidate.
    """
    import requests  # lazy: only needed when OCR/research features run

    body: dict = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {"temperature": temperature},
    }
    if tools:
        body["tools"] = tools
    response = requests.post(
        f"{_GEMINI_REST_BASE}/{model or settings.GOOGLE_CHAT_MODEL}:generateContent",
        headers={"x-goog-api-key": settings.GOOGLE_API_KEY},
        json=body,
        timeout=timeout,
    )
    response.raise_for_status()
    data = response.json()
    out_parts = (data.get("candidates") or [{}])[0].get("content", {}).get("parts", [])
    return "\n".join(p.get("text", "") for p in out_parts if p.get("text")).strip()


def parse_json(content: str) -> Any:
    """Extract a JSON value from a model response, tolerating ``` fences and surrounding prose."""
    text = (content or "").strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    # Isolate the outermost array or object if there's surrounding prose.
    for open_ch, close_ch in (("[", "]"), ("{", "}")):
        start, end = text.find(open_ch), text.rfind(close_ch)
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                continue
    return json.loads(text)


def extract_array(content: str) -> List[dict]:
    data = parse_json(content)
    if not isinstance(data, list):
        raise ValueError("Expected a JSON array")
    return data
