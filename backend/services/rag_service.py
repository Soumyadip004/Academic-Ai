"""RAG pipeline — chunk, embed, retrieve, and generate answers with citations."""

from __future__ import annotations

import logging
from collections import defaultdict

from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.config import settings
from backend.models.schemas import RAGChatResponse, SourceChunk
from backend.services.vector_store import VectorStore
from backend.services.chat_service import get_llm_response

logger = logging.getLogger(__name__)

# ── Conversation memory ((user_id, session_id) → list of messages) ────────────
_rag_memory: dict[tuple[str, str], list[dict[str, str]]] = defaultdict(list)

MAX_HISTORY = 10  # Keep last N turns per session


# ── Public API ──────────────────────────────────────────────────────────────

def chunk_text(text: str) -> list[str]:
    """Split *text* into overlapping chunks using LangChain splitter."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return splitter.split_text(text)


def index_document(doc_id: str, user_id: str, filename: str, text: str) -> int:
    """Chunk a document, embed the chunks, and store in the vector DB.

    Returns the number of chunks created.
    """
    chunks = chunk_text(text)
    if not chunks:
        return 0

    store = VectorStore.get()
    return store.add_texts(chunks, doc_id=doc_id, user_id=user_id, filename=filename)


def query(
    question: str,
    user_id: str | None = None,
    session_id: str = "default",
    top_k: int | None = None,
    doc_id: str | None = None,
) -> RAGChatResponse:
    """Retrieve relevant chunks and generate an LLM answer with citations."""
    store = VectorStore.get()

    if store.total_vectors == 0:
        return RAGChatResponse(
            answer="No documents have been uploaded yet. Please upload a document first.",
            sources=[],
        )

    # 1. Retrieve
    results = store.search(
        question, 
        top_k=top_k or settings.top_k_results,
        doc_id=doc_id,
        user_id=user_id
    )

    sources = [
        SourceChunk(
            doc_id=meta.doc_id,
            filename=meta.filename,
            chunk_index=meta.chunk_index,
            text=meta.text,
            similarity_score=round(score, 4),
        )
        for meta, score in results
    ]

    # 2. Build context block
    context_block = "\n\n".join(
        f"[Source {i+1} — {s.filename} (chunk {s.chunk_index})]:\n{s.text}"
        for i, s in enumerate(sources)
    )

    # 3. Build conversation history
    mem_key = (user_id or "anonymous", session_id)
    history = _rag_memory[mem_key][-MAX_HISTORY:]
    history_text = ""
    if history:
        history_text = "Previous conversation:\n" + "\n".join(
            f"{'User' if m['role'] == 'user' else 'Assistant'}: {m['content']}"
            for m in history
        ) + "\n\n"

    # 4. Compose prompt
    system_prompt = (
        "You are an academic research assistant. Answer the user's question "
        "based ONLY on the provided document excerpts. The excerpts are ranked by relevance; "
        "Source 1 is the most pertinent. Prioritize information from Source 1 when generating your answer. "
        "If the answer is not in the excerpts, say so clearly. Always cite which source(s) you "
        "used by referencing [Source N]. Be thorough and accurate."
    )

    user_prompt = (
        f"{history_text}"
        f"Document excerpts:\n{context_block}\n\n"
        f"Question: {question}"
    )

    # 5. Generate answer
    answer = get_llm_response(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    # 6. Update memory
    _rag_memory[mem_key].append({"role": "user", "content": question})
    _rag_memory[mem_key].append({"role": "assistant", "content": answer})

    # Trim memory
    if len(_rag_memory[mem_key]) > MAX_HISTORY * 2:
        _rag_memory[mem_key] = _rag_memory[mem_key][-(MAX_HISTORY * 2):]

    return RAGChatResponse(answer=answer, sources=sources)
