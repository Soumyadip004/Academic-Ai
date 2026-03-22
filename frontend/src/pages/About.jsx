import React from 'react';
import { 
  Shield, Zap, Globe, Cpu, Target, Rocket, 
  Users, BarChart, CheckCircle, Award, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="about-feature-card">
    <div className="icon-badge bg-primary mb-4" style={{ width: '50px', height: '50px' }}>
      <Icon size={24} />
    </div>
    <h4 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>{title}</h4>
    <p className="text-secondary" style={{ lineHeight: '1.6' }}>{description}</p>
  </div>
);

export default function About() {
  return (
    <div className="about-page">
      {/* ── Background Decoration ── */}
      <div className="hero-glow"></div>

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="about-hero text-center pt-5 pb-5 mt-4">
        <div className="container">
          <div className="badge badge-info mb-3 px-3 py-2">Discover the Difference</div>
          <h1 className="text-gradient mb-4" style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Elevating Research <br /> with Precision AI
          </h1>
          <p className="text-secondary mx-auto mb-5" style={{ maxWidth: '750px', fontSize: '1.3rem', lineHeight: '1.7' }}>
            Academic AI is more than just a chat interface. We are a sophisticated data orchestration 
            engine designed to handle the most rigorous academic and enterprise workflows.
          </p>
          <div className="d-flex justify-content-center gap-4">
            <Link to="/login" className="btn btn-primary btn-lg px-5">Get Started</Link>
            <Link to="/pricing" className="btn btn-ghost btn-lg px-4">See Pricing</Link>
          </div>
        </div>
      </section>

      {/* ── Vision Section with Visuals ────────────────────────── */}
      <section className="py-5 mt-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <span className="text-accent fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>Our DNA</span>
              <h2 className="display-5 fw-bold mt-2 mb-4">Precision, Privacy, <br /> and Citations.</h2>
              <p className="text-secondary mb-4" style={{ fontSize: '1.1rem' }}>
                Generic AI often halluncinates or leaks private data. We built Academic AI to solve 
                the three biggest hurdles in research: accuracy, security, and traceability.
              </p>
              
              <div className="row g-4 mt-2">
                <div className="col-sm-6">
                  <div className="p-3 border-start border-accent border-4 bg-white bg-opacity-5 rounded-end">
                    <h5 className="mb-1">100% Citation Rate</h5>
                    <p className="small text-muted mb-0">Every claim is backed by your own uploaded PDFs.</p>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 border-start border-success border-4 bg-white bg-opacity-5 rounded-end">
                    <h5 className="mb-1">Zero Leak Policy</h5>
                    <p className="small text-muted mb-0">Your research data never leaves your secure instance.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="goal-visual">
                <div className="visual-card ms-lg-auto">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-accent bg-opacity-20 p-2 rounded-circle">
                      <Shield size={20} className="text-accent" />
                    </div>
                    <span className="fw-bold">Enterprise Layer</span>
                  </div>
                  <p className="text-muted small">AES-256 encryption at rest. Multi-user isolation by default.</p>
                </div>
                <div className="visual-card mt-n4 me-lg-5" style={{ position: 'relative', top: '-20px', left: '40px' }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-warning bg-opacity-20 p-2 rounded-circle">
                      <Target size={20} className="text-warning" />
                    </div>
                    <span className="fw-bold">RAG Engine</span>
                  </div>
                  <p className="text-muted small">Local embeddings using <code>all-MiniLM-L6-v2</code> for maximum speed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Scope ─────────────────────────────────────── */}
      <section className="py-5 mt-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold">Built for Comprehensive Analysis</h2>
            <p className="text-secondary">A unified suite for the modern information professional.</p>
          </div>
          
          <div className="about-grid">
            <FeatureCard 
              icon={Zap} 
              title="Knowledge Retrieval" 
              description="Transform your documents into a searchable intelligence hub. Question your library with natural language and get instant, cited answers."
            />
            <FeatureCard 
              icon={Globe} 
              title="Similarity Detection" 
              description="Protect original thought. Compare drafts against a global database and your own internal archives with sub-second latency."
            />
            <FeatureCard 
              icon={Cpu} 
              title="AI Terminology Hub" 
              description="Instantly summarize complex papers, generate abstracts, and extract key findings from hundreds of pages at once."
            />
            <FeatureCard 
              icon={CheckCircle} 
              title="Editorial Suite" 
              description="Advanced grammar, spell-check, and tone-adjustment tools specifically calibrated for academic writing styles."
            />
          </div>
        </div>
      </section>

      {/* ── Differentiators ──────────────────────────────────────── */}
      <section className="py-5 mt-5 bg-glass border-top border-bottom">
        <div className="container">
          <h3 className="text-center mb-5">Why the world's best teams choose us</h3>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="diff-item">
                <Award className="text-accent mb-4" size={40} />
                <h5 className="mb-3">Institutional Control</h5>
                <p className="text-secondary small">Manage access, audit query history, and maintain complete oversight over your team's AI usage.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="diff-item">
                <Users className="text-info mb-4" size={40} />
                <h5 className="mb-3">Collaborative Vectors</h5>
                <p className="text-secondary small">Pooled knowledge bases allow teams to search across thousands of shared documents simultaneously.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="diff-item">
                <BarChart className="text-warning mb-4" size={40} />
                <h5 className="mb-3">High-Performance RAG</h5>
                <p className="text-secondary small">Our local embedding pipeline is optimized for speed, ensuring no latency bottlenecks during peak hours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="container mt-5 pt-5 pb-5">
        <div className="about-cta text-center">
          <h2 className="display-6 fw-bold mb-4">The Future of Knowledge <br /> is Here.</h2>
          <p className="text-secondary mb-5" style={{ fontSize: '1.2rem' }}>Experience the most secure research AI on the market.</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-primary btn-lg px-5">Join the Workspace</Link>
            <Link to="/support" className="btn btn-outline-light btn-lg">Request Demo</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
