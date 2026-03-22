import { Outlet, NavLink, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="public-layout">
      {/* ── Public Header ───────────────────────────────── */}
      <header className="public-header">
        <div className="container header-inner">
          <Link to="/" className="brand-logo">
            <img src="/logo.png" alt="Academic AI" className="brand-logo-img" />
            <span>Academic AI <span className="brand-badge">Enterprise</span></span>
          </Link>

          <nav className="header-nav">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
            <NavLink to="/pricing" className={({ isActive }) => (isActive ? 'active' : '')}>Pricing</NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>About</NavLink>
            <NavLink to="/faq" className={({ isActive }) => (isActive ? 'active' : '')}>FAQ</NavLink>
            <NavLink to="/support" className={({ isActive }) => (isActive ? 'active' : '')}>Support</NavLink>
          </nav>

          <div className="header-actions">
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────── */}
      <main className="public-content">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="public-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <div className="brand-logo">
              <img src="/logo.png" alt="Academic AI" className="brand-logo-img" />
              <span>Academic AI</span>
            </div>
            <p>The premier enterprise platform for academic and corporate research. Powerful AI tools designed for teams.</p>
            <div className="social-links">
              <a href="#"><Github size={20} /></a>
              <a href="#"><Twitter size={20} /></a>
              <a href="https://www.linkedin.com/in/soumyadip-c-251026229/" target="_blank" rel="noopener noreferrer"><Linkedin size={20} /></a>
            </div>
            <a href="mailto:soumyadipchanda.work@gmail.com" className="d-block mt-3 text-secondary" style={{ fontSize: '0.85rem' }}>
              soumyadipchanda.work@gmail.com
            </a>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/changelog">Changelog</Link>
            </div>
            <div className="link-group">
              <h4>Resources</h4>
              <Link to="/faq">Documentation</Link>
              <Link to="/support">Support</Link>
              <Link to="/api">API Reference</Link>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Academic AI Enterprise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
