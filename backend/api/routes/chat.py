"""General-purpose AI chat endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from backend.models.schemas import ChatRequest, ChatResponse
from backend.services import chat_service

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
async def ai_chat(req: ChatRequest):
    """Send a message to the general-purpose AI assistant."""
    reply = chat_service.chat(req.message, session_id=req.session_id)
    return ChatResponse(reply=reply, session_id=req.session_id)
