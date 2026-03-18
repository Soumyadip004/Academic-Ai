import { useState } from 'react';
import { FileText, AlignLeft, Zap, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

export default function Summarizer() {
  const { credits, deductCredits } = useAuth();
  const [text, setText] = useState('');
  const [summaryType, setSummaryType] = useState('executive');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleSummarize = async () => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (!text.trim() || words > 200) return;

    if (credits < 25) {
      setResult("⚠️ **Insufficient Credits**. You need 25 credits to generate a summary. Please [Upgrade to Basic](/pricing) to continue.");
      return;
    }

    setLoading(true);
    
    // Simulate API call for frontend-only
    setTimeout(() => {
      deductCredits(25);
      let output = "";
      if (summaryType === 'executive') {
        output = `### Executive Summary\n\nThe provided text analyzes key structural paradigms. It suggests that migrating to an enterprise framework boosts productivity by 40% while centralizing security controls.\n\n**Strategic Value:** Highly Recommended.`;
      } else if (summaryType === 'bullets') {
        output = `### Key Takeaways\n- Enterprise migration increases productivity.\n- Centralized security controls reduce risk.\n- Implementation requires a phased rollout over 3 months.`;
      } else {
        output = `### Action Items\n1. Schedule migration kickoff.\n2. Audit existing security protocols.\n3. Draft training materials for the new framework.`;
      }
      setResult(output);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>⚡ Executive AI Summarizer</h1>
        <p>Instantly extract key takeaways, action items, and executive summaries from lengthy documents.</p>
      </div>

      <div className="summarizer-grid">
        {/* Input Area */}
        <div className="card input-section">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="card-title m-0"><FileText size={18} /> Source Material</h3>
          </div>
          <textarea
            rows="14"
            placeholder="Paste meeting notes, research papers, or transcriptions here..."
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
          
          <div className="summary-controls mt-4">
            <label className="text-secondary mb-2 d-block">Output Format</label>
            <div className="d-flex gap-3 mb-4">
              <label className="radio-btn">
                <input 
                  type="radio" 
                  name="type" 
                  checked={summaryType === 'executive'}
                  onChange={() => setSummaryType('executive')}
                />
                Executive Brief
              </label>
              <label className="radio-btn">
                <input 
                  type="radio" 
                  name="type" 
                  checked={summaryType === 'bullets'}
                  onChange={() => setSummaryType('bullets')}
                />
                Bullet Points
              </label>
              <label className="radio-btn">
                <input 
                  type="radio" 
                  name="type" 
                  checked={summaryType === 'actions'}
                  onChange={() => setSummaryType('actions')}
                />
                Action Items
              </label>
            </div>

            <button 
              className="btn btn-primary w-100" 
              onClick={handleSummarize}
              disabled={loading || !text.trim() || wordCount > 200}
            >
              {loading ? <><span className="spinner"/> Generating...</> : <><Zap size={16}/> Extract Insights</>}
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="card output-section">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="card-title m-0"><AlignLeft size={18} /> Generated Insight</h3>
            {result && (
              <button className="btn btn-ghost btn-sm">
                <Download size={14}/> Export
              </button>
            )}
          </div>
          
          <div className="summary-result">
            {!result && !loading && (
              <div className="empty-state text-muted text-center" style={{ marginTop: '30%' }}>
                <Zap size={32} style={{ opacity: 0.5, marginBottom: '16px' }} />
                <p>Synthesis will appear here.</p>
              </div>
            )}
            
            {loading && (
              <div className="loading-state text-center" style={{ marginTop: '30%' }}>
                <span className="spinner" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent', width: 32, height: 32 }}></span>
                <p className="mt-3 text-secondary">Analyzing content structure...</p>
              </div>
            )}

            {result && !loading && (
              <div className="markdown-body fade-in">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
