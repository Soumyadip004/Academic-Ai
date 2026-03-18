import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { aiChat } from '../api'
import { useAuth } from '../context/AuthContext'

export default function AiChat() {
  const { credits, deductCredits } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const bottomRef = useRef(null)
  const sessionId = 'react_aichat'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    const words = text ? text.split(/\s+/).length : 0
    if (!text || loading || words > 200) return

    if (credits < 10) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: `⚠️ **Insufficient Credits**. You need 10 credits for this action. Please [Upgrade to Basic](/pricing) to continue.` },
      ])
      setInput('')
      return
    }

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const data = await aiChat(text, sessionId)
      deductCredits(10)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
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
        <h1>🤖 AI Chat Assistant</h1>
        <p>General-purpose assistant for writing, brainstorming, and Q&A</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
              <Bot size={40} strokeWidth={1.2} style={{ marginBottom: 12 }} />
              <p>Start a conversation with the AI assistant.</p>
              <p style={{ fontSize: '0.84rem', marginTop: 6 }}>
                Ask questions, get help with writing, or brainstorm ideas.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          ))}
          {loading && (
            <div className="loading-overlay">
              <span className="spinner" /> Thinking …
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-bar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Type your message …"
              value={input}
              onChange={(e) => {
                const val = e.target.value;
                setInput(val);
                setWordCount(val.trim() ? val.trim().split(/\s+/).length : 0);
              }}
              onKeyDown={handleKey}
              disabled={loading}
              style={{ borderColor: wordCount > 200 ? 'var(--danger)' : '' }}
            />
            <button 
              className="btn btn-primary" 
              onClick={send} 
              disabled={loading || !input.trim() || wordCount > 200}
            >
              <Send size={16} /> Send
            </button>
            <button className="btn btn-danger" onClick={() => setMessages([])}>
              <Trash2 size={16} />
            </button>
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            marginTop: '4px', 
            textAlign: 'right',
            color: wordCount > 200 ? 'var(--danger)' : 'var(--text-muted)'
          }}>
            {wordCount} / 200 words
            {wordCount > 200 && <span style={{ marginLeft: '8px' }}>⚠️ Limit exceeded</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
