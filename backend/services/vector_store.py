"""ChromaDB vector store wrapper with external embeddings."""

from __future__ import annotations

import logging
import uuid
from pathlib import Path
from typing import Any

import numpy as np
import chromadb
from sentence_transformers import SentenceTransformer
from chromadb.config import Settings as ChromaSettings

from backend.config import settings
from backend.models.schemas import ChunkMetadata

logger = logging.getLogger(__name__)


class VectorStore:
    """Wrapper around ChromaDB for vector search and metadata management."""

    _instance: "VectorStore | None" = None

    def __init__(self) -> None:
        """Initialize ChromaDB and local embedding model."""
        self.persist_directory = str(settings.vector_store_dir)
        
        # Ensure directory exists
        Path(self.persist_directory).mkdir(parents=True, exist_ok=True)

        # Initialize client (uses SQLite for persistence)
        self.client = chromadb.PersistentClient(
            path=self.persist_directory,
            settings=ChromaSettings(allow_reset=True)
        )
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="academic_ai",
            metadata={"hnsw:space": "cosine"}
        )
        
        self.model_id = settings.embedding_model
        logger.info("Loading local embedding model: %s...", self.model_id)
        
        # Load model locally
        try:
            self.model = SentenceTransformer(self.model_id)
            self.dimension = self.model.get_sentence_embedding_dimension()
        except Exception as e:
            logger.error("Failed to load local model: %s. Using default.", e)
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self.dimension = 384
            
        logger.info(
            "ChromaDB initialized. Local Engine: %s, Dim: %d", 
            self.model_id, self.dimension
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
        """Embed *texts*, add them to Chroma with metadata.

        Returns the number of vectors added.
        """
        if not texts:
            return 0

        embeddings = self._embed(texts).tolist()  # Chroma expects list of floats
        
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
        """Return the *top_k* most similar chunks using Chroma metadata filtering."""
        if self.collection.count() == 0:
            return []

        target_k = top_k or settings.top_k_results
        query_vec = self._embed([query]).tolist()

        # Build filter
        where_filter = {}
        if doc_id and user_id:
            where_filter = {"$and": [{"doc_id": doc_id}, {"user_id": user_id}]}
        elif doc_id:
            where_filter = {"doc_id": doc_id}
        elif user_id:
            where_filter = {"user_id": user_id}

        results = self.collection.query(
            query_embeddings=query_vec,
            n_results=target_k,
            where=where_filter,
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
        """Expose embedding for external callers."""
        return self._embed(texts)

    @property
    def total_vectors(self) -> int:
        return self.collection.count()

    # ── Internal ────────────────────────────────────────────────────

    def _embed(self, texts: list[str]) -> np.ndarray:
        """Fetch embeddings locally using sentence-transformers."""
        try:
            # Local inference is fast and handled by the library
            embeddings = self.model.encode(
                texts, 
                convert_to_numpy=True, 
                normalize_embeddings=True, # Critical for cosine similarity
                show_progress_bar=False
            )
            return embeddings.astype(np.float32)

        except Exception as e:
            logger.error("Local embedding failed: %s", e)
            return np.zeros((len(texts), self.dimension), dtype=np.float32)
