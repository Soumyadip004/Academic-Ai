import { useState } from 'react';
import { Save, Key, Database, Shield, Monitor, Bot, CreditCard, Trash2, TrendingUp, History, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, credits, usageHistory, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [model, setModel] = useState('gpt-4o');
  const [apiKey, setApiKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert academic research assistant...');
  const [retention, setRetention] = useState('90');
  const [saved, setSaved] = useState(false);

  // Calculate consumption from real history
  const totalConsumption = usageHistory.reduce((acc, curr) => acc + curr.deduction, 0);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('CRITICAL: This will permanently delete your enterprise account and all associated data. This action is irreversible. Proceed?')) {
      deleteAccount();
      navigate('/');
    }
  };

  return (
    <div className="settings-page fade-in">
      <div className="page-header">
        <h1>⚙️ Organization Settings</h1>
        <p>Manage your enterprise AI preferences, API keys, and security controls.</p>
      </div>

      <div className="settings-grid">
        {/* Left Column - Forms */}
        <div className="settings-content">
          {/* Analytical Dashboard */}
          <section className="card mb-4 border-glow">
            <h3 className="card-title mb-4"><Activity size={18} /> Financial Trace & Analytics</h3>
            
            <div className="analytics-grid">
              <div className="stat-card-mini">
                <span className="label">Session Consumption</span>
                <span className="value">{totalConsumption} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>credits</span></span>
                <span className="trend up">↑ Real-time sync</span>
              </div>
              <div className="stat-card-mini">
                <span className="label">Efficiency Rating</span>
                <span className="value">98.4%</span>
                <span className="trend up">↑ Optimized</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={14} /> Usage Trace (Real-time)
              </h4>
              <div className="table-responsive">
                <table className="api-table w-100">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Timestamp</th>
                      <th className="text-right">Deduction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageHistory.length > 0 ? (
                      usageHistory.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.action}</div>
                          </td>
                          <td>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{item.date} {item.time}</div>
                          </td>
                          <td className="text-right">
                            <span className="text-danger">-{item.deduction} cr</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted py-4">No recent activity detected.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-top">
              <button className="btn btn-ghost btn-sm w-100"><TrendingUp size={14} /> View Detailed Usage Report</button>
            </div>
          </section>

          <form onSubmit={handleSave} className="card">
            <h3 className="card-title mb-4"><Bot size={18} /> AI Model Configuration</h3>
            
            <div className="form-group mb-4">
              <label>Default Enterprise Model</label>
              <select 
                className="form-select" 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="gpt-4o">OpenAI GPT-4o (Recommended)</option>
                <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="llama-3">Meta Llama 3 (Local/On-Premise)</option>
              </select>
              <small className="text-muted mt-2 d-block">This model will be used across all workspaces.</small>
            </div>

            <div className="form-group mb-4">
              <label>Custom System Prompt</label>
              <textarea 
                rows="4" 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
              <small className="text-muted mt-2 d-block">Defines the baseline behavior of the AI Assistant.</small>
            </div>

            <hr className="divider" />

            <h3 className="card-title my-4"><Key size={18} /> API Integration</h3>
            
            <div className="form-group mb-4">
              <label>Bring Your Own Key (BYOK)</label>
              <input 
                type="password" 
                placeholder="sk-..." 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <small className="text-muted mt-2 d-block">Keys are encrypted at rest using AES-256.</small>
            </div>

            <hr className="divider" />

            <h3 className="card-title my-4"><Database size={18} /> Data & Privacy</h3>

            <div className="form-group mb-4">
              <label>Document Retention Policy (Days)</label>
              <select 
                className="form-select" 
                value={retention} 
                onChange={(e) => setRetention(e.target.value)}
              >
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">1 Year</option>
                <option value="indefinite">Indefinite (Requires Admin Approval)</option>
              </select>
            </div>

            <div className="form-actions mt-4 pt-4 border-top">
              <button type="submit" className="btn btn-primary w-100">
                <Save size={16} /> Save Organization Settings
              </button>
              {saved && (
                <div className="success-message text-center mt-3 text-success fade-in">
                  ✓ Settings saved successfully across all regions.
                </div>
              )}
            </div>
          </form>

          {/* Danger Zone */}
          <section className="card mt-4 danger-zone">
            <h3 className="card-title text-danger mb-3 font-bold"><Shield size={18} className="text-danger" /> Danger Zone</h3>
            <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>
              Removing your account is irreversible. All indexes, documents, and API keys will be permanently purged from our encrypted nodes.
            </p>
            <button 
              type="button"
              onClick={handleDeleteAccount}
              className="btn btn-danger-outline w-100"
            >
              <Trash2 size={16} /> Delete Account Permanently
            </button>
          </section>
        </div>

        {/* Right Column - Status/Info */}
        <div className="settings-sidebar">
          <div className="card mb-4 border-glow">
            <h3 className="card-title text-success"><Shield size={18} /> Enterprise Status</h3>
            <ul className="status-list">
              <li><strong>User:</strong> {user?.name || 'Guest'}</li>
              <li><strong>Plan:</strong> Enterprise Tier</li>
              <li><strong>Workspaces:</strong> 4 Active</li>
              <li><strong>SSO:</strong> Enabled (Okta Integration)</li>
            </ul>
          </div>

          <div className="card mb-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
            <h3 className="card-title mb-3"><CreditCard size={18} /> Account & Billing</h3>
            
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary" style={{ fontSize: '0.9rem' }}>AI Credits</span>
              <span style={{ fontWeight: 600, color: credits > 100 ? 'var(--text-primary)' : 'var(--danger)' }}>
                {credits?.toLocaleString() || 0} / 1000
              </span>
            </div>
            
            <div className="plag-bar-track" style={{ height: '8px', margin: '0 0 16px' }}>
              <div 
                className="plag-bar-fill" 
                style={{ 
                  width: `${Math.min((credits / 1000) * 100, 100)}%`, 
                  background: credits > 100 ? 'var(--gradient-primary)' : 'var(--danger)' 
                }} 
              />
            </div>
            
            {credits === 0 ? (
              <div className="alert alert-danger mb-3" style={{ fontSize: '0.85rem', padding: '10px' }}>
                Your free credits have been exhausted.
              </div>
            ) : (
              <p className="text-muted mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                Credits are consumed on a per-model basis during interactions.
              </p>
            )}

            <Link to="/pricing" className={`btn ${credits === 0 ? 'btn-primary' : 'btn-ghost'} w-100 mt-2`}>
              {credits === 0 ? 'Upgrade to Basic Plan' : 'Manage Subscription'}
            </Link>
          </div>

          <div className="card">
            <h3 className="card-title"><Monitor size={18} /> Usage Metrics</h3>
            <div className="usage-meter mb-3">
              <div className="d-flex justify-content-between text-muted mb-2">
                <span>RAG Queries</span>
                <span>8.4k / 100k</span>
              </div>
              <div className="plag-bar-track" style={{ height: '8px', margin: 0 }}>
                <div className="plag-bar-fill" style={{ width: '8.4%', background: 'var(--accent)' }} />
              </div>
            </div>
            <div className="usage-meter">
              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Storage</span>
                <span>45GB / 1TB</span>
              </div>
              <div className="plag-bar-track" style={{ height: '8px', margin: 0 }}>
                <div className="plag-bar-fill" style={{ width: '4.5%', background: 'var(--success)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
