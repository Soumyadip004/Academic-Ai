"""RAG-based document chat endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Header

from backend.models.schemas import RAGChatRequest, RAGChatResponse
from backend.services import rag_service

router = APIRouter(prefix="/api/rag", tags=["RAG Chat"])


@router.post("/chat", response_model=RAGChatResponse)
async def rag_chat(req: RAGChatRequest, x_user_id: str | None = Header(None, alias="X-User-Id")):
    """Ask a question and receive an answer with cited document sources."""
    return rag_service.query(
        question=req.question,
        user_id=x_user_id,
        session_id=req.session_id,
        top_k=req.top_k,
        doc_id=req.doc_id,
    )
