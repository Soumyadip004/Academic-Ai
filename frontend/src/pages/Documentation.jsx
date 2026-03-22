import React, { useState } from 'react';
import { 
  Book, Code, Terminal, Shield, Zap, Globe, Cpu, Sun, Moon, 
  AlertTriangle, FileText, MessageSquare, Search, CheckCircle, 
  Activity, Copy, Check, ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CodeTabBlock = ({ examples }) => {
  const [activeTab, setActiveTab] = useState('bash');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(examples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-tab-container mt-3">
      <div className="code-tabs-header">
        <button 
          className={`code-tab-btn ${activeTab === 'bash' ? 'active' : ''}`}
          onClick={() => setActiveTab('bash')}
        >
          cURL
        </button>
        <button 
          className={`code-tab-btn ${activeTab === 'python' ? 'active' : ''}`}
          onClick={() => setActiveTab('python')}
        >
          Python
        </button>
        <button 
          className={`code-tab-btn ${activeTab === 'js' ? 'active' : ''}`}
          onClick={() => setActiveTab('js')}
        >
          Node.js
        </button>
        <button className="copy-btn" onClick={copyToClipboard}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="code-block-body">
        <pre><code>{examples[activeTab]}</code></pre>
      </div>
    </div>
  );
};

const EndpointSection = ({ id, icon: Icon, title, description, method, path, params, examples, responseExample, children }) => (
  <section className="docs-section mb-5" id={id}>
    <div className="docs-three-column">
      <div className="docs-col-content">
        <div className="section-header">
          <div className={`icon-badge bg-${id === 'errors' ? 'danger' : 'primary'}`}><Icon size={20} /></div>
          <h2>{title}</h2>
        </div>
        <p className="endpoint-description">{description}</p>
        
        {method && (
          <div className={`method-label ${method.toLowerCase()}`}>
            {method} <span style={{ opacity: 0.5, margin: '0 8px' }}>•</span> {path}
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
        {examples && <CodeTabBlock examples={examples} />}
        
        {responseExample && (
          <div className="code-tab-container mt-4" style={{ background: '#1e293b' }}>
            <div className="code-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>RESPONSE</span>
              <span className="response">200 OK</span>
            </div>
            <pre style={{ padding: '20px', margin: 0, fontSize: '0.8rem' }}>
              <code>{responseExample}</code>
            </pre>
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
      {/* ── Status & Header ── */}
      <div className="status-indicator-bar">
        <div className="status-badge">
          <div className="status-dot"></div>
          API Operational
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Incidents: 0 in last 30 days</div>
      </div>

      <div className="page-header text-center" style={{ position: 'relative', marginBottom: '64px' }}>
        <div className="badge badge-info mb-3">Enterprise Dev Portal v1.2</div>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: 800 }}>Developer Documentation</h1>
        <p className="text-secondary" style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '16px auto' }}>
          Seamlessly integrate state-of-the-art AI into your academic or corporate research infrastructure.
        </p>
      </div>

      <div className="docs-grid">
        {/* Sidebar Nav */}
        <aside className="docs-sidebar">
          <nav className="docs-nav-sticky">
            <div className="nav-group">
              <label>Introduction</label>
              <a href="#welcome" className="nav-link"><Zap size={14} /> Getting Started</a>
              <a href="#auth" className="nav-link"><Shield size={14} /> Authentication</a>
            </div>
            
            <div className="nav-group mt-4">
              <label>Core Services</label>
              <a href="#doc-upload" className="nav-link"><FileText size={14} /> Document Vault</a>
              <a href="#chat-rag" className="nav-link"><MessageSquare size={14} /> Knowledge Retrieval</a>
            </div>

            <div className="nav-group mt-4">
              <label>Intelligence</label>
              <a href="#tool-plag" className="nav-link"><Globe size={14} /> Similarity Engine</a>
              <a href="#tool-spell" className="nav-link"><CheckCircle size={14} /> Grammar Pro</a>
            </div>

            <div className="nav-group mt-4">
              <label>Resources</label>
              <a href="#errors" className="nav-link"><AlertTriangle size={14} /> Error Library</a>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="docs-content">
          <section id="welcome" className="mb-5 pt-4">
            <h2 className="mb-4">Getting Started</h2>
            <p className="text-secondary">
              Academic AI uses a simple REST orientation. Follow these steps to perform your first retrieval-augmented query.
            </p>

            <div className="steps-timeline">
              <div className="step-row">
                <div className="step-circle">1</div>
                <div className="step-info">
                  <h4>Authentication</h4>
                  <p>Obtain your <code>X-User-Id</code> (usually your email) to scope your data requests.</p>
                </div>
              </div>
              <div className="step-row">
                <div className="step-circle">2</div>
                <div className="step-info">
                  <h4>Upload Corpus</h4>
                  <p>Send your research PDFs to the <code>/upload</code> endpoint. We'll automatically handle text extraction and vectorization.</p>
                </div>
              </div>
              <div className="step-row">
                <div className="step-circle">3</div>
                <div className="step-info">
                  <h4>Query Intelligence</h4>
                  <p>Once indexed, use the Knowledge Chat endpoint to ask complex questions against your docs.</p>
                </div>
              </div>
            </div>

            <div className="info-box">
              <Terminal size={18} />
              <div>
                <strong>Global Base URL:</strong> <code>{API_BASE}</code>
              </div>
            </div>
          </section>

          <EndpointSection
            id="auth"
            title="Authentication"
            icon={Shield}
            description="All API requests must include your user identity in the headers. This ensures data isolation and prevents unauthorized usage."
            params={[
              { name: "X-User-Id", type: "string", required: true, desc: "A unique identifier for the user session (e.g., email)." }
            ]}
            examples={{
              bash: `curl -X GET "${API_BASE}/api/documents/" \\\n  -H "X-User-Id: user@example.com"`,
              python: `import requests\n\nheaders = {"X-User-Id": "user@example.com"}\nresponse = requests.get("${API_BASE}/api/documents/", headers=headers)\nprint(response.json())`,
              js: `fetch("${API_BASE}/api/documents/", {\n  headers: { "X-User-Id": "user@example.com" }\n})\n.then(res => res.json())\n.then(console.log);`
            }}
          />

          <EndpointSection
            id="doc-upload"
            title="Upload Document"
            icon={FileText}
            method="POST"
            path="/api/documents/upload"
            description="Primary entry point for research data. Supports automated chunking and high-speed vector embedding generation."
            params={[
              { name: "file", type: "UploadFile", required: true, desc: "PDF, DOCX, or TXT file (Max 20MB)." }
            ]}
            examples={{
              bash: `curl -X POST "${API_BASE}/api/documents/upload" \\\n  -H "X-User-Id: user@example.com" \\\n  -F "file=@/path/to/research.pdf"`,
              python: `import requests\n\nfiles = {'file': open('research.pdf', 'rb')}\nheaders = {"X-User-Id": "user@example.com"}\nresponse = requests.post("${API_BASE}/api/documents/upload", headers=headers, files=files)\nprint(response.json())`,
              js: `const formData = new FormData();\nformData.append('file', fileInput.files[0]);\n\nfetch("${API_BASE}/api/documents/upload", {\n  method: "POST",\n  headers: { "X-User-Id": "user@example.com" },\n  body: formData\n});`
            }}
            responseExample={`{\n  "doc_id": "8f92a1b",\n  "filename": "research.pdf",\n  "num_chunks": 42\n}`}
          />

          <EndpointSection
            id="chat-rag"
            title="Knowledge Chat (RAG)"
            icon={MessageSquare}
            method="POST"
            path="/api/rag/chat"
            description="Advanced semantic search and generation. Combined vector retrieval with LLM reasoning to answer questions based on your specific document corpus."
            params={[
              { name: "question", type: "string", required: true, desc: "The query to ask the AI." },
              { name: "doc_id", type: "string", required: false, desc: "Optional filter to search only one document." },
              { name: "top_k", type: "integer", required: false, desc: "Context chunks to retrieve (default: 5)." }
            ]}
            examples={{
              bash: `curl -X POST "${API_BASE}/api/rag/chat" \\\n  -H "Content-Type: application/json" \\\n  -d '{"question": "Summarize the theory."}'`,
              python: `import requests\n\ndata = {"question": "What is the result?", "top_k": 3}\nresponse = requests.post("${API_BASE}/api/rag/chat", json=data)\nprint(response.json())`,
              js: `fetch("${API_BASE}/api/rag/chat", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ question: "Key takeaways?" })\n});`
            }}
            responseExample={`{\n  "answer": "The theory suggests...",\n  "sources": [{ "filename": "doc.pdf", "score": 0.89 }]\n}`}
          />

          <EndpointSection
            id="tool-plag"
            title="Similarity Engine"
            icon={Globe}
            method="POST"
            path="/api/plagiarism/check"
            description="Compare external text against your internal indexed knowledge to identify overlapping research or reused content."
            params={[
              { name: "text", type: "string", required: true, desc: "The text to analyze for proximity." }
            ]}
            examples={{
              bash: `curl -X POST "${API_BASE}/api/plagiarism/check" \\\n  -d '{"text": "Sample research text..."}'`,
              python: `import requests\n\nresponse = requests.post("${API_BASE}/api/plagiarism/check", json={"text": "..."})\nprint(response.json())`,
              js: `fetch("${API_BASE}/api/plagiarism/check", {\n  method: "POST",\n  body: JSON.stringify({ text: "..." })\n});`
            }}
            responseExample={`{\n  "overall_similarity": 12.5,\n  "matches": [{ "doc": "old_paper.pdf", "score": 0.92 }]\n}`}
          />

          <EndpointSection id="errors" title="Error Library" icon={AlertTriangle} 
            description="We use semantic HTTP status codes. Every error includes a machine-readable code for automated handling.">
            <div className="table-responsive">
              <table className="param-table">
                <thead>
                  <tr><th>Code</th><th>Status</th><th>Meaning</th></tr>
                </thead>
                <tbody>
                  <tr><td>400</td><td>Bad Request</td><td>Malformed parameters or invalid JSON.</td></tr>
                  <tr><td>401</td><td>Unauthorized</td><td>X-User-Id header is missing or invalid.</td></tr>
                  <tr><td>404</td><td>Not Found</td><td>Document ID or endpoint does not exist.</td></tr>
                  <tr><td>422</td><td>Unprocessable</td><td>Text extraction or vectorization failed.</td></tr>
                  <tr><td>500</td><td>Server Error</td><td>Internal LLM or Vector Store failure.</td></tr>
                </tbody>
              </table>
            </div>
          </EndpointSection>
        </main>
      </div>
    </div>
  );
}
