import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Globe, Users, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="home-page">
      {/* ── Hero Section ─────────────────────────────── */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content fade-in-up">
            <h1 className="hero-title">
              The Ultimate AI Knowledge Platform <br />
              <span className="text-gradient">For Enterprise Research</span>
            </h1>
            <p className="hero-subtitle">
              Empower your organistion with state-of-the-art Document RAG, AI chat, originality checks, and advanced analytics in one secure, unified hub.
            </p>
            <div className="hero-actions">
              <Link to="/dashboard/documents" className="btn btn-primary btn-lg">
                Start Free Trial <ArrowRight />
              </Link>
              <Link to="/pricing" className="btn btn-ghost btn-lg">
                View Pricing
              </Link>
            </div>
            <div className="hero-trust">
              <p>TRUSTED BY INNOVATIVE TEAMS WORLDWIDE</p>
              <div className="trust-logos">
                <span className="logo-placeholder">ACME Corp</span>
                <span className="logo-placeholder">GlobalTech</span>
                <span className="logo-placeholder">Nexus Edu</span>
                <span className="logo-placeholder">Stark Ind</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bg-glow"></div>
      </section>

      {/* ── Why Us Section ────────────────────────────── */}
      <section className="why-us-section container py-5">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="badge badge-info mb-3">The Enterprise Differentiator</div>
            <h2 className="mb-4">Why Global Research Teams <br/><span className="text-accent">Choose Academic AI</span></h2>
            <div className="impact-list">
              <div className="impact-item">
                <div className="impact-icon"><Shield size={20} /></div>
                <div>
                  <strong>Zero-Data Leakage Architecture</strong>
                  <p className="text-muted">Your sensitive research never trains public models. Isolated vector stores ensure 100% privacy.</p>
                </div>
              </div>
              <div className="impact-item">
                <div className="impact-icon"><Zap size={20} /></div>
                <div>
                  <strong>Hybrid Intelligence Routing</strong>
                  <p className="text-muted">Automatically switches between GPT-4o, Claude 3.5, and Llama 3 for the perfect balance of cost and reasoning.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-glow p-4 bg-glass-dark">
              <h4 className="mb-3">Unique Edge</h4>
              <ul className="unique-features">
                <li><CheckCircle size={14} className="text-success" /> <strong>Deterministic Output</strong>: Advanced grounding prevents AI hallucinations.</li>
                <li><CheckCircle size={14} className="text-success" /> <strong>Cite-Ready Answers</strong>: Every claim linked directly to your source PDF.</li>
                <li><CheckCircle size={14} className="text-success" /> <strong>Audit-Trail Ready</strong>: Full transparent trace of credit consumption.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────── */}
      <section className="features-section container">
        <h2 className="section-title text-center">Core Infrastructure</h2>
        <p className="section-subtitle text-center">Built for the rigors of modern academic and professional research.</p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon"><Zap size={28} /></div>
            <h3>Intelligent RAG</h3>
            <p>Upload massive document vaults and instantly chat with your data using advanced vector search.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield size={28} /></div>
            <h3>Originality Checker</h3>
            <p>Ensure content integrity with our industry-leading plagiarism detection system.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Globe size={28} /></div>
            <h3>Grammar Pro</h3>
            <p>Improve writing clarity and coherence with AI-driven grammar and style suggestions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Users size={28} /></div>
            <h3>Team Collaboration</h3>
            <p>Shared workspaces, role-based access control, and seamless team management.</p>
          </div>
        </div>
      </section>

      {/* ── Social Proof ─────────────────────────────── */}
      <section className="social-proof-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h4>10M+</h4>
              <p>Documents Processed</p>
            </div>
            <div className="stat-item">
              <h4>99.9%</h4>
              <p>Uptime Guarantee</p>
            </div>
            <div className="stat-item">
              <h4>SOC2</h4>
              <p>Type II Certified</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────── */}
      <section className="cta-section container">
        <div className="cta-box">
          <h2>Ready to transform your research workflow?</h2>
          <p>Deploy our Enterprise suite today and see immediate productivity gains.</p>
          <div className="cta-benefits">
             <span><CheckCircle size={16} /> 14-day free trial</span>
             <span><CheckCircle size={16} /> No credit card required</span>
             <span><CheckCircle size={16} /> Cancel anytime</span>
          </div>
          <Link to="/dashboard/documents" className="btn btn-primary btn-lg">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
