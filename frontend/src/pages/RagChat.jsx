import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { ragChat } from '../api'
import { useAuth } from '../context/AuthContext'

export default function RagChat() {
  const { credits, deductCredits } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedSource, setSelectedSource] = useState(null)
  const bottomRef = useRef(null)
  const sessionId = 'react_rag'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return

    if (credits < 15) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: q },
        { role: 'assistant', content: `⚠️ **Insufficient Credits**. You need 15 credits to search documents. Please [Upgrade to Basic](/pricing) to continue.` },
      ])
      setInput('')
      return
    }

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setLoading(true)

    try {
      const data = await ragChat(q, sessionId)
      deductCredits(15)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ])
    } catch (err) {
      const msg = err.response?.data?.detail || err.message
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${msg}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="fade-in">
      <div className="page-hero">
        <h1>💬 Chat with Documents</h1>
        <p>Ask questions about your uploaded documents — answers include citations</p>
      </div>

      <div className="chat-container">
        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
              <BookOpen size={40} strokeWidth={1.2} style={{ marginBottom: 12 }} />
              <p>Upload documents first, then ask questions here.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i}>
              <div className={`chat-bubble ${msg.role}`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              {msg.sources?.length > 0 && (
                <div className="source-citations fade-in">
                  <span className="citation-label">Sources:</span>
                  <div className="citation-badges">
                    {msg.sources.map((s, j) => (
                      <button 
                        key={j} 
                        className="citation-badge"
                        onClick={() => setSelectedSource(s)}
                        title={`View excerpt from ${s.filename}`}
                      >
                        <BookOpen size={12} />
                        Source {j + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="loading-overlay">
              <span className="spinner" /> Searching documents …
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="chat-input-bar">
          <input
            type="text"
            placeholder="Ask a question about your documents …"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()}>
            <Send size={16} /> Send
          </button>
          <button className="btn btn-danger" onClick={() => setMessages([])}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Source Detail Modal */}
      {selectedSource && (
        <div className="modal-overlay" onClick={() => setSelectedSource(null)}>
          <div className="modal-content fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Source Details</h3>
              <button className="btn-close" onClick={() => setSelectedSource(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="label">Document:</span>
                <span className="value">{selectedSource.filename}</span>
              </div>
              <div className="detail-row">
                <span className="label">Relevance:</span>
                <span className="value success">{(selectedSource.similarity_score * 100).toFixed(1)}% Match</span>
              </div>
              <div className="detail-row">
                <span className="label">Location:</span>
                <span className="value">Chunk {selectedSource.chunk_index + 1}</span>
              </div>
              <div className="excerpt-container">
                <h4>Excerpt:</h4>
                <div className="excerpt-text">{selectedSource.text}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
