import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FolderClosed,
  MessagesSquare,
  Bot,
  SpellCheck,
  SearchCheck,
  Zap,
  Book,
  Settings,
  LogOut,
  GraduationCap,
  Coins,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NAV = [
  { to: '/dashboard/documents', label: 'Study Folders', icon: FolderClosed },
  { to: '/dashboard/rag-chat',  label: 'Knowledge Chat', icon: MessagesSquare },
  { to: '/dashboard/ai-chat',   label: 'AI Analyst',     icon: Bot },
  { to: '/dashboard/spell-check', label: 'Grammar Pro',  icon: SpellCheck },
  { to: '/dashboard/plagiarism',  label: 'Originality Report', icon: SearchCheck },
  { to: '/dashboard/summarize',   label: 'AI Summarizer',  icon: Zap },
];

const PLATFORM_NAV = [
  { to: '/dashboard/docs', label: 'API & Docs', icon: Book },
  { to: '/dashboard/settings', label: 'Organization Settings', icon: Settings },
];

export default function DashboardLayout() {
  const { user, credits, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`app-layout dashboard-layout ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* ── Sidebar ──────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <img src="/logo.png" alt="Academic AI" className="brand-logo-img" />
            <div className="brand-text">
              <span>Academic AI</span>
              <span className="badge-enterprise">Enterprise</span>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">TOOLS</div>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          <div className="nav-section mt-4">PLATFORM</div>
          {PLATFORM_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item${isActive ? ' active' : ''}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = user?.name?.charAt(0) || 'U'; }}
                  style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }}
                />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="user-info">
              <span className="name">{user?.name || 'User'}</span>
              <span className="role" title={user?.email}>{user?.email || 'Individual Plan'}</span>
            </div>
          </div>
          
          <div className="credit-tracker" style={{ padding: '0 8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Coins size={14} color="var(--accent)" /> AI Credits
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: credits > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {credits?.toLocaleString() || 0} left
              </span>
            </div>
            <div className="plag-bar-track" style={{ height: '6px', margin: 0 }}>
              <div 
                className="plag-bar-fill" 
                style={{ 
                  width: `${Math.min((credits / 1000) * 100, 100)}%`, 
                  background: credits > 100 ? 'var(--gradient-primary)' : 'var(--danger)' 
                }} 
              />
            </div>
            {credits === 0 && (
              <Link to="/pricing" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--danger)', marginTop: '8px', textAlign: 'center', textDecoration: 'underline' }}>
                Upgrade to Basic Subscription
              </Link>
            )}
          </div>

          <nav className="footer-nav">
            <button onClick={logout} className="nav-item text-danger" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </nav>
        </div>
      </aside>

      {/* ── Page content ─────────────────────────────── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
