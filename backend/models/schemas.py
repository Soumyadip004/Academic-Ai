"""Pydantic request / response models for every API endpoint."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ChunkMetadata(BaseModel):
    """Metadata for each embedded chunk."""
    doc_id: str
    user_id: str
    filename: str
    chunk_index: int
    text: str


# ── Document ────────────────────────────────────────────────────────────────

class DocumentInfo(BaseModel):
    """Metadata returned after uploading a document."""
    doc_id: str
    user_id: str | None = None
    filename: str
    file_path: str
    file_url: str | None = None
    num_chunks: int
    text_preview: str = Field(
        ..., description="First 300 characters of extracted text"
    )


# ── RAG Chat ────────────────────────────────────────────────────────────────

class RAGChatRequest(BaseModel):
    question: str
    session_id: str = "default"
    top_k: int = 5
    doc_id: str | None = None


class SourceChunk(BaseModel):
    """One retrieved chunk shown as a citation."""
    doc_id: str
    filename: str
    chunk_index: int
    text: str
    similarity_score: float


class RAGChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk] = []


# ── General Chat ────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"


class ChatResponse(BaseModel):
    reply: str
    session_id: str


# ── Plagiarism ──────────────────────────────────────────────────────────────

class PlagiarismMatch(BaseModel):
    """A single chunk that was found to be similar."""
    source_doc: str
    source_chunk_text: str
    input_chunk_text: str
    similarity: float


class PlagiarismReport(BaseModel):
    overall_similarity: float = Field(
        ..., description="Plagiarism percentage (0–100)"
    )
    flagged_sections: list[PlagiarismMatch] = []
    total_chunks_checked: int = 0


class PlagiarismRequest(BaseModel):
    text: str


# ── Spell Check ─────────────────────────────────────────────────────────────

class SpellError(BaseModel):
    message: str
    offset: int
    length: int
    replacements: list[str] = []
    context: str = ""
    rule_id: str = ""


class SpellCheckRequest(BaseModel):
    text: str
    language: str = "en-US"


class SpellCheckResponse(BaseModel):
    original_text: str
    corrected_text: str
    errors: list[SpellError] = []
    error_count: int = 0
