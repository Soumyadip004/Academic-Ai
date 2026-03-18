"""Plagiarism detection via embedding cosine similarity."""

from __future__ import annotations

import logging

from backend.config import settings
from backend.models.schemas import PlagiarismMatch, PlagiarismReport
from backend.services.rag_service import chunk_text
from backend.services.vector_store import VectorStore

logger = logging.getLogger(__name__)

# Chunks above this similarity threshold are flagged as potential plagiarism
SIMILARITY_THRESHOLD = 0.75


def check_plagiarism(text: str) -> PlagiarismReport:
    """Compare *text* against all indexed documents and return a report.

    Each chunk of the input text is embedded and compared to the stored
    vectors using cosine similarity (inner product on L2-normalised vecs).
    """
    store = VectorStore.get()

    if store.total_vectors == 0:
        return PlagiarismReport(
            overall_similarity=0.0,
            flagged_sections=[],
            total_chunks_checked=0,
        )

    # Chunk the input text with the same strategy used for indexing
    input_chunks = chunk_text(text)
    if not input_chunks:
        return PlagiarismReport(
            overall_similarity=0.0,
            flagged_sections=[],
            total_chunks_checked=0,
        )

    # Embed all input chunks
    input_embeddings = store.embed_texts(input_chunks)

    flagged: list[PlagiarismMatch] = []
    max_similarities: list[float] = []

    for i, (chunk, emb) in enumerate(zip(input_chunks, input_embeddings)):
        # Find the most similar stored chunk
        results = store.search_by_vector(emb, top_k=1)

        if not results:
            max_similarities.append(0.0)
            continue

        best_meta, best_score = results[0]
        max_similarities.append(max(best_score, 0.0))

        if best_score >= SIMILARITY_THRESHOLD:
            flagged.append(
                PlagiarismMatch(
                    source_doc=best_meta.filename,
                    source_chunk_text=best_meta.text,
                    input_chunk_text=chunk,
                    similarity=round(best_score * 100, 2),
                )
            )

    # Overall similarity = average of per-chunk max similarities
    overall = (
        sum(max_similarities) / len(max_similarities) * 100
        if max_similarities
        else 0.0
    )

    return PlagiarismReport(
        overall_similarity=round(overall, 2),
        flagged_sections=flagged,
        total_chunks_checked=len(input_chunks),
    )
