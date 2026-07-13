import base64
import hashlib
import io
import re
from typing import Dict, List

from pypdf import PdfReader

from app.core.config import settings
from app.schemas.resume_rag_schema import ResumeIndexRequest

# Only these sections are safe to embed — no PII (name/address/phone/email) should appear here.
SAFE_SECTIONS = {
    "summary",
    "experience",
    "work_experience",
    "projects",
    "skills",
    "education",
    "certifications",
    "achievements",
}

# Regex patterns for PII that must be stripped from any chunk text before embedding.
_PII_PATTERNS = [
    re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),   # email
    re.compile(r"\+?\d[\d\-\s().]{7,}\d"),                              # phone
    # Street address (number + street name variants)
    re.compile(r"\b\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4}\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Pl|Place)\.?\b"),
    # Postal / ZIP codes
    re.compile(r"\b\d{5}(?:-\d{4})?\b"),
    # LinkedIn / GitHub / personal URLs  (keep bare domain names like React, Node to avoid over-stripping)
    re.compile(r"https?://\S+"),
    re.compile(r"linkedin\.com/\S+"),
    re.compile(r"github\.com/\S+"),
]

# Geographic location fragments (city/state/country). Not interview-relevant and
# often glued to company/college names by PDF extraction (e.g. "...LimitedSurat, India").
_INDIAN_STATES = (
    "Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|Chhattisgarh|Goa|Gujarat|Haryana|"
    "Himachal Pradesh|Jharkhand|Karnataka|Kerala|Madhya Pradesh|Maharashtra|Manipur|"
    "Meghalaya|Mizoram|Nagaland|Odisha|Punjab|Rajasthan|Sikkim|Tamil Nadu|Telangana|"
    "Tripura|Uttar Pradesh|Uttarakhand|West Bengal|Jammu and Kashmir|Ladakh|"
    "Chandigarh|Puducherry"
)
_LOCATION_PATTERNS = [
    # "City, India" / "City, State, India" / "Khair, Aligarh, India"
    re.compile(r"[A-Z][a-zA-Z]+(?:[ ,]+[A-Z][a-zA-Z]+)*,\s*India\b"),
    # "City, <Indian State>" e.g. "Noida, Uttar Pradesh"
    re.compile(rf"[A-Z][a-zA-Z]+(?:[ ,]+[A-Z][a-zA-Z]+)*,\s*(?:{_INDIAN_STATES})\b"),
    # standalone ", India" / ", <State>" left after the above
    re.compile(rf",\s*(?:India|{_INDIAN_STATES})\b"),
]


def extract_text_from_pdf_b64(base64_pdf: str) -> str:
    pdf_bytes = base64.b64decode(base64_pdf)
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages: List[str] = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n".join(pages).strip()


# Below this many extracted characters the PDF is treated as scanned/image-based
# (pypdf only reads the text layer, which image PDFs don't have) and OCR kicks in.
_MIN_PDF_TEXT_CHARS = 120

_OCR_PROMPT = (
    "This document is a resume. Transcribe ALL text it contains, exactly as written, "
    "reading every page in order. Preserve section headings and line breaks. "
    "Output ONLY the transcribed plain text — no commentary, no markdown."
)


def _pdf_ocr_enabled() -> bool:
    return bool(settings.ENABLE_PDF_OCR and settings.GOOGLE_API_KEY)


def ocr_pdf_with_gemini(base64_pdf: str) -> str:
    """OCR a scanned/image-based PDF by sending it inline to Gemini vision."""
    from app.services import llm_service  # lazy import: avoids cost when OCR disabled

    return llm_service.generate_content_rest(
        parts=[
            {"inline_data": {"mime_type": "application/pdf", "data": base64_pdf}},
            {"text": _OCR_PROMPT},
        ],
        temperature=0.0,
        timeout=120,
    )


def normalize_resume_text(payload: ResumeIndexRequest) -> str:
    if payload.resume.text and payload.resume.text.strip():
        return payload.resume.text.strip()
    if payload.resume.base64_pdf:
        extracted = extract_text_from_pdf_b64(payload.resume.base64_pdf)
        if len(extracted) >= _MIN_PDF_TEXT_CHARS:
            return extracted
        if _pdf_ocr_enabled():
            try:
                ocr_text = ocr_pdf_with_gemini(payload.resume.base64_pdf)
                if len(ocr_text) > len(extracted):
                    return ocr_text
            except Exception as err:  # noqa: BLE001 — OCR failure must not kill indexing
                import traceback
                print(
                    f"[resume_parser] Gemini OCR failed; using pypdf text if any.\n"
                    f"error={err}\n{traceback.format_exc()}"
                )
        if extracted:
            return extracted
    raise ValueError(
        "Resume text is empty. The PDF has no text layer (scanned/image-based) and "
        "OCR was unavailable. Provide resume.text or a text-based PDF."
    )


# Canonical section -> heading aliases seen on real resumes. Matching is fuzzy
# (normalized + keyword fallback) so variants like "Work History" or
# "Technical Skills" are not dropped into the discarded header block.
_SECTION_ALIASES = {
    "summary": ["summary", "professional summary", "profile", "about", "about me",
                "objective", "career objective", "overview"],
    "experience": ["experience", "work experience", "professional experience",
                   "employment", "employment history", "work history", "career history",
                   "relevant experience"],
    "projects": ["projects", "key projects", "selected projects", "personal projects",
                 "academic projects", "notable projects"],
    "skills": ["skills", "technical skills", "core skills", "core competencies",
               "competencies", "skills and technologies", "technologies",
               "technical proficiencies", "areas of expertise"],
    "education": ["education", "academic background", "education and training",
                  "academics", "qualifications", "educational qualifications"],
    "certifications": ["certifications", "certificates", "certifications and licenses",
                       "licenses", "courses", "training"],
    "achievements": ["achievements", "awards", "honors", "honours", "accomplishments",
                     "awards and honors", "achievements and awards"],
}

# Single-word keywords that strongly imply a heading on a short standalone line.
_SECTION_KEYWORDS = {
    "experience": "experience", "projects": "projects", "skills": "skills",
    "education": "education", "summary": "summary",
    "certifications": "certifications", "achievements": "achievements",
}

# Role/tech words that disqualify a line from being read as the candidate's name.
_NAME_STOPWORDS = {
    "engineer", "developer", "manager", "senior", "junior", "lead", "software",
    "data", "scientist", "analyst", "designer", "architect", "consultant",
    "intern", "student", "full", "stack", "frontend", "backend", "resume",
    "curriculum", "vitae", "profile",
}


def _normalize_heading(line: str) -> str:
    s = re.sub(r"[^a-z& ]", " ", line.lower()).replace("&", " and ")
    return re.sub(r"\s+", " ", s).strip()


def _match_section(line: str):
    """Return the canonical section for a heading line, or None if it's body text."""
    s = _normalize_heading(line)
    if not s:
        return None
    words = s.split()
    if len(words) > 5:
        return None
    # Strong: normalized line exactly equals a known alias.
    for canonical, aliases in _SECTION_ALIASES.items():
        if s in aliases:
            return canonical
    # Fallback: a short standalone line containing a section keyword (e.g. "Technical Skills").
    if len(words) <= 4:
        for canonical, keyword in _SECTION_KEYWORDS.items():
            if keyword in words:
                return canonical
    return None


def detect_candidate_name(text: str):
    """
    Best-effort detection of the candidate's own name (top of resume) so it can be
    stripped from embedded text. Conservative: skips lines with role/tech words.
    Third-party names inside body text are NOT detected (would need NER).
    """
    for line in [ln.strip() for ln in text.splitlines() if ln.strip()][:6]:
        if "@" in line or any(ch.isdigit() for ch in line):
            continue
        words = line.split()
        if not (2 <= len(words) <= 3):
            continue
        if not all(re.fullmatch(r"[A-Za-z][A-Za-z.'-]*", w) for w in words):
            continue
        if any(w.lower() in _NAME_STOPWORDS for w in words):
            continue
        if all(w.istitle() or w.isupper() for w in words):
            return line
    return None


def _strip_name(text: str, name) -> str:
    if not name:
        return text
    # Strip the full-name phrase (and possessive) case-insensitively.
    pattern = re.compile(rf"\b{re.escape(name)}(?:'s)?\b", re.IGNORECASE)
    return pattern.sub("", text)


def parse_sections(text: str) -> Dict[str, str]:
    """
    Split resume text into named sections (SAFE_SECTIONS only). The header/general
    block (name, address, phone, email) is excluded. Heading matching is fuzzy, and
    the candidate's name is stripped from every returned section.
    """
    name = detect_candidate_name(text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    current = "general"  # header block — dropped
    bucket: Dict[str, List[str]] = {current: []}

    for line in lines:
        section = _match_section(line)
        if section:
            current = section
            bucket.setdefault(current, [])
            continue
        bucket.setdefault(current, []).append(line)

    sections = {
        section: _strip_name("\n".join(parts).strip(), name)
        for section, parts in bucket.items()
        if parts and section in SAFE_SECTIONS
    }

    # Fallback: if no recognized sections, embed the whole resume (name-stripped)
    # as a single summary rather than dropping everything.
    if not sections:
        full = _strip_name("\n".join(lines).strip(), name)
        if full:
            sections = {"summary": full}

    return sections


# ── Intelligent (LLM-based) resume extraction ────────────────────────────────
# Uses Gemini to read the raw resume and return ONLY interview-relevant
# professional content, with all PII (name, contact, address, location) excluded
# by design. Falls back to the heuristic parser when the LLM is off/unavailable.

_RESUME_PARSE_SYSTEM = (
    "You are a precise resume parser for an interview platform. Your job is to extract "
    "ONLY the professional, interview-relevant content from a resume and to COMPLETELY "
    "EXCLUDE every piece of personal or contact information.\n\n"
    "ALWAYS REMOVE (never include in output): full name, phone numbers, email addresses, "
    "physical/mailing addresses, city/state/country/location, postal or ZIP codes, "
    "LinkedIn/GitHub/portfolio/social URLs, date of birth, age, gender, marital status, "
    "nationality, photos, and any government or national ID numbers.\n\n"
    "ALWAYS KEEP (this is what interviewers care about): professional summary, work "
    "experience (role, company type, responsibilities, technologies, impact — but NOT the "
    "company's address/location), projects (what was built, tech stack, your contribution, "
    "outcomes), skills, education (degree, field, institution name — but NOT its address), "
    "certifications, and achievements.\n\n"
    "Preserve the candidate's real wording and technical detail. Do not invent content."
)

_LLM_SECTION_KEYS = (
    "summary", "experience", "projects", "skills",
    "education", "certifications", "achievements",
)


def _llm_resume_parsing_enabled() -> bool:
    return bool(settings.ENABLE_LLM_RESUME_PARSING and settings.GOOGLE_API_KEY)


def parse_sections_llm(text: str) -> Dict[str, str]:
    """
    Intelligent extraction: ask Gemini to return interview-relevant sections with
    all PII excluded. Returns {} on any failure so the caller can fall back to the
    heuristic parser. Temperature 0 keeps output stable for content-hash dedup.
    """
    from app.services import llm_service  # lazy import: avoids cost when LLM disabled

    user_prompt = (
        "Extract the resume below into clean JSON. Include ONLY sections that have real "
        "content. Each value is plain text (newline-separated bullets are fine). "
        "Strictly exclude all personal and contact information as instructed.\n\n"
        "Return ONLY a JSON object, no markdown, with any of these keys:\n"
        f"{', '.join(_LLM_SECTION_KEYS)}\n\n"
        f"=== RESUME ===\n{text}\n=== END RESUME ==="
    )

    model = llm_service.get_chat_model(settings.GOOGLE_API_KEY, settings.GOOGLE_CHAT_MODEL, 0.0)
    response = model.invoke([("system", _RESUME_PARSE_SYSTEM), ("human", user_prompt)])
    raw = getattr(response, "content", "") or ""
    data = llm_service.parse_json(raw)
    if not isinstance(data, dict):
        raise ValueError("LLM resume parse did not return a JSON object")

    # Keep only safe section keys; defense-in-depth PII strip + name strip on every value.
    name = detect_candidate_name(text)
    sections: Dict[str, str] = {}
    for key in _LLM_SECTION_KEYS:
        value = data.get(key)
        if not isinstance(value, str):
            continue
        cleaned = strip_pii(_strip_name(value.strip(), name))
        if cleaned:
            sections[key] = cleaned

    if not sections:
        raise ValueError("LLM resume parse produced no usable sections")
    return sections


def extract_sections(text: str) -> Dict[str, str]:
    """
    Dispatcher: intelligent LLM extraction first, heuristic parser as fallback.
    Always returns the same {section: text} shape, so callers are unaffected.
    """
    if _llm_resume_parsing_enabled():
        try:
            return parse_sections_llm(text)
        except Exception as err:  # noqa: BLE001 — any failure must degrade gracefully
            import traceback
            print(
                f"[resume_parser] LLM parsing failed, using heuristic parser.\n"
                f"error={err}\n{traceback.format_exc()}"
            )
    return parse_sections(text)


def strip_pii(text: str) -> str:
    """Remove PII tokens from a chunk of text before it is embedded."""
    for pattern in _PII_PATTERNS:
        text = pattern.sub("", text)
    for pattern in _LOCATION_PATTERNS:
        text = pattern.sub("", text)
    # Collapse runs of whitespace left behind by removals.
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def compute_content_hash(sections: Dict[str, str]) -> str:
    """
    SHA-256 of the PII-stripped, section-filtered text that will be embedded.
    Identical resume content uploaded across multiple interviews produces the
    same hash, enabling the embedding dedup short-circuit in ResumeRAGService.
    """
    # Deterministic: sort sections so key order doesn't affect the hash.
    canonical = "\n\n".join(
        f"[{section}]\n{strip_pii(text)}"
        for section, text in sorted(sections.items())
        if text.strip()
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def extract_summary(text: str, skills: List[str]) -> Dict:
    """Extract metadata for storage. PII values are stored in the DB record only — never embedded."""
    years_match = re.search(r"(\d+)\+?\s+years?", text.lower())
    email_match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    phone_match = re.search(r"(\+?\d[\d\-\s]{8,}\d)", text)

    return {
        "detected_years": years_match.group(1) if years_match else None,
        "detected_email": email_match.group(0) if email_match else None,
        "detected_phone": phone_match.group(0) if phone_match else None,
        "skills_from_setup": skills,
    }
