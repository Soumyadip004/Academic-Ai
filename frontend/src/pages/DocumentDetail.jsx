import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Send, Bot, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { listDocuments, ragChat } from '../api'
import { useAuth } from '../context/AuthContext'

export default function DocumentDetail() {
  const { docId } = useParams()
  const { user, credits, deductCredits } = useAuth()
  const [doc, setDoc] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [greetingInitiated, setGreetingInitiated] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const fetchDoc = async () => {
      const docs = await listDocuments()
      const found = docs.find(d => d.doc_id === docId)
      setDoc(found)
    }
    fetchDoc()
  }, [docId])

  useEffect(() => {
    if (doc && user && !greetingInitiated) {
      setGreetingInitiated(true)
      initiateGreeting()
    }
  }, [doc, user, greetingInitiated])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initiateGreeting = async () => {
    const name = user?.name || 'Academic Explorer'
    const greetingMsg = `## 👋 Welcome back, ${name}!\n\nI've thoroughly analyzed **${doc.filename}** for you. This document collection appears to be packed with valuable insights.\n\n### Quick Abstract\n${doc.text_preview}...\n\n--- \n**How would you like to proceed?** I'm ready to answer any specific questions, or you can start with these suggestions:`
    
    setMessages([{ 
      role: 'assistant', 
      content: greetingMsg,
      isGreeting: true
    }])
  }

  const send = async (text = null) => {
    const q = (text || input).trim()
    if (!q || loading) return

    if (credits < 15) {
      setMessages(prev => [...prev, { role: 'user', content: q }, { role: 'assistant', content: "⚠️ **Insufficient Credits**. You need 15 credits to chat with documents." }])
      setInput('')
      return
    }

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)

    try {
      const data = await ragChat(q, 'doc_' + docId, 5, docId)
      deductCredits(15)
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  if (!doc) return <div className="p-4">Loading document...</div>

  return (
    <div className="fade-in">
      <div className="page-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/dashboard/documents" className="btn-back">
            <ArrowLeft size={16} /> Back to Library
          </Link>
          <h1>{doc.filename}</h1>
        </div>
        <div className="doc-meta-badge">
          <BookOpen size={16} /> {Math.ceil(doc.num_chunks / 3)} Pages Analyzed
        </div>
      </div>

      <div className="doc-detail-grid split-view">
        {/* Left: PDF Workspace */}
        <div className="doc-preview-pane pdf-workspace">
          <div className="pane-header">
            <BookOpen size={16} className="text-accent" />
            <span>Interactive PDF Workspace</span>
            <div className="workspace-controls">
               <span className="sc-hint">Scroll & Zoom enabled</span>
            </div>
          </div>
          <div className="pdf-container">
            {doc.file_url ? (
              <iframe 
                src={`${doc.file_url}#toolbar=1&navpanes=0&scrollbar=1`}
                width="100%" 
                height="100%" 
                title={doc.filename}
                className="pdf-frame"
              />
            ) : (
              <div className="glass-block m-4">
                <p>PDF view not available for this document.</p>
                <div className="text-preview-fallback">
                   {doc.text_preview}...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Specialized Chat */}
        <div className="doc-chat-pane">
          <div className="pane-header">
            <Sparkles size={16} className="text-secondary" />
            <span>Document Reasoning Engine</span>
          </div>
          <div className="chat-interface compact">
            <div className="chat-messages" style={{ height: 'calc(100% - 70px)' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role} ${msg.isGreeting ? 'greeting' : ''}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {msg.isGreeting && (
                    <div className="suggestion-chips mt-3">
                      <button onClick={() => send("Can you summarize the main topics?")}>Summarize Topics</button>
                      <button onClick={() => send("What are the key points?")}>Key Points</button>
                      <button onClick={() => send("How to use this info?")}>Usage Guide</button>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="chat-bubble assistant">
                   <div className="typing-indicator">
                      <span></span><span></span><span></span>
                   </div>
                   Studying document context...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-bar">
              <input 
                type="text" 
                placeholder="Query your document..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <button className="btn btn-primary" onClick={() => send()} disabled={loading}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
