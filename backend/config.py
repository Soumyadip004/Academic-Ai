"""Application settings loaded from environment variables."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Project root (parent of backend/)
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Central configuration for the AI Academic Assistant."""

    # ── LLM Provider ────────────────────────────────────────────────
    llm_provider: str = "groq"  # "groq", "openai", or "ollama"
    groq_api_key: str = ""
    openai_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    openai_model: str = "gpt-4o-mini"
    ollama_model: str = "llama3.2"
    ollama_base_url: str = "http://localhost:11434"
    persist_data: bool = False

    # ── Embedding ───────────────────────────────────────────────────
    embedding_model: str = "all-MiniLM-L6-v2"

    # ── RAG ─────────────────────────────────────────────────────────
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k_results: int = 5

    # ── Paths ───────────────────────────────────────────────────────
    upload_dir: Path = BASE_DIR / "uploads"
    vector_store_dir: Path = BASE_DIR / "vector_store"

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

    def model_post_init(self, __context):
        """Ensure runtime directories exist."""
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.vector_store_dir.mkdir(parents=True, exist_ok=True)


settings = Settings()
