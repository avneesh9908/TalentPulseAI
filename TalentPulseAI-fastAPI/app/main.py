import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.routes import auth, user, interview, jobs
from app.database.db import engine, Base
import app.models

# Whether the startup schema sync reached the database. A failure here is NOT
# fatal: the process stays up so the platform can bind a port and /health can
# explain itself, instead of crash-looping with "no open ports detected".
# Requests still hit the DB normally — pool_pre_ping reconnects — so if the
# database comes back the API recovers without a redeploy.
DB_STATUS = {"ready": False, "error": None}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Which database this process is actually attached to. Printed without the
    # credentials: a local frontend pointed at the deployed API (or the reverse)
    # reads as "my account does not exist", and this line is how you tell the
    # two apart.
    url = engine.url
    print(
        f"[startup] DB {url.host}:{url.port or 5432}/{url.database} "
        f"({'LOCAL' if url.host in ('localhost', '127.0.0.1') else 'REMOTE'})"
    )

    try:
        Base.metadata.create_all(bind=engine)
    except SQLAlchemyError as exc:
        # Full detail to the log only — the text can carry host/DSN fragments,
        # so /health returns a short summary instead.
        DB_STATUS["error"] = type(exc).__name__
        print(
            "[startup] DB UNREACHABLE - the service is up, but every route that "
            "touches the database will fail until the connection is fixed."
        )
        print(f"[startup] {type(exc).__name__}: {exc}")
    else:
        DB_STATUS["ready"] = True
        print("[startup] DB ready - schema in sync.")

    yield

    engine.dispose()


app = FastAPI(lifespan=lifespan)

# ALLOWED_ORIGINS env var: comma-separated list of extra origins (e.g. Netlify URL).
# Trailing slashes are stripped because the browser Origin header never has one.
# Localhost and Netlify are covered by allow_origin_regex below, so this is only
# for one-off origins that match neither.
_extra_origins = [
    o.strip().rstrip("/")
    for o in os.environ.get("ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]
_origins = [*_extra_origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    # Two families of allowed origin, so neither needs an env-var edit:
    #  - any Netlify site (production + deploy previews), whatever the subdomain
    #  - any localhost/127.0.0.1 port, because Vite drifts to 5174/5175 when
    #    5173 is busy and a hardcoded port list turns that into a silent failure
    allow_origin_regex=(
        r"https://([a-z0-9-]+\.)*netlify\.app"
        r"|http://(localhost|127\.0\.0\.1)(:\d+)?"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health():
    """Liveness + database reachability, re-checked on every call.

    503 when the database is down, so a platform health check fails loudly
    instead of the whole process disappearing at boot.
    """
    try:
        with engine.connect():
            pass
    except SQLAlchemyError as exc:
        print(f"[health] DB check failed: {type(exc).__name__}: {exc}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "database": "unreachable",
                "error": type(exc).__name__,
                "schema_synced": DB_STATUS["ready"],
            },
        )

    return {
        "status": "ok",
        "database": "connected",
        # False means the boot-time create_all was skipped because the DB was
        # down; the connection has since recovered but the schema was never
        # synced, so a restart is still wanted.
        "schema_synced": DB_STATUS["ready"],
    }


app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
