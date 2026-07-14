"""
Greenhouse connector.

Public boards API (no auth):
    GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true
returns every posting for the board, description HTML included. `board_slug` is
the board token (e.g. "stripe").
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

import requests

from app.core.config import settings

_BASE = "https://boards-api.greenhouse.io/v1/boards"


class GreenhouseConnector:
    ats_type = "greenhouse"

    def fetch(self, board_slug: str, company_name: str, designations: List[str]) -> List["RawJob"]:
        # Local import avoids a circular dependency at module load.
        from app.services.job_sources.base import RawJob  # noqa: F401

        url = f"{_BASE}/{board_slug}/jobs"
        try:
            resp = requests.get(
                url,
                params={"content": "true"},
                timeout=settings.JOB_SEARCH_HTTP_TIMEOUT,
                headers={"Accept": "application/json"},
            )
            resp.raise_for_status()
            payload = resp.json()
        except Exception as err:  # network / HTTP / JSON — degrade to empty
            print(f"[greenhouse] fetch failed for board={board_slug}: {err}")
            return []

        return parse_jobs(payload, company_name, designations)


def _parse_posted_at(raw: Optional[str]) -> Optional[datetime]:
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


def parse_jobs(payload: Dict[str, Any], company_name: str, designations: List[str]) -> List["RawJob"]:
    """Pure parse of a Greenhouse jobs payload → RawJob list. Unit-testable offline."""
    from app.services.job_sources.base import (
        RawJob,
        strip_html,
        title_matches_designations,
    )

    jobs = (payload or {}).get("jobs") or []
    out: List[RawJob] = []
    for j in jobs[: settings.JOB_SEARCH_MAX_PER_COMPANY]:
        title = (j.get("title") or "").strip()
        if not title or not title_matches_designations(title, designations):
            continue

        loc = (j.get("location") or {}).get("name") if isinstance(j.get("location"), dict) else None
        external_id = str(j.get("id") or "").strip()
        if not external_id:
            continue

        out.append(
            RawJob(
                source="greenhouse",
                external_id=external_id,
                company=company_name,
                title=title,
                url=j.get("absolute_url") or "",
                location=loc,
                remote=bool(loc and "remote" in loc.lower()),
                description=strip_html(j.get("content")),
                posted_at=_parse_posted_at(j.get("updated_at")),
            )
        )
    return out
