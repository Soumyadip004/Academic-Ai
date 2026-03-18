"""Spell & grammar check endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from backend.models.schemas import SpellCheckRequest, SpellCheckResponse
from backend.services import spellcheck_service

router = APIRouter(prefix="/api/spellcheck", tags=["Spell Check"])


@router.post("/check", response_model=SpellCheckResponse)
async def spell_check(req: SpellCheckRequest):
    """Check text for spelling and grammar errors."""
    return spellcheck_service.check_text(req.text, language=req.language)
