# 🎓 AI Academic Assistant

A full-stack AI-powered academic tool featuring document chat (RAG), plagiarism detection, spell/grammar checking, and a general AI assistant.

## Features

- **📄 Document Upload** — Upload PDF, DOCX, TXT files with automatic text extraction
- **💬 RAG Chat** — Ask questions about your documents with cited sources
- **🔍 Plagiarism Detection** — Compare documents using embedding similarity
- **✏️ Spell & Grammar Check** — Highlight errors with suggested corrections
- **🤖 AI Assistant** — General-purpose chat with conversation memory

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + Uvicorn |
| Frontend | React + Vite |
| Vector DB | FAISS |
| Embeddings | SentenceTransformers (`all-MiniLM-L6-v2`) |
| LLM | Groq / OpenAI / Ollama (configurable) |

## Quick Start

### 1. Install Backend Dependencies

```bash
cd "d:\new project"
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Configure Environment

```bash
copy .env.example .env
```
Edit `.env` and add your API key (`GROQ_API_KEY` or `OPENAI_API_KEY`).

### 4. Start the Backend (Terminal 1)

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

### 5. Start the Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

### 6. Open the App

Navigate to **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload and index a document |
| GET | `/api/documents/` | List all uploaded documents |
| POST | `/api/rag/chat` | Chat with documents (RAG) |
| POST | `/api/plagiarism/check` | Run plagiarism detection |
| POST | `/api/spellcheck/check` | Check spelling & grammar |
| POST | `/api/chat` | General AI chat |

## Example API Requests

```bash
# Upload a document
curl -X POST http://localhost:8000/api/documents/upload -F "file=@paper.pdf"

# Chat with documents
curl -X POST http://localhost:8000/api/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the main findings?", "session_id": "user1"}'

# Spell check
curl -X POST http://localhost:8000/api/spellcheck/check \
  -H "Content-Type: application/json" \
  -d '{"text": "Ths is a tset sentense with erors."}'

# Plagiarism check
curl -X POST http://localhost:8000/api/plagiarism/check \
  -H "Content-Type: application/json" \
  -d '{"text": "Text to check for plagiarism against uploaded documents."}'

# AI Chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Summarize the key concepts of machine learning", "session_id": "user1"}'
```

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI entrypoint
│   ├── config.py            # Settings
│   ├── api/routes/           # API route handlers
│   ├── services/             # Business logic modules
│   └── models/schemas.py     # Pydantic models
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root component with routing
│   │   ├── api.js           # Axios API client
│   │   ├── index.css        # Global styles (dark theme)
│   │   └── pages/           # Feature pages
│   ├── package.json
│   └── vite.config.js       # Dev server with API proxy
├── requirements.txt
├── .env.example
└── README.md
```
