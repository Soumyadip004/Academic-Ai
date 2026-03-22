import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

/* Layouts */
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

/* Public Pages */
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Faq from './pages/Faq';
import Support from './pages/Support';
import About from './pages/About';
import Login from './pages/Login';

/* Dashboard Pages */
import DocumentUpload from './pages/DocumentUpload';
import RagChat from './pages/RagChat';
import AiChat from './pages/AiChat';
import SpellChecker from './pages/SpellChecker';
import PlagiarismChecker from './pages/PlagiarismChecker';
import Settings from './pages/Settings';
import Documentation from './pages/Documentation';
import Summarizer from './pages/Summarizer';
import DocumentDetail from './pages/DocumentDetail';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public Routes (Marketing Site) ──────────────────────── */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="faq" element={<Faq />} />
          <Route path="support" element={<Support />} />
          <Route path="about" element={<About />} />
        </Route>

        {/* ── Auth Route ──────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />

        {/* ── Dashboard Routes (App Suite) ────────────────────────── */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirect /dashboard to /dashboard/documents */}
          <Route index element={<Navigate to="/dashboard/documents" replace />} />
          <Route path="documents" element={<DocumentUpload />} />
          <Route path="documents/:docId" element={<DocumentDetail />} />
          <Route path="rag-chat" element={<RagChat />} />
          <Route path="ai-chat" element={<AiChat />} />
          <Route path="spell-check" element={<SpellChecker />} />
          <Route path="plagiarism" element={<PlagiarismChecker />} />
          <Route path="summarize" element={<Summarizer />} />
          <Route path="docs" element={<Documentation />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback to Handle Unknown Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

