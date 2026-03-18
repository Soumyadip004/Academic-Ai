import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { LogIn, Compass } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { user, loginWithGoogle } = useAuth();

  if (user) {
    return <Navigate to="/dashboard/documents" replace />;
  }

  return (
    <div className="fade-in" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Left panel - Branding */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-primary))', borderRight: '1px solid var(--border-glass)', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '24px', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Academic AI<br/>Enterprise
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.6 }}>
          The world's most secure, scalable, and intelligent platform for document analysis and research.
        </p>
        
        <div style={{ marginTop: '48px', display: 'flex', gap: '20px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} className="text-info" />
            <span>SOC2 Compliant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} className="text-success" />
            <span>Encrypted at Rest</span>
          </div>
        </div>
      </div>

      {/* Right panel - Login Box */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '48px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
          <p className="text-muted" style={{ textAlign: 'center', marginBottom: '32px' }}>Sign in to access your secure workspace.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '8px 0' }}>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                loginWithGoogle(credentialResponse);
              }}
              onError={() => {
                console.error('Login Failed');
              }}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              width="324"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
            <span style={{ padding: '0 12px' }}>Enterprise SSO</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
          </div>

          <div className="form-group mb-3">
            <input type="text" placeholder="name@company.com" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <button className="btn btn-primary w-100" disabled style={{ opacity: 0.5 }}>Continue with SSO</button>

        </div>
      </div>
    </div>
  );
}
