import base64
import hashlib
import io
import re
from typing import Dict, List

from pypdf import PdfReader

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


def extract_text_from_pdf_b64(base64_pdf: str) -> str:
    pdf_bytes = base64.b64decode(base64_pdf)
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages: List[str] = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n".join(pages).strip()


def normalize_resume_text(payload: ResumeIndexRequest) -> str:
    if payload.resume.text and payload.resume.text.strip():
        return payload.resume.text.strip()
    if payload.resume.base64_pdf:
        extracted = extract_text_from_pdf_b64(payload.resume.base64_pdf)
        if extracted:
            return extracted
    raise ValueError("Resume text is empty. Provide resume.text or resume.base64_pdf")


def parse_sections(text: str) -> Dict[str, str]:
    """
    Split resume text into named sections.
    Only sections in SAFE_SECTIONS are returned — the header/general block
    (which contains name, address, phone, email) is intentionally excluded.
    """
    headings = {
        "summary",
        "experience",
        "work experience",
        "projects",
        "skills",
        "education",
        "certifications",
        "achievements",
    }
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    current = "general"  # header block — will be dropped
    bucket: Dict[str, List[str]] = {current: []}

    for line in lines:
        key = line.lower().strip(":")
        if key in headings:
            current = key.replace(" ", "_")
            bucket.setdefault(current, [])
            continue
        bucket.setdefault(current, []).append(line)

    return {
        section: "\n".join(parts).strip()
        for section, parts in bucket.items()
        if parts and section in SAFE_SECTIONS
    }


def strip_pii(text: str) -> str:
    """Remove PII tokens from a chunk of text before it is embedded."""
    for pattern in _PII_PATTERNS:
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
