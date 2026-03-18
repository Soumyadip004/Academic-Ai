import { useState } from 'react'
import { ShieldAlert, ShieldCheck, Info } from 'lucide-react'
import { plagiarismCheck } from '../api'

export default function PlagiarismChecker() {
  const [text, setText] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setReport(null)
    try {
      const data = await plagiarismCheck(text)
      setReport(data)
    } catch (err) {
      setReport({ error: err.response?.data?.detail || err.message })
    } finally {
      setLoading(false)
    }
  }

  const getColor = (pct) => {
    if (pct < 20) return { color: 'var(--success)', label: 'Low', gradient: '#22c55e' }
    if (pct < 50) return { color: 'var(--warning)', label: 'Moderate', gradient: '#f59e0b' }
    return { color: 'var(--danger)', label: 'High', gradient: '#ef4444' }
  }

  return (
    <div className="fade-in">
      <div className="page-hero">
        <h1>🔍 Plagiarism Detector</h1>
        <p>Compare text against your document database</p>
      </div>

      <div className="info-box">
        <Info size={18} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>Upload documents first — plagiarism is checked against the indexed document database.</span>
      </div>

      <div className="card">
        <textarea
          rows={8}
          placeholder="Paste the text you want to verify for plagiarism …"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={run} disabled={loading || !text.trim()}>
            {loading ? <><span className="spinner" /> Analysing …</> : '🔬 Run Plagiarism Check'}
          </button>
          <button className="btn btn-ghost" onClick={() => { setText(''); setReport(null) }}>
            Clear
          </button>
        </div>
      </div>

      {report?.error && (
        <div className="info-box" style={{ borderColor: 'rgba(248,113,113,0.3)', color: 'var(--danger)' }}>
          ⚠️ {report.error}
        </div>
      )}

      {report && !report.error && (
        <div className="fade-in">
          {/* Score */}
          {(() => {
            const { color, label, gradient } = getColor(report.overall_similarity)
            return (
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="plag-score" style={{ color }}>{report.overall_similarity.toFixed(1)}%</div>
                <div className="plag-label" style={{ color }}>
                  {report.overall_similarity < 20 ? (
                    <ShieldCheck size={16} style={{ verticalAlign: -3 }} />
                  ) : (
                    <ShieldAlert size={16} style={{ verticalAlign: -3 }} />
                  )}
                  {' '}{label} Similarity
                </div>
                <div className="plag-meter">
                  <div className="plag-bar-track">
                    <div
                      className="plag-bar-fill"
                      style={{
                        width: `${Math.min(report.overall_similarity, 100)}%`,
                        background: `linear-gradient(90deg, ${gradient}, ${gradient}cc)`,
                      }}
                    />
                  </div>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {report.total_chunks_checked} chunk(s) analysed · {report.flagged_sections.length} flagged section(s)
                </p>
              </div>
            )
          })()}

          {/* Flagged sections */}
          {report.flagged_sections.length > 0 && (
            <>
              <h3 className="card-title" style={{ marginTop: 8 }}>
                <ShieldAlert size={16} color="var(--danger)" /> Flagged Sections
              </h3>
              {report.flagged_sections.map((sec, i) => {
                const { color } = getColor(sec.similarity)
                return (
                  <div key={i} className="plag-match">
                    <div>
                      <h4>Your Text</h4>
                      <pre>{sec.input_chunk_text}</pre>
                    </div>
                    <div>
                      <h4>Matching Source — {sec.source_doc}</h4>
                      <pre>{sec.source_chunk_text}</pre>
                    </div>
                    <div className="plag-match-score" style={{ color }}>
                      {sec.similarity.toFixed(1)}% match
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {report.flagged_sections.length === 0 && report.overall_similarity === 0 && (
            <div className="success-box" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <ShieldCheck size={18} />
              No matching content found in the document database.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
