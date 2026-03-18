import { useState } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { spellCheck } from '../api'

export default function SpellChecker() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const run = async () => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    if (!text.trim() || loading || words > 200) return
    setLoading(true)
    setResult(null)
    try {
      const data = await spellCheck(text)
      setResult(data)
    } catch (err) {
      setResult({ error: err.response?.data?.detail || err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="page-hero">
        <h1>✏️ Spell & Grammar Checker</h1>
        <p>Paste your text below to find and fix errors</p>
      </div>

      <div className="card">
        <textarea
          rows={8}
          placeholder="Paste or type your text here …"
          value={text}
          onChange={(e) => {
            const val = e.target.value;
            setText(val);
            setWordCount(val.trim() ? val.trim().split(/\s+/).length : 0);
          }}
          style={{ borderColor: wordCount > 200 ? 'var(--danger)' : '' }}
        />
        <div style={{ 
          fontSize: '0.75rem', 
          marginTop: '8px', 
          textAlign: 'right',
          color: wordCount > 200 ? 'var(--danger)' : 'var(--text-muted)'
        }}>
          {wordCount} / 200 words
          {wordCount > 200 && <span style={{ marginLeft: '8px' }}>⚠️ Limit exceeded</span>}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <button 
            className="btn btn-primary" 
            onClick={run} 
            disabled={loading || !text.trim() || wordCount > 200}
          >
            {loading ? <><span className="spinner" /> Checking …</> : 'Check Text'}
          </button>
          <button className="btn btn-ghost" onClick={() => { setText(''); setResult(null); setWordCount(0); }}>
            Clear
          </button>
        </div>
      </div>

      {result?.error && (
        <div className="info-box" style={{ borderColor: 'rgba(248,113,113,0.3)', color: 'var(--danger)' }}>
          ⚠️ {result.error}
        </div>
      )}

      {result && !result.error && (
        <div className="fade-in">
          {result.error_count === 0 ? (
            <div className="success-box" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={18} />
              No errors found — your text looks great!
            </div>
          ) : (
            <>
              {/* Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <AlertTriangle size={18} color="var(--warning)" />
                <span style={{ fontWeight: 600 }}>
                  Found {result.error_count} issue{result.error_count !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Corrected text */}
              <div className="card">
                <h3 className="card-title">
                  <CheckCircle size={16} color="var(--success)" /> Corrected Text
                </h3>
                <textarea
                  rows={6}
                  readOnly
                  value={result.corrected_text}
                  style={{ cursor: 'default', opacity: 0.95 }}
                  onClick={(e) => { e.target.select() }}
                />
              </div>

              {/* Error details */}
              <h3 className="card-title" style={{ marginTop: 8 }}>
                <AlertTriangle size={16} color="var(--warning)" /> Errors Found
              </h3>
              <div className="error-list">
                {result.errors.map((err, i) => (
                  <div key={i} className="error-item">
                    <h4>
                      {i + 1}. {err.message}
                    </h4>
                    <p>
                      <strong>Rule:</strong> <code style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>{err.rule_id}</code>
                      {' · '}Offset {err.offset}, length {err.length}
                    </p>
                    {err.context && (
                      <p style={{ fontStyle: 'italic' }}>…{err.context}…</p>
                    )}
                    {err.replacements.length > 0 && (
                      <div className="suggestions">
                        {err.replacements.map((r, j) => (
                          <span key={j} className="suggestion-chip">{r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
