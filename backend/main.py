"""FastAPI application entrypoint for the AI Academic Assistant."""

from __future__ import annotations

import os
import sys

# Add the root "d:\new project" folder to the Python path 
# so that 'from backend...' absolute imports work correctly everywhere.
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.routes import chat, documents, plagiarism, rag, spellcheck, auth
from backend.config import settings
from backend.services.vector_store import VectorStore

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle for the AI Assistant."""
    logger.info("AI Academic Assistant is starting up.")
    # We load the VectorStore lazily on first request to avoid 
    # Render port-scan timeouts during heavy model loading.
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="AI Academic Assistant",
    description=(
        "Upload documents, chat with them via RAG, detect plagiarism, "
        "check spelling & grammar, and use a general AI assistant."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS (allow Streamlit on any port) ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files (PDFs) ───────────────────────────────────────────────────
app.mount("/api/files", StaticFiles(directory=str(settings.upload_dir)), name="uploads")

# ── Register route modules ─────────────────────────────────────────────────
app.include_router(documents.router)
app.include_router(rag.router)
app.include_router(plagiarism.router)
app.include_router(spellcheck.router)
app.include_router(chat.router)
app.include_router(auth.router)


@app.get("/", tags=["Health"])
async def health_check():
    """Simple health-check / root endpoint."""
    store = VectorStore.get()
    return {
        "status": "ok",
        "service": "AI Academic Assistant",
        "vectors_stored": store.total_vectors,
    }


if __name__ == "__main__":
    import os
    import sys
    import uvicorn

    # Add the root "d:\new project" folder to the Python path 
    # so that 'from backend...' absolute imports work correctly
    # even when this file is executed directly.
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
