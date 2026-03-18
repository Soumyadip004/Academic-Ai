from __future__ import annotations
import logging
import uuid
from pathlib import Path

import PyPDF2
import docx

from backend.config import settings
from backend.models.schemas import DocumentInfo

logger = logging.getLogger(__name__)

# In-memory document registry (doc_id → DocumentInfo)
# In a real app, this would be a database table
_documents: dict[str, DocumentInfo] = {}


def save_upload(filename: str, content: bytes, user_id: str | None = None) -> tuple[str, Path]:
    """Save an uploaded file and return (doc_id, filepath)."""
    doc_id = uuid.uuid4().hex[:12]
    safe_name = f"{doc_id}_{filename}"
    filepath = settings.upload_dir / safe_name
    filepath.write_bytes(content)
    return doc_id, filepath


def extract_text(filepath: Path) -> str:
    """Extract plain text from a PDF, DOCX, or TXT file."""
    suffix = filepath.suffix.lower()

    if suffix == ".pdf":
        return _extract_pdf(filepath)
    elif suffix == ".docx":
        return _extract_docx(filepath)
    elif suffix == ".txt":
        return filepath.read_text(encoding="utf-8", errors="replace")
    else:
        raise ValueError(f"Unsupported file type: {suffix}")


# ── Private helpers ─────────────────────────────────────────────────────────

def _extract_pdf(filepath: Path) -> str:
    """Read every page of a PDF and concatenate the text."""
    text_parts: list[str] = []
    with open(filepath, "rb") as fh:
        reader = PyPDF2.PdfReader(fh)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def _extract_docx(filepath: Path) -> str:
    """Read every paragraph of a DOCX file."""
    doc = docx.Document(str(filepath))
    return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())


def delete_file(filepath: Path) -> None:
    """Delete a file from disk."""
    try:
        if filepath.exists():
            filepath.unlink()
    except Exception as exc:
        import logging
        logging.getLogger(__name__).warning("Failed to delete %s: %s", filepath, exc)


def add_document_info(info: DocumentInfo) -> None:
    """Add document metadata to the registry."""
    _documents[info.doc_id] = info


def get_user_documents(user_id: str | None) -> list[DocumentInfo]:
    """Return all documents belonging to a user."""
    if user_id:
        return [d for d in _documents.values() if d.user_id == user_id]
    return []


def delete_document(doc_id: str, user_id: str) -> bool:
    """Delete a single document and its associated file if the user owns it."""
    if doc_id not in _documents:
        return False
    
    doc = _documents[doc_id]
    if doc.user_id != user_id:
        return False
    
    # Remove from registry
    del _documents[doc_id]
    
    # Delete physical file
    file_path = Path(doc.file_path)
    if file_path.exists():
        try:
            file_path.unlink()
            logger.info("Deleted file %s for document %s", file_path, doc_id)
        except Exception as e:
            logger.error("Failed to delete file %s: %s", file_path, e)
            
    return True


def delete_user_data(user_id: str) -> int:
    """Delete all documents and files belonging to a user.
    
    Returns the number of documents deleted.
    """
    to_delete = [doc_id for doc_id, d in _documents.items() if d.user_id == user_id]
    count = 0
    for doc_id in to_delete:
        doc_info = _documents.pop(doc_id)
        file_path = Path(doc_info.file_path)
        if file_path.exists():
            try:
                file_path.unlink()
                logger.info("Deleted file %s for user %s", file_path, user_id)
            except Exception as e:
                logger.error("Failed to delete file %s: %s", file_path, e)
        count += 1
    return count
