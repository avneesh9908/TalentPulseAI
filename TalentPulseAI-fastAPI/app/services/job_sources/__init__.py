"""
Pluggable ATS connectors for the Job Search Agent.

Each connector fetches postings from one ATS platform (Greenhouse, Lever,
Workday, ...) behind a uniform interface so adding a company is a data change
(a `target_companies` row), not code. Sourcing is via the ATS's public JSON
API — never HTML scraping — so it stays within site terms.
"""
from app.services.job_sources.base import (
    RawJob,
    ATSConnector,
    get_connector,
    available_ats_types,
)

__all__ = ["RawJob", "ATSConnector", "get_connector", "available_ats_types"]
