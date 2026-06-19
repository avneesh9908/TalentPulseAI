import hashlib
import importlib
import math
import re
from functools import lru_cache
from typing import Any, List


def _resolve_pgvector_class():
    try:
        module = importlib.import_module("langchain_postgres")
        return module.PGVector
    except ModuleNotFoundError:
        pass
    try:
        module = importlib.import_module("langchain_community.vectorstores")
        return module.PGVector
    except ModuleNotFoundError as err:
        raise ModuleNotFoundError(
            "PGVector backend is missing. Install one of: "
            "'langchain-postgres' (preferred) or 'langchain-community'."
        ) from err


PGVector = _resolve_pgvector_class()

# Dimension must match the active embedding model.
# Google text-embedding-004 → 768; OpenAI text-embedding-3-small → 1536.
_GOOGLE_DIM = 768
_OPENAI_DIM = 1536


class LocalHashEmbeddings:
    """
    Deterministic local embeddings fallback (no network / API key required).
    Keeps RAG functional when remote providers are unreachable.
    Dimension defaults to 768 to match Google text-embedding-004.
    """

    def __init__(self, dimension: int = _GOOGLE_DIM) -> None:
        self.dimension = dimension

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"[A-Za-z0-9_]+", (text or "").lower())

    def _embed(self, text: str) -> List[float]:
        vec = [0.0] * self.dimension
        tokens = self._tokenize(text)
        if not tokens:
            return vec
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            idx = int.from_bytes(digest[:4], "big") % self.dimension
            sign = 1.0 if (digest[4] & 1) == 0 else -1.0
            vec[idx] += sign
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
        return vec

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed(text)


@lru_cache(maxsize=8)
def get_google_embeddings(api_key: str, model: str):
    """Cached Google GenerativeAI embeddings client (free tier)."""
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    return GoogleGenerativeAIEmbeddings(model=model, google_api_key=api_key)


@lru_cache(maxsize=8)
def get_openai_compatible_embeddings(api_key: str, api_base: str, model: str):
    """Cached OpenAI-compatible embeddings client (Cursor legacy)."""
    from langchain_openai import OpenAIEmbeddings
    return OpenAIEmbeddings(
        model=model,
        openai_api_key=api_key,
        openai_api_base=api_base,
    )


def get_embeddings_for_settings(settings) -> Any:
    """
    Return the correct cached embeddings object based on EMBEDDING_PROVIDER.
    Raises ValueError with a clear message if required config is missing.
    """
    provider = (settings.EMBEDDING_PROVIDER or "google").lower()

    if provider == "google":
        if not settings.GOOGLE_API_KEY:
            raise ValueError(
                "GOOGLE_API_KEY is required when EMBEDDING_PROVIDER=google. "
                "Get a free key at https://aistudio.google.com/app/apikey"
            )
        return get_google_embeddings(
            api_key=settings.GOOGLE_API_KEY,
            model=settings.GOOGLE_EMBEDDING_MODEL,
        )

    if provider == "cursor":
        if not settings.CURSOR_API_KEY:
            raise ValueError("CURSOR_API_KEY is required when EMBEDDING_PROVIDER=cursor.")
        return get_openai_compatible_embeddings(
            api_key=settings.CURSOR_API_KEY,
            api_base=settings.CURSOR_API_BASE_URL,
            model=settings.CURSOR_EMBEDDING_MODEL,
        )

    raise ValueError(f"Unknown EMBEDDING_PROVIDER={provider!r}. Use 'google' or 'cursor'.")


def get_local_embeddings(dimension: int = _GOOGLE_DIM) -> LocalHashEmbeddings:
    return LocalHashEmbeddings(dimension=dimension)


def get_vector_store(embeddings: Any, collection_name: str, vector_db_url: str) -> Any:
    if not vector_db_url:
        raise RuntimeError(
            "VECTOR_DB_URL is not configured; vector store disabled for this environment."
        )
    return PGVector(
        embeddings=embeddings,
        collection_name=collection_name,
        connection=vector_db_url,
        use_jsonb=True,
    )


def connection_error(err: Exception, stage: str, model: str, base_url: str) -> RuntimeError:
    root = err
    if getattr(err, "__cause__", None):
        root = err.__cause__  # type: ignore[assignment]
    root_type = type(root).__name__
    root_msg = str(root) or str(err)
    return RuntimeError(
        f"{stage} connection failed. "
        f"base_url={base_url!r}, model={model!r}, "
        f"error_type={root_type}, error={root_msg}"
    )
