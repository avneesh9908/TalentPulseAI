"""
Connector interface + shared helpers for ATS job sources.

A connector turns one company's ATS board into a list of `RawJob`s. Connectors
must NEVER raise out of `fetch` — a dead board or network blip degrades to an
empty list so one bad company can't sink a whole search run.
"""
from __future__ import annotations

import hashlib
import html
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Callable, Dict, List, Optional

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"[ \t\r\f\v]+")
_MULTINEWLINE_RE = re.compile(r"\n{3,}")


@dataclass
class RawJob:
    """A normalized posting, source-agnostic. Maps 1:1 onto JobListing columns."""
    source: str
    external_id: str
    company: str
    title: str
    url: str
    location: Optional[str] = None
    remote: bool = False
    description: Optional[str] = None
    salary: Optional[str] = None
    posted_at: Optional[datetime] = None
    content_hash: str = field(default="")

    def __post_init__(self) -> None:
        if not self.content_hash:
            self.content_hash = compute_job_hash(
                self.company, self.title, self.description or ""
            )


class ATSConnector:
    """Base connector. Subclasses set `ats_type` and implement `fetch`."""
    ats_type: str = ""

    def fetch(self, board_slug: str, company_name: str, designations: List[str]) -> List[RawJob]:
        raise NotImplementedError


def strip_html(raw: Optional[str]) -> str:
    """Turn ATS description HTML into plain text suitable for embedding."""
    if not raw:
        return ""
    text = html.unescape(raw)
    text = _TAG_RE.sub(" ", text)
    text = _WS_RE.sub(" ", text)
    text = _MULTINEWLINE_RE.sub("\n\n", text)
    return text.strip()


def compute_job_hash(company: str, title: str, description: str) -> str:
    canonical = f"{(company or '').strip().lower()}\n{(title or '').strip().lower()}\n{(description or '').strip()}"
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def title_matches_designations(title: str, designations: List[str]) -> bool:
    """Loose keyword pre-filter to avoid embedding obviously-irrelevant postings.

    Empty `designations` means "keep everything" — real ranking happens later
    via resume-vs-job embeddings, so this only trims gross non-matches.
    """
    if not designations:
        return True
    t = (title or "").lower()
    for d in designations:
        d = (d or "").strip().lower()
        if not d:
            continue
        # match on any significant token of the designation (>=3 chars)
        tokens = [tok for tok in re.split(r"[^a-z0-9+#]+", d) if len(tok) >= 3]
        if tokens and any(tok in t for tok in tokens):
            return True
        if d and d in t:
            return True
    return False


# ── Registry ──────────────────────────────────────────────────────────────────
_REGISTRY: Dict[str, Callable[[], ATSConnector]] = {}


def register_connector(ats_type: str, factory: Callable[[], ATSConnector]) -> None:
    _REGISTRY[ats_type] = factory


def get_connector(ats_type: str) -> Optional[ATSConnector]:
    factory = _REGISTRY.get((ats_type or "").strip().lower())
    return factory() if factory else None


def available_ats_types() -> List[str]:
    return sorted(_REGISTRY.keys())


# Register built-in connectors. Imported here (bottom) to avoid circular imports.
from app.services.job_sources import greenhouse  # noqa: E402

register_connector("greenhouse", greenhouse.GreenhouseConnector)
