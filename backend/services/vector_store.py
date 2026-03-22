"""FAISS vector store wrapper with SentenceTransformer embeddings."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np

from backend.config import settings

logger = logging.getLogger(__name__)


@dataclass
class ChunkMetadata:
    """Metadata stored alongside each embedded chunk."""
    doc_id: str
    user_id: str  # Added to track ownership
    filename: str
    chunk_index: int
    text: str


class VectorStore:
    """Thin wrapper around a FAISS flat-IP index + SentenceTransformer."""

    _instance: "VectorStore | None" = None

    def __init__(self) -> None:
        # We no longer load SentenceTransformer locally to save RAM on Render's free tier.
        # Instead, we use the Hugging Face Inference API (server-side).
        import faiss
        self.model_id = settings.embedding_model
        self.dimension = 768  # Dimension for all-mpnet-base-v2

        # Inner-product index (embeddings are L2-normalised → equiv. to cosine)
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata: list[ChunkMetadata] = []

        # Try to load a previously saved index if persistence is enabled
        if settings.persist_data:
            self._load()

    # ── Singleton ───────────────────────────────────────────────────

    @classmethod
    def get(cls) -> "VectorStore":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ── Public API ──────────────────────────────────────────────────

    def add_texts(
        self,
        texts: list[str],
        doc_id: str,
        user_id: str,
        filename: str,
    ) -> int:
        """Embed *texts*, add them to the index, and persist to disk.

        Returns the number of vectors added.
        """
        if not texts:
            return 0

        embeddings = self._embed(texts)
        start_idx = len(self.metadata)

        for i, txt in enumerate(texts):
            self.metadata.append(
                ChunkMetadata(
                    doc_id=doc_id,
                    user_id=user_id,
                    filename=filename,
                    chunk_index=start_idx + i,
                    text=txt,
                )
            )

        self.index.add(embeddings)
        if settings.persist_data:
            self._save()
        logger.info("Added %d chunks for doc '%s'.", len(texts), doc_id)
        return len(texts)

    def clear(self) -> None:
        """Clear the vector index and metadata."""
        import faiss
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = []
        if settings.persist_data:
            self._save()
        logger.info("Vector store cleared.")

    def search(
        self,
        query: str,
        top_k: int | None = None,
        doc_id: str | None = None,
        user_id: str | None = None,
    ) -> list[tuple[ChunkMetadata, float]]:
        """Return the *top_k* most similar chunks to *query*."""
        if self.index.ntotal == 0:
            return []

        # If filtering by doc_id, we might need to search more neighbors 
        # because faiss InnerProduct search doesn't support native filtering.
        target_k = top_k or settings.top_k_results
        search_k = target_k
        if doc_id or user_id:
            search_k = min(self.index.ntotal, max(search_k * 5, 100))

        query_vec = self._embed([query])
        scores, indices = self.index.search(query_vec, search_k)

        results: list[tuple[ChunkMetadata, float]] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0:
                continue
            meta = self.metadata[idx]
            if doc_id and meta.doc_id != doc_id:
                continue
            if user_id and meta.user_id != user_id:
                continue
            
            results.append((meta, float(score)))
            if len(results) >= target_k:
                break
        return results

    def search_by_vector(
        self,
        vector: np.ndarray,
        top_k: int | None = None,
    ) -> list[tuple[ChunkMetadata, float]]:
        """Search by a pre-computed embedding vector."""
        if self.index.ntotal == 0:
            return []

        k = min(top_k or settings.top_k_results, self.index.ntotal)
        if vector.ndim == 1:
            vector = vector.reshape(1, -1)
        scores, indices = self.index.search(vector, k)

        results: list[tuple[ChunkMetadata, float]] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0:
                continue
            results.append((self.metadata[idx], float(score)))
        return results

    def embed_texts(self, texts: list[str]) -> np.ndarray:
        """Expose embedding for external callers (e.g. plagiarism)."""
        return self._embed(texts)

    @property
    def total_vectors(self) -> int:
        return self.index.ntotal

    # ── Persistence ─────────────────────────────────────────────────
    
    def _save(self) -> None:
        import faiss
        idx_path = settings.vector_store_dir / "index.faiss"
        meta_path = settings.vector_store_dir / "metadata.json"
        
        # Ensure directory exists
        settings.vector_store_dir.mkdir(parents=True, exist_ok=True)
        
        faiss.write_index(self.index, str(idx_path))
        with open(meta_path, "w", encoding="utf-8") as fh:
            json.dump(
                [m.__dict__ for m in self.metadata],
                fh,
                ensure_ascii=False,
            )
        logger.debug("Vector store saved (%d vectors).", self.index.ntotal)

    def _load(self) -> None:
        import faiss
        idx_path = settings.vector_store_dir / "index.faiss"
        meta_path = settings.vector_store_dir / "metadata.json"
        if idx_path.exists() and meta_path.exists():
            self.index = faiss.read_index(str(idx_path))
            with open(meta_path, "r", encoding="utf-8") as fh:
                raw = json.load(fh)
            self.metadata = [ChunkMetadata(**item) for item in raw]
            logger.info(
                "Loaded vector store with %d vectors.", self.index.ntotal
            )

    # ── Internal ────────────────────────────────────────────────────

    def _embed(self, texts: list[str]) -> np.ndarray:
        """Fetch embeddings from Hugging Face Inference API."""
        import requests
        import time

        api_url = f"https://router.huggingface.co/hf-inference/models/{self.model_id}"
        # No API key required for small public usage of this model, 
        # but you can add one in headers if needed.
        headers = {} 

        def query_hf(payload):
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            return response.json()

        # Hugging Face Inference API can take a list of strings
        try:
            output = query_hf({"inputs": texts, "options": {"wait_for_model": True}})
            if isinstance(output, dict) and "error" in output:
                raise ValueError(f"Hugging Face API error: {output['error']}")
            
            embeddings = np.array(output, dtype=np.float32)
            return embeddings
        except Exception as e:
            logger.error("Embedding failed via HF API: %s", e)
            # Fallback to zero vectors if API fails (better than crashing)
            return np.zeros((len(texts), self.dimension), dtype=np.float32)
