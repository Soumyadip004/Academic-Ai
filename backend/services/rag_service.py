"""RAG pipeline — chunk, embed, retrieve, and generate answers with citations."""

from __future__ import annotations

import logging
from collections import defaultdict

from backend.config import settings
from backend.models.schemas import RAGChatResponse, SourceChunk
from backend.services.vector_store import VectorStore
from backend.services.chat_service import get_llm_response

logger = logging.getLogger(__name__)

# ── Conversation memory ((user_id, session_id) → list of messages) ────────────
_rag_memory: dict[tuple[str, str], list[dict[str, str]]] = defaultdict(list)

MAX_HISTORY = 10  # Keep last N turns per session

class SimpleRecursiveSplitter:
    """A zero-dependency text splitter that mimics LangChain's RecursiveCharacterTextSplitter.
    
    Prevents importing 'transformers' and 'torch' which consume ~200MB+ of RAM.
    """
    def __init__(self, chunk_size: int, chunk_overlap: int, separators: list[str] | None = None):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or ["\n\n", "\n", ". ", " ", ""]

    def split_text(self, text: str) -> list[str]:
        """Split text into chunks by recursively trying separators."""
        # Simple splitting logic: starting with most aggressive separators
        def _split(txt: str, seps: list[str]) -> list[str]:
            if len(txt) <= self.chunk_size:
                return [txt]
            
            if not seps:
                # If no more separators, just force cut
                offset = max(1, self.chunk_size - self.chunk_overlap)
                return [txt[i : i + self.chunk_size] for i in range(0, len(txt), offset)]
            
            sep = seps[0]
            parts = txt.split(sep)
            
            chunks = []
            current_chunk = ""
            
            for part in parts:
                join_sep = sep if current_chunk else ""
                if current_chunk and len(current_chunk) + len(sep) + len(part) > self.chunk_size:
                    chunks.append(current_chunk)
                    # Keep overlap
                    overlap_pos = max(0, len(current_chunk) - self.chunk_overlap)
                    # Use slicing correctly
                    current_chunk = current_chunk[overlap_pos:] + sep + part
                else:
                    current_chunk += join_sep + part
            
            if current_chunk:
                chunks.append(current_chunk)
                
            # If a chunk is still too big, recurse with next separator
            result = []
            for chunk in chunks:
                if len(chunk) > self.chunk_size:
                    result.extend(_split(chunk, seps[1:]))
                else:
                    result.append(chunk)
            return result

        return _split(text, self.separators)

def chunk_text(text: str) -> list[str]:
    """Split *text* into overlapping chunks using lightweight custom splitter."""
    splitter = SimpleRecursiveSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
    )
    return splitter.split_text(text)


def index_document(doc_id: str, user_id: str, filename: str, text: str) -> int:
    """Chunk a document, embed the chunks, and store in the vector DB."""
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
    max_chars = settings.max_input_tokens * 4
    current_chars = 0
    final_sources = []
    
    context_parts = []
    for i, s in enumerate(sources):
        part = f"[Source {i+1} — {s.filename}]:\n{s.text}"
        if current_chars + len(part) > max_chars:
            break
        context_parts.append(part)
        current_chars += len(part)
        final_sources.append(s)

    context_block = "\n\n".join(context_parts)
    sources = final_sources

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
        "You are a strict academic research assistant. "
        "Use the PROVIDED DOCUMENT EXCERPTS below to answer the user's question. \n\n"
        f"DOCUMENT EXCERPTS:\n{context_block}\n\n"
        "STRICT RULES:\n"
        "1. If the answer is in the excerpts, provide it and cite the source using [Source N].\n"
        "2. If the excerpts are totally irrelevant, say 'The document does not contain this information.'\n"
        "3. NEVR ignore excerpts to use general knowledge.\n"
        "4. Be concise."
    )

    user_prompt = f"{history_text}Question: {question}"

    # 5. Generate answer
    answer = get_llm_response(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
    )

    # 6. Update memory
    _rag_memory[mem_key].append({"role": "user", "content": question})
    _rag_memory[mem_key].append({"role": "assistant", "content": answer})

    return RAGChatResponse(answer=answer, sources=sources)
