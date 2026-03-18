"""Authentication and account management endpoints."""

from __future__ import annotations

import logging
from fastapi import APIRouter, Header, HTTPException

from backend.services import document_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.delete("/delete-account")
async def delete_account(x_user_id: str | None = Header(None, alias="X-User-Id")):
    """Permanently delete all data associated with the user account."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id header is required.")
    
    deleted_count = document_service.delete_user_data(x_user_id)
    
    logger.info("Deleted account data for user %s (%d documents removed).", x_user_id, deleted_count)
    return {
        "status": "success",
        "message": f"Account data for {x_user_id} has been deleted.",
        "documents_removed": deleted_count
    }
