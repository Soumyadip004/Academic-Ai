"""Document upload & management endpoints."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, UploadFile, File, Header

from backend.models.schemas import DocumentInfo
from backend.services import document_service
from backend.services.rag_service import index_document

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@router.post("/upload", response_model=DocumentInfo)
async def upload_document(
    file: UploadFile = File(...),
    x_user_id: str | None = Header(None, alias="X-User-Id")
):
    """Upload a document, extract text, and index it in the vector store."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id header is required.")

    # Validate extension
    filename = file.filename or "unknown.txt"
    suffix = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    # Read content
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 20 MB limit.")

    # Save & extract
    doc_id, filepath = document_service.save_upload(filename, content, user_id=x_user_id)
    try:
        text = document_service.extract_text(filepath)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Text extraction failed: {exc}")

    if not text.strip():
        raise HTTPException(status_code=422, detail="No text could be extracted from the file.")

    # Index in vector store
    num_chunks = index_document(doc_id, x_user_id, filename, text)

    info = DocumentInfo(
        doc_id=doc_id,
        user_id=x_user_id,
        filename=filename,
        file_path=str(filepath),
        file_url=f"/api/files/{filepath.name}",
        num_chunks=num_chunks,
        text_preview=text[:300],
    )
    document_service.add_document_info(info)

    logger.info("User %s uploaded '%s' → %d chunks indexed.", x_user_id, filename, num_chunks)
    return info


@router.get("/", response_model=list[DocumentInfo])
async def list_documents(x_user_id: str | None = Header(None, alias="X-User-Id")):
    """Return metadata for all uploaded documents belonging to the user."""
    if not x_user_id:
        return []
    return document_service.get_user_documents(x_user_id)


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, x_user_id: str | None = Header(None, alias="X-User-Id")):
    """Delete a specific document."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id header is required.")
    
    success = document_service.delete_document(doc_id, x_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or unauthorized.")
    
    return {"status": "success", "message": f"Document {doc_id} deleted."}
