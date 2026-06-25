import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, user, interview
from app.database.db import engine, Base
import app.models

app = FastAPI()

# ALLOWED_ORIGINS env var: comma-separated list of extra origins (e.g. Netlify URL).
# Trailing slashes are stripped because the browser Origin header never has one.
# Localhost entries are always included for local dev.
_extra_origins = [
    o.strip().rstrip("/")
    for o in os.environ.get("ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]
_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    *_extra_origins,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    # Match any Netlify site (production + deploy previews) regardless of the
    # exact subdomain, so CORS keeps working without re-editing env vars.
    allow_origin_regex=r"https://([a-z0-9-]+\.)*netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(interview.router, prefix="/interview", tags=["Interview"])
