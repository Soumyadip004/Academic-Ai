"""
AI Academic Assistant — Streamlit Frontend
==========================================
Sidebar navigation between five feature pages, all calling the FastAPI backend.
"""

from __future__ import annotations

import requests
import streamlit as st

# ── Configuration ───────────────────────────────────────────────────────────
API_BASE = "http://localhost:8000"

st.set_page_config(
    page_title="AI Academic Assistant",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ──────────────────────────────────────────────────────────────
st.markdown("""
<style>
    /* Global font & background */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

    /* Sidebar styling */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }
    section[data-testid="stSidebar"] .stRadio label {
        color: #e0e0e0 !important;
        font-weight: 500;
    }
    section[data-testid="stSidebar"] h1, section[data-testid="stSidebar"] h2,
    section[data-testid="stSidebar"] h3, section[data-testid="stSidebar"] p,
    section[data-testid="stSidebar"] span, section[data-testid="stSidebar"] label {
        color: #e0e0e0 !important;
    }

    /* Card-like containers */
    div.stExpander { border: 1px solid #e0e7ff; border-radius: 12px; }

    /* Chat messages */
    .chat-user {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white; padding: 12px 18px; border-radius: 18px 18px 4px 18px;
        margin: 6px 0; max-width: 80%; margin-left: auto; text-align: right;
    }
    .chat-assistant {
        background: #f0f2f6; color: #1a1a2e;
        padding: 12px 18px; border-radius: 18px 18px 18px 4px;
        margin: 6px 0; max-width: 80%;
    }

    /* Source citation cards */
    .source-card {
        background: #f8fafc; border-left: 4px solid #667eea;
        padding: 10px 14px; margin: 8px 0; border-radius: 0 8px 8px 0;
        font-size: 0.88em;
    }

    /* Plagiarism bar */
    .plag-bar { height: 24px; border-radius: 12px; margin: 10px 0; }

    /* Error highlight */
    .spell-error {
        background: #fee2e2; padding: 2px 6px; border-radius: 4px;
        border-bottom: 2px wavy #ef4444; font-weight: 500;
    }

    /* Hero header */
    .hero {
        background: linear-gradient(135deg, #667eea, #764ba2);
        padding: 30px; border-radius: 16px; color: white;
        text-align: center; margin-bottom: 24px;
    }
    .hero h1 { margin: 0; font-size: 2em; }
    .hero p { margin: 6px 0 0; opacity: 0.9; font-size: 1.1em; }
</style>
""", unsafe_allow_html=True)


# ── Sidebar ─────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🎓 Academic Assistant")
    st.markdown("---")
    page = st.radio(
        "Navigate",
        [
            "📄  Document Upload",
            "💬  Chat with Documents",
            "🤖  AI Chat",
            "✏️  Spell & Grammar",
            "🔍  Plagiarism Check",
        ],
        label_visibility="collapsed",
    )
    st.markdown("---")
    st.caption("Powered by FAISS • SentenceTransformers • LLM")


# ── Helpers ─────────────────────────────────────────────────────────────────

def api(method: str, path: str, **kwargs):
    """Make a request to the FastAPI backend and handle errors."""
    try:
        resp = getattr(requests, method)(f"{API_BASE}{path}", timeout=120, **kwargs)
        resp.raise_for_status()
        return resp.json()
    except requests.ConnectionError:
        st.error("⚠️ Cannot reach the backend. Make sure it is running on http://localhost:8000")
        return None
    except requests.HTTPError as exc:
        detail = ""
        try:
            detail = exc.response.json().get("detail", str(exc))
        except Exception:
            detail = str(exc)
        st.error(f"API error: {detail}")
        return None
    except Exception as exc:
        st.error(f"Unexpected error: {exc}")
        return None


# ═════════════════════════════════════════════════════════════════════════════
# PAGE 1 — Document Upload
# ═════════════════════════════════════════════════════════════════════════════
if page.startswith("📄"):
    st.markdown(
        '<div class="hero"><h1>📄 Document Upload</h1>'
        '<p>Upload PDF, DOCX, or TXT files to build your knowledge base</p></div>',
        unsafe_allow_html=True,
    )

    uploaded = st.file_uploader(
        "Choose a document",
        type=["pdf", "docx", "txt"],
        accept_multiple_files=True,
        help="Max 20 MB per file",
    )

    if uploaded:
        for f in uploaded:
            with st.spinner(f"Processing **{f.name}** …"):
                files = {"file": (f.name, f.getvalue(), f.type)}
                result = api("post", "/api/documents/upload", files=files)
            if result:
                st.success(f"✅ **{result['filename']}** — {result['num_chunks']} chunks indexed")
                with st.expander("Preview extracted text"):
                    st.text(result["text_preview"] + " …")

    st.markdown("### 📚 Uploaded Documents")
    docs = api("get", "/api/documents/")
    if docs:
        if len(docs) == 0:
            st.info("No documents uploaded yet.")
        for doc in docs:
            col1, col2 = st.columns([3, 1])
            col1.markdown(f"**{doc['filename']}** (`{doc['doc_id']}`)")
            col2.metric("Chunks", doc["num_chunks"])
    elif docs is not None:
        st.info("No documents uploaded yet.")


# ═════════════════════════════════════════════════════════════════════════════
# PAGE 2 — RAG Chat with Documents
# ═════════════════════════════════════════════════════════════════════════════
elif page.startswith("💬"):
    st.markdown(
        '<div class="hero"><h1>💬 Chat with Documents</h1>'
        '<p>Ask questions about your uploaded documents — answers include citations</p></div>',
        unsafe_allow_html=True,
    )

    # Session ID for memory
    if "rag_session" not in st.session_state:
        st.session_state.rag_session = "streamlit_rag"
    if "rag_history" not in st.session_state:
        st.session_state.rag_history = []

    # Display chat history
    for msg in st.session_state.rag_history:
        if msg["role"] == "user":
            st.markdown(f'<div class="chat-user">{msg["content"]}</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="chat-assistant">{msg["content"]}</div>', unsafe_allow_html=True)
            if msg.get("sources"):
                with st.expander(f"📎 {len(msg['sources'])} source(s) cited"):
                    for s in msg["sources"]:
                        st.markdown(
                            f'<div class="source-card">'
                            f'<strong>{s["filename"]}</strong> · chunk {s["chunk_index"]} '
                            f'· similarity {s["similarity_score"]:.2%}<br/>'
                            f'<em>{s["text"][:200]}…</em></div>',
                            unsafe_allow_html=True,
                        )

    question = st.chat_input("Ask a question about your documents …")
    if question:
        st.session_state.rag_history.append({"role": "user", "content": question})
        st.markdown(f'<div class="chat-user">{question}</div>', unsafe_allow_html=True)

        with st.spinner("Searching documents & generating answer …"):
            result = api("post", "/api/rag/chat", json={
                "question": question,
                "session_id": st.session_state.rag_session,
            })

        if result:
            answer = result["answer"]
            sources = result.get("sources", [])
            st.session_state.rag_history.append({
                "role": "assistant", "content": answer, "sources": sources,
            })
            st.markdown(f'<div class="chat-assistant">{answer}</div>', unsafe_allow_html=True)
            if sources:
                with st.expander(f"📎 {len(sources)} source(s) cited"):
                    for s in sources:
                        st.markdown(
                            f'<div class="source-card">'
                            f'<strong>{s["filename"]}</strong> · chunk {s["chunk_index"]} '
                            f'· similarity {s["similarity_score"]:.2%}<br/>'
                            f'<em>{s["text"][:200]}…</em></div>',
                            unsafe_allow_html=True,
                        )

    if st.button("🗑️ Clear conversation", key="clear_rag"):
        st.session_state.rag_history = []
        st.rerun()


# ═════════════════════════════════════════════════════════════════════════════
# PAGE 3 — AI Chat
# ═════════════════════════════════════════════════════════════════════════════
elif page.startswith("🤖"):
    st.markdown(
        '<div class="hero"><h1>🤖 AI Chat Assistant</h1>'
        '<p>General-purpose assistant for writing, brainstorming, and Q&A</p></div>',
        unsafe_allow_html=True,
    )

    if "chat_session" not in st.session_state:
        st.session_state.chat_session = "streamlit_chat"
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    for msg in st.session_state.chat_history:
        cls = "chat-user" if msg["role"] == "user" else "chat-assistant"
        st.markdown(f'<div class="{cls}">{msg["content"]}</div>', unsafe_allow_html=True)

    message = st.chat_input("Type your message …")
    if message:
        st.session_state.chat_history.append({"role": "user", "content": message})
        st.markdown(f'<div class="chat-user">{message}</div>', unsafe_allow_html=True)

        with st.spinner("Thinking …"):
            result = api("post", "/api/chat", json={
                "message": message,
                "session_id": st.session_state.chat_session,
            })

        if result:
            reply = result["reply"]
            st.session_state.chat_history.append({"role": "assistant", "content": reply})
            st.markdown(f'<div class="chat-assistant">{reply}</div>', unsafe_allow_html=True)

    if st.button("🗑️ Clear conversation", key="clear_chat"):
        st.session_state.chat_history = []
        st.rerun()


# ═════════════════════════════════════════════════════════════════════════════
# PAGE 4 — Spell & Grammar Check
# ═════════════════════════════════════════════════════════════════════════════
elif page.startswith("✏️"):
    st.markdown(
        '<div class="hero"><h1>✏️ Spell & Grammar Checker</h1>'
        '<p>Paste your text below to find and fix errors</p></div>',
        unsafe_allow_html=True,
    )

    text = st.text_area(
        "Enter text to check",
        height=200,
        placeholder="Paste or type your text here …",
    )

    if st.button("🔍 Check Text", type="primary") and text.strip():
        with st.spinner("Analysing text …"):
            result = api("post", "/api/spellcheck/check", json={"text": text})

        if result:
            err_count = result["error_count"]

            if err_count == 0:
                st.success("✅ No errors found — your text looks great!")
            else:
                st.warning(f"Found **{err_count}** issue(s)")

                # Corrected text
                st.markdown("### ✅ Corrected Text")
                st.text_area("Corrected", value=result["corrected_text"], height=150, key="corrected")

                # Individual errors
                st.markdown("### 🐛 Errors Found")
                for i, err in enumerate(result["errors"], 1):
                    with st.expander(f"Issue {i}: {err['message']}"):
                        st.markdown(f"**Rule:** `{err['rule_id']}`")
                        st.markdown(f"**Position:** offset {err['offset']}, length {err['length']}")
                        if err["context"]:
                            st.markdown(f"**Context:** …{err['context']}…")
                        if err["replacements"]:
                            st.markdown("**Suggestions:** " + " · ".join(
                                f"`{r}`" for r in err["replacements"]
                            ))


# ═════════════════════════════════════════════════════════════════════════════
# PAGE 5 — Plagiarism Check
# ═════════════════════════════════════════════════════════════════════════════
elif page.startswith("🔍"):
    st.markdown(
        '<div class="hero"><h1>🔍 Plagiarism Detector</h1>'
        '<p>Compare text against your document database</p></div>',
        unsafe_allow_html=True,
    )

    st.info("💡 Upload documents first — plagiarism is checked against the indexed document database.")

    text = st.text_area(
        "Enter text to check for plagiarism",
        height=200,
        placeholder="Paste the text you want to verify …",
    )

    if st.button("🔬 Run Plagiarism Check", type="primary") and text.strip():
        with st.spinner("Comparing against document database …"):
            result = api("post", "/api/plagiarism/check", json={"text": text})

        if result:
            similarity = result["overall_similarity"]
            flagged = result["flagged_sections"]
            total = result["total_chunks_checked"]

            # Colour-coded overall score
            if similarity < 20:
                colour, label = "#22c55e", "Low"
            elif similarity < 50:
                colour, label = "#f59e0b", "Moderate"
            else:
                colour, label = "#ef4444", "High"

            st.markdown(f"### Overall Similarity: **{similarity:.1f}%** — {label}")
            st.markdown(
                f'<div class="plag-bar" style="background: linear-gradient(90deg, '
                f'{colour} {similarity}%, #e5e7eb {similarity}%)"></div>',
                unsafe_allow_html=True,
            )
            st.caption(f"{total} chunk(s) analysed · {len(flagged)} flagged section(s)")

            if flagged:
                st.markdown("### 🚩 Flagged Sections")
                for i, sec in enumerate(flagged, 1):
                    with st.expander(
                        f"Section {i} — **{sec['similarity']:.1f}%** match with *{sec['source_doc']}*"
                    ):
                        col1, col2 = st.columns(2)
                        with col1:
                            st.markdown("**Your text:**")
                            st.text(sec["input_chunk_text"])
                        with col2:
                            st.markdown("**Matching source:**")
                            st.text(sec["source_chunk_text"])
            elif similarity == 0:
                st.success("✅ No matching content found in the document database.")
            else:
                st.success("✅ Some similarity detected but no individual sections exceed the flagging threshold.")
