"""ChromaDB vector store wrapper with HuggingFace API embeddings."""

from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from typing import Any

import numpy as np
import requests
import chromadb
from chromadb.config import Settings as ChromaSettings

from backend.config import settings
from backend.models.schemas import ChunkMetadata

logger = logging.getLogger(__name__)

# ── HuggingFace Inference API (new router endpoint) ────────────────────
HF_API_URL = "https://router.huggingface.co/models/{model}"
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds
BATCH_SIZE = 32  # max texts per API call


class HuggingFaceEmbeddingFunction:
    """Lightweight embedding function using HuggingFace Inference API.
    
    No model download required — embeddings are computed via HTTP calls.
    Uses ~0 MB of RAM for model weights.
    """

    def __init__(self, model_name: str, api_key: str | None = None):
        self.model_name = model_name
        self.api_key = api_key
        self.api_url = HF_API_URL.format(model=model_name)
        self._headers = {}
        if api_key:
            self._headers["Authorization"] = f"Bearer {api_key}"
        logger.info("HF Embedding API initialized: %s", self.api_url)

    def __call__(self, input: list[str]) -> list[list[float]]:
        """Embed a list of texts via the HuggingFace API."""
        all_embeddings = []

        # Process in batches to avoid payload limits
        for i in range(0, len(input), BATCH_SIZE):
            batch = input[i : i + BATCH_SIZE]
            embeddings = self._embed_batch(batch)
            all_embeddings.extend(embeddings)

        return all_embeddings

    def _embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Embed a single batch with retry logic."""
        payload = {
            "inputs": texts,
            "options": {"wait_for_model": True}
        }

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = requests.post(
                    self.api_url,
                    headers=self._headers,
                    json=payload,
                    timeout=60
                )

                if resp.status_code == 503:
                    # Model is loading on HF side, wait and retry
                    wait = RETRY_DELAY * attempt
                    logger.warning("HF model loading, retrying in %ds...", wait)
                    time.sleep(wait)
                    continue

                resp.raise_for_status()
                result = resp.json()

                # HF returns list[list[float]] for sentence-transformers
                if isinstance(result, list) and len(result) > 0:
                    if isinstance(result[0], list):
                        return result
                    # Single text returns flat list
                    return [result]

                logger.error("Unexpected HF response format: %s", type(result))
                return [[0.0] * 384] * len(texts)

            except requests.exceptions.RequestException as e:
                logger.error("HF API attempt %d failed: %s", attempt, e)
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY * attempt)

        logger.critical("ALL HF EMBEDDING ATTEMPTS FAILED. Returning zero vectors.")
        return [[0.0] * 384] * len(texts)


class VectorStore:
    """Wrapper around ChromaDB with HuggingFace API embeddings.
    
    Zero local model download — all embeddings via HF Inference API.
    Ideal for Render free tier (512MB RAM limit).
    """

    _instance: "VectorStore | None" = None

    def __init__(self) -> None:
        """Initialize ChromaDB with HuggingFace API embedding function."""
        self.persist_directory = str(settings.vector_store_dir)

        # Ensure directory exists
        Path(self.persist_directory).mkdir(parents=True, exist_ok=True)

        # Use HuggingFace API for embeddings (no local model)
        model_name = settings.embedding_model
        hf_token = settings.hf_token or ""
        self._embedding_fn = HuggingFaceEmbeddingFunction(
            model_name=model_name,
            api_key=hf_token
        )
        self.dimension = 384  # all-MiniLM-L6-v2

        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=self.persist_directory,
            settings=ChromaSettings(allow_reset=True)
        )

        # Get or create collection WITH the HF embedding function
        self.collection = self.client.get_or_create_collection(
            name="academic_ai",
            metadata={"hnsw:space": "cosine"},
            embedding_function=self._embedding_fn
        )

        logger.info(
            "ChromaDB initialized with HuggingFace API embeddings (%s).",
            model_name
        )

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
        """Add texts to Chroma. Embeddings generated via HF API.

        Returns the number of vectors added.
        """
        if not texts:
            return 0

        # Create unique IDs for each chunk
        ids = [f"{doc_id}_{i}" for i in range(len(texts))]

        # Metadata for filtering
        metadatas = [
            {
                "doc_id": doc_id,
                "user_id": user_id,
                "filename": filename,
                "chunk_index": i
            }
            for i in range(len(texts))
        ]

        # ChromaDB calls self._embedding_fn(texts) internally
        self.collection.add(
            ids=ids,
            metadatas=metadatas,
            documents=texts
        )

        logger.info("Added %d chunks to Chroma for doc '%s'.", len(texts), doc_id)
        return len(texts)

    def clear(self) -> None:
        """Clear the entire collection."""
        self.client.delete_collection("academic_ai")
        self.collection = self.client.get_or_create_collection(
            name="academic_ai",
            metadata={"hnsw:space": "cosine"},
            embedding_function=self._embedding_fn
        )
        logger.info("ChromaDB collection cleared.")

    def search(
        self,
        query: str,
        top_k: int | None = None,
        doc_id: str | None = None,
        user_id: str | None = None,
    ) -> list[tuple[Any, float]]:
        """Return the *top_k* most similar chunks."""
        if self.collection.count() == 0:
            return []

        target_k = top_k or settings.top_k_results

        # Build filter
        where_filter = {}
        if doc_id and user_id:
            where_filter = {"$and": [{"doc_id": doc_id}, {"user_id": user_id}]}
        elif doc_id:
            where_filter = {"doc_id": doc_id}
        elif user_id:
            where_filter = {"user_id": user_id}

        # ChromaDB embeds the query via HF API automatically
        results = self.collection.query(
            query_texts=[query],
            n_results=target_k,
            where=where_filter if where_filter else None,
            include=["documents", "metadatas", "distances"]
        )

        final_results = []
        if not results["ids"] or not results["ids"][0]:
            return []

        for i in range(len(results["ids"][0])):
            meta_raw = results["metadatas"][0][i]
            text = results["documents"][0][i]
            dist = results["distances"][0][i]

            similarity = 1.0 - dist

            meta = ChunkMetadata(
                doc_id=meta_raw["doc_id"],
                user_id=meta_raw["user_id"],
                filename=meta_raw["filename"],
                chunk_index=meta_raw["chunk_index"],
                text=text
            )
            final_results.append((meta, float(similarity)))

        return final_results

    def search_by_vector(
        self,
        vector: np.ndarray,
        top_k: int | None = None,
    ) -> list[tuple[Any, float]]:
        """Search by a pre-computed embedding vector."""
        if self.collection.count() == 0:
            return []

        k = min(top_k or settings.top_k_results, self.collection.count())
        if vector.ndim == 1:
            vector = vector.reshape(1, -1)

        query_vec = vector.tolist()

        results = self.collection.query(
            query_embeddings=query_vec,
            n_results=k,
            include=["documents", "metadatas", "distances"]
        )

        final_results = []
        if not results["ids"] or not results["ids"][0]:
            return []

        for i in range(len(results["ids"][0])):
            meta_raw = results["metadatas"][0][i]
            text = results["documents"][0][i]
            dist = results["distances"][0][i]
            similarity = 1.0 - dist

            meta = ChunkMetadata(
                doc_id=meta_raw["doc_id"],
                user_id=meta_raw["user_id"],
                filename=meta_raw["filename"],
                chunk_index=meta_raw["chunk_index"],
                text=text
            )
            final_results.append((meta, float(similarity)))

        return final_results

    def embed_texts(self, texts: list[str]) -> np.ndarray:
        """Expose embedding for external callers (plagiarism, etc.)."""
        try:
            raw = self._embedding_fn(texts)
            return np.array(raw, dtype=np.float32)
        except Exception as e:
            logger.error("Embedding failed: %s", e)
            return np.zeros((len(texts), self.dimension), dtype=np.float32)

    @property
    def total_vectors(self) -> int:
        return self.collection.count()
