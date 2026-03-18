import { Book, Code, Terminal, Shield, Zap, Globe, Cpu, Sun, Moon, AlertTriangle, FileText, MessageSquare, Search, CheckCircle, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const EndpointSection = ({ id, icon: Icon, title, description, method, path, params, requestExample, responseExample, children }) => (
  <section className="docs-section mt-5 pt-4 border-top" id={id}>
    <div className="docs-three-column">
      <div className="docs-col-content">
        <div className="section-header">
          <div className={`icon-badge bg-${id === 'errors' ? 'danger' : 'primary'}`}><Icon size={20} /></div>
          <h2>{title}</h2>
        </div>
        <p className="endpoint-description">{description}</p>
        
        {method && (
          <div className="endpoint-badge mb-4">
            <span className={`method ${method.toLowerCase()}`}>{method}</span>
            <code>{path}</code>
          </div>
        )}

        {params && params.length > 0 && (
          <div className="table-responsive">
            <table className="param-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {params.map((p, i) => (
                  <tr key={i}>
                    <td className="param-name">{p.name}</td>
                    <td className="param-type">{p.type}</td>
                    <td className="param-req">{p.required ? 'Yes' : 'No'}</td>
                    <td>{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {children}
      </div>

      <div className="docs-col-code">
        {requestExample && (
          <div className="code-block">
            <div className="code-title">Example Request</div>
            <div className="code-header">
              <span>cURL</span>
              <span className="lang">BASH</span>
            </div>
            <pre><code>{requestExample}</code></pre>
          </div>
        )}
        
        {responseExample && (
          <div className="code-block mt-3">
            <div className="code-title">Example Response</div>
            <div className="code-header">
              <span>JSON</span>
              <span className="response">200 OK</span>
            </div>
            <pre><code>{responseExample}</code></pre>
          </div>
        )}
      </div>
    </div>
  </section>
);

export default function Documentation() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="docs-page fade-in-up">
      <div className="page-header text-center" style={{ position: 'relative', paddingBottom: '40px' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun size={14} className={theme === 'light' ? 'text-warning' : 'text-muted'} />
          <label className="theme-slider">
            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
            <span className="slider-round"></span>
          </label>
          <Moon size={14} className={theme === 'dark' ? 'text-accent' : 'text-muted'} />
        </div>
        <div className="badge badge-info mb-3">Developer Hub v1.0.0</div>
        <h1 className="text-gradient" style={{ fontSize: '3rem' }}>API Reference</h1>
        <p className="text-secondary" style={{ fontSize: '1.2rem' }}>
          Explore our endpoints and integrate Academic AI into your research workflows.
        </p>
      </div>

      <div className="docs-grid">
        {/* Sidebar Nav */}
        <aside className="docs-sidebar">
          <nav className="docs-nav-sticky">
            <div className="nav-group">
              <label>Introduction</label>
              <a href="#welcome" className="nav-link"><Zap size={14} /> Welcome</a>
              <a href="#auth" className="nav-link"><Shield size={14} /> Authentication</a>
            </div>
            
            <div className="nav-group mt-4">
              <label>Documents</label>
              <a href="#doc-upload" className="nav-link"><FileText size={14} /> Upload File</a>
              <a href="#doc-list" className="nav-link"><Activity size={14} /> List Documents</a>
              <a href="#doc-delete" className="nav-link"><AlertTriangle size={14} /> Delete Document</a>
            </div>

            <div className="nav-group mt-4">
              <label>Chat</label>
              <a href="#chat-rag" className="nav-link"><MessageSquare size={14} /> Knowledge Chat</a>
              <a href="#chat-gen" className="nav-link"><Cpu size={14} /> General AI</a>
            </div>

            <div className="nav-group mt-4">
              <label>Academic Tools</label>
              <a href="#tool-plag" className="nav-link"><Globe size={14} /> Similarity Engine</a>
              <a href="#tool-spell" className="nav-link"><CheckCircle size={14} /> Spell & Grammar</a>
            </div>

            <div className="nav-group mt-4">
              <label>Support</label>
              <a href="#errors" className="nav-link"><AlertTriangle size={14} /> Errors</a>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="docs-content" style={{ paddingBottom: '100px' }}>
          <section id="welcome">
            <h2 className="mb-4">Welcome</h2>
            <p className="text-secondary">
              The Academic AI API provides access to state-of-the-art language models and document processing pipelines. 
              Our endpoints are organized around REST principles and return JSON responses.
            </p>
            <div className="info-box mt-3">
              <Terminal size={18} />
              <div>
                <strong>Base URL:</strong> <code>{API_BASE}</code>
              </div>
            </div>
          </section>

          <EndpointSection
            id="auth"
            title="Authentication"
            icon={Shield}
            description="All API requests must include your user identity in the headers. This ensures data isolation between users."
            params={[
              { name: "X-User-Id", type: "string", required: true, desc: "A unique identifier for the user session (e.g., email)." }
            ]}
            requestExample={`curl -X GET "${API_BASE}/api/documents/" \\
  -H "X-User-Id: user@example.com"`}
          />

          <EndpointSection
            id="doc-upload"
            title="Upload Document"
            icon={FileText}
            method="POST"
            path="/api/documents/upload"
            description="Uploads a file, extracts its text, and generates vector embeddings for retrieval-augmented generation."
            params={[
              { name: "file", type: "UploadFile", required: true, desc: "PDF, DOCX, or TXT file (Max 20MB)." }
            ]}
            requestExample={`curl -X POST "${API_BASE}/api/documents/upload" \\
  -H "X-User-Id: user@example.com" \\
  -F "file=@/path/to/research.pdf"`}
            responseExample={`{
  "doc_id": "8f92a1b",
  "filename": "research.pdf",
  "num_chunks": 42,
  "text_preview": "Abstract: This paper discusses..."
}`}
          />

          <EndpointSection
            id="doc-list"
            title="List Documents"
            icon={Activity}
            method="GET"
            path="/api/documents/"
            description="Returns a list of all document metadata associated with your account."
            requestExample={`curl -G "${API_BASE}/api/documents/" \\
  -H "X-User-Id: user@example.com"`}
            responseExample={`[
  {
    "doc_id": "8f92a1b",
    "filename": "research.pdf",
    "num_chunks": 42
  }
]`}
          />

          <EndpointSection
            id="doc-delete"
            title="Delete Document"
            icon={AlertTriangle}
            method="DELETE"
            path="/api/documents/{doc_id}"
            description="Permanently deletes a document, its physical file, and its indexed vectors."
            params={[
              { name: "doc_id", type: "string [path]", required: true, desc: "The unique ID of the document to delete." }
            ]}
            requestExample={`curl -X DELETE "${API_BASE}/api/documents/8f92a1b" \\
  -H "X-User-Id: user@example.com"`}
            responseExample={`{
  "status": "success",
  "message": "Document 8f92a1b deleted."
}`}
          />

          <EndpointSection
            id="chat-rag"
            title="Knowledge Chat (RAG)"
            icon={MessageSquare}
            method="POST"
            path="/api/rag/"
            description="Query your knowledge base. The AI will search through your uploaded documents to find relevant context before answering."
            params={[
              { name: "question", type: "string", required: true, desc: "The query to ask the AI." },
              { name: "doc_id", type: "string", required: false, desc: "Optional filter to search only one document." },
              { name: "top_k", type: "integer", required: false, desc: "Number of chunks to retrieve (default: 5)." }
            ]}
            requestExample={`curl -X POST "${API_BASE}/api/rag/" \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "What is the conclusion of the paper?",
    "top_k": 3
  }'`}
            responseExample={`{
  "answer": "The paper concludes that...",
  "sources": [
    { "filename": "paper.pdf", "text": "..." }
  ]
}`}
          />

          <EndpointSection
            id="chat-gen"
            title="General AI Chat"
            icon={Cpu}
            method="POST"
            path="/api/chat"
            description="Send a message to the general-purpose AI assistant without any document-specific context."
            params={[
              { name: "message", type: "string", required: true, desc: "The user's message." },
              { name: "session_id", type: "string", required: false, desc: "Optional ID for conversation tracking." }
            ]}
            requestExample={`curl -X POST "${API_BASE}/api/chat" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Summarize the history of AI."}'`}
            responseExample={`{
  "reply": "Artificial Intelligence began...",
  "session_id": "default"
}`}
          />

          <EndpointSection
            id="tool-plag"
            title="Similarity Engine"
            icon={Globe}
            method="POST"
            path="/api/plagiarism/check"
            description="Compare a block of text against all indexed documents in the system to detect overlaps."
            params={[
              { name: "text", type: "string", required: true, desc: "The text to check for plagiarism." }
            ]}
            requestExample={`curl -X POST "${API_BASE}/api/plagiarism/check" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Extracted paragraph from a paper..."}'`}
            responseExample={`{
  "overall_similarity": 12.5,
  "flagged_sections": [
    { "source_doc": "essay.pdf", "similarity": 0.95 }
  ]
}`}
          />

          <EndpointSection
            id="tool-spell"
            title="Spell & Grammar"
            icon={CheckCircle}
            method="POST"
            path="/api/spellcheck/check"
            description="Get advanced grammar suggestions and spelling corrections for academic text."
            params={[
              { name: "text", type: "string", required: true, desc: "The text to analyze." },
              { name: "language", type: "string", required: false, desc: "ISO language code (default: en-US)." }
            ]}
            requestExample={`curl -X POST "${API_BASE}/api/spellcheck/check" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "The analysis show that..."}'`}
            responseExample={`{
  "corrected_text": "The analysis shows that...",
  "errors": [
    { "message": "Potential grammar error", "replacements": ["shows"] }
  ]
}`}
          />

          <EndpointSection
            id="errors"
            title="Error Library"
            icon={AlertTriangle}
            description="We use standard HTTP status codes. Errors include a machine-readable code and a human-readable message."
          >
            <div className="table-responsive">
              <table className="param-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Message</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>400</td>
                    <td>Bad Request</td>
                    <td>Malformed request or invalid parameters.</td>
                  </tr>
                  <tr>
                    <td>401</td>
                    <td>Unauthorized</td>
                    <td>Missing the required X-User-Id header.</td>
                  </tr>
                  <tr>
                    <td>404</td>
                    <td>Not Found</td>
                    <td>The resource or document ID was not found.</td>
                  </tr>
                  <tr>
                    <td>422</td>
                    <td>Unprocessable Entity</td>
                    <td>Validation error or failure in text extraction.</td>
                  </tr>
                  <tr>
                    <td>500</td>
                    <td>Server Error</td>
                    <td>Internal processing error.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </EndpointSection>
        </main>
      </div>
    </div>
  );
}
