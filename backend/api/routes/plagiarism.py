"""Plagiarism detection endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from backend.models.schemas import PlagiarismRequest, PlagiarismReport
from backend.services import plagiarism_service

router = APIRouter(prefix="/api/plagiarism", tags=["Plagiarism"])


@router.post("/check", response_model=PlagiarismReport)
async def check_plagiarism(req: PlagiarismRequest):
    """Compare the submitted text against all indexed documents."""
    return plagiarism_service.check_plagiarism(req.text)
