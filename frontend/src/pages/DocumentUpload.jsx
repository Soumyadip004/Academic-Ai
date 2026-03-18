import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, Trash2 } from 'lucide-react'
import { uploadDocument, listDocuments, deleteDocument } from '../api'

export default function DocumentUpload() {
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState([])

  const loadDocs = async () => {
    try {
      const data = await listDocuments()
      setDocs(data)
    } catch { /* backend might not be up */ }
  }

  useEffect(() => { loadDocs() }, [])

  const handleDelete = async (e, docId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      await deleteDocument(docId)
      loadDocs()
    } catch (err) {
      alert('Failed to delete document: ' + (err.response?.data?.detail || err.message))
    }
  }

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true)
    const newResults = []
    for (const file of acceptedFiles) {
      try {
        const res = await uploadDocument(file)
        newResults.push({ ok: true, ...res })
      } catch (err) {
        const msg = err.response?.data?.detail || err.message
        newResults.push({ ok: false, filename: file.name, error: msg })
      }
    }
    setResults(newResults)
    setUploading(false)
    loadDocs()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 20 * 1024 * 1024,
  })

  return (
    <div className="fade-in">
      <div className="page-hero">
        <h1>📄 Document Upload</h1>
        <p>Upload PDF, DOCX, or TXT files to build your knowledge base</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone${isDragActive ? ' active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-icon">
          <Upload size={48} strokeWidth={1.5} color="var(--accent)" />
        </div>
        <p>
          {isDragActive
            ? 'Drop the files here …'
            : 'Drag & drop documents here, or click to browse'}
        </p>
        <p className="hint">PDF, DOCX, TXT — max 20 MB each</p>
      </div>

      {/* Upload status */}
      {uploading && (
        <div className="loading-overlay" style={{ marginTop: 16 }}>
          <span className="spinner" /> Processing documents …
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: 20 }}>
          {results.map((r, i) =>
            r.ok ? (
              <div key={i} className="success-box" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={18} />
                <span>
                  <strong>{r.filename}</strong> — {r.num_chunks} chunks indexed
                </span>
              </div>
            ) : (
              <div key={i} className="info-box" style={{ borderColor: 'rgba(248,113,113,0.3)', color: 'var(--danger)' }}>
                ❌ <strong>{r.filename}</strong>: {r.error}
              </div>
            )
          )}
        </div>
      )}

      {/* Document list */}
      <h2 className="card-title" style={{ marginTop: 32 }}>
        <FileText size={18} /> Uploaded Documents
      </h2>

      {docs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No documents uploaded yet. Upload your first document above.
        </p>
      ) : (
        <div className="doc-grid">
          {docs.map((d) => (
            <Link key={d.doc_id} to={`/dashboard/documents/${d.doc_id}`} className="doc-card">
              <div className="doc-card-header">
                <div className="filename">{d.filename}</div>
                <button 
                  className="delete-btn"
                  onClick={(e) => handleDelete(e, d.doc_id)}
                  title="Delete Document"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="meta">{d.doc_id}</div>
              <span className="chunks">{d.num_chunks} chunks</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
