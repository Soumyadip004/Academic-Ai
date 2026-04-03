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

import numpy as np
import chromadb
from chromadb.config import Settings as ChromaSettings
from huggingface_hub import InferenceClient

from backend.config import settings
from backend.models.schemas import ChunkMetadata

logger = logging.getLogger(__name__)

BATCH_SIZE = 32  # max texts per API call

class HuggingFaceEmbeddingFunction:
    """Lightweight embedding function using official HuggingFace InferenceClient.
    
    Uses ~0 MB of local RAM for weights. Robust against endpoint migrations.
    """

    def __init__(self, model_name: str, api_key: str | None = None):
        self.model_name = model_name
        self.client = InferenceClient(api_key=api_key)
        
        # Dimension lookup
        if "large" in model_name: self._dim = 1024
        elif "base" in model_name: self._dim = 768
        else: self._dim = 384
        
        logger.info("HF InferenceClient ready for model: %s (dim=%d)", model_name, self._dim)

    # ── ChromaDB interface methods ─────────────────────────────────
    def name(self) -> str:
        return "huggingface_client"

    @staticmethod
    def build(config: dict) -> "HuggingFaceEmbeddingFunction":
        return HuggingFaceEmbeddingFunction(
            model_name=config.get("model_name", "BAAI/bge-large-en"),
            api_key=config.get("api_key"),
        )

    def get_config(self) -> dict:
        return {"model_name": self.model_name}

    def __call__(self, input: list[str]) -> list[list[float]]:
        return self._embed_texts(input)

    def embed_documents(self, documents: list[str]) -> list[list[float]]:
        return self._embed_texts(documents)

    def embed_query(self, input: str) -> list[float]:
        # BGE models work better with instruction prefix for queries
        if "bge" in self.model_name.lower():
            query_text = f"Represent this sentence for searching relevant passages: {input}"
        else:
            query_text = input
            
        result = self._embed_texts([query_text])
        return result[0]

    # ── Core embedding logic ───────────────────────────────────────
    def _embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Embed a list of texts using the InferenceClient."""
        all_embeddings = []
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i : i + BATCH_SIZE]
            try:
                # raw can be [batch x dim] or [batch x seq x dim] (as list of lists)
                raw = self.client.feature_extraction(batch, model=self.model_name)
                
                batch_vectors = []
                for entry in raw:
                    entry_arr = np.array(entry)
                    if entry_arr.ndim == 2:
                        # [seq x dim] -> pool to [dim]
                        batch_vectors.append(np.mean(entry_arr, axis=0).tolist())
                    else:
                        # Already [dim]
                        batch_vectors.append(entry_arr.tolist())
                
                all_embeddings.extend(batch_vectors)
                
            except Exception as e:
                logger.error("HF Inference error: %s", e)
                # Fallback to zero vectors
                all_embeddings.extend([[0.0] * self._dim] * len(batch))
                
        return all_embeddings


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
        # Set dimension based on model (bge-large = 1024, MiniLM = 384)
        if "bge-large" in model_name:
            self.dimension = 1024
        elif "bge-base" in model_name:
            self.dimension = 768
        else:
            self.dimension = 384

        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=self.persist_directory,
            settings=ChromaSettings(allow_reset=True)
        )

        # No embedding function passed — we handle embeddings ourselves
        self.collection = self.client.get_or_create_collection(
            name="academic_ai",
            metadata={"hnsw:space": "cosine"}
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

        # Compute embeddings ourselves via HF API
        embeddings = self._embedding_fn(texts)

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

        # Pass pre-computed embeddings directly
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
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
            metadata={"hnsw:space": "cosine"}
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

        # Compute query embedding ourselves
        query_embedding = self._embedding_fn([ query ])

        results = self.collection.query(
            query_embeddings=query_embedding,
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
