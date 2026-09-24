import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, user, interview, jobs
from app.database.db import engine, Base
import app.models

app = FastAPI()

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


Base.metadata.create_all(bind=engine)

# Which database this process is actually attached to. Printed without the
# credentials: a local frontend pointed at the deployed API (or the reverse) reads
# as "my account does not exist", and this line is how you tell the two apart.
_url = engine.url
print(
    f"[startup] DB {_url.host}:{_url.port or 5432}/{_url.database} "
    f"({'LOCAL' if _url.host in ('localhost', '127.0.0.1') else 'REMOTE'})"
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
