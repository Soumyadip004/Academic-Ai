import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000,
})

// ── Auth Interceptor ───────────────────────────────────────
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('academic_ai_user')
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)
      if (user && user.id) {
        config.headers['X-User-Id'] = user.id
      }
    } catch (e) {
      console.warn('Failed to parse user for auth header', e)
    }
  }
  return config
})

// ── Auth ───────────────────────────────────────────────────
export async function deleteAccount() {
  const { data } = await api.delete('/auth/delete-account')
  return data
}

// ── Documents ──────────────────────────────────────────────
export async function uploadDocument(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function listDocuments() {
  const { data } = await api.get('/documents/')
  return data
}

export async function deleteDocument(docId) {
  const { data } = await api.delete(`/documents/${docId}`)
  return data
}

// ── RAG Chat ───────────────────────────────────────────────
export async function ragChat(question, sessionId = 'default', topK = 5) {
  const { data } = await api.post('/rag/chat', {
    question,
    session_id: sessionId,
    top_k: topK
  })
  return data
}

// ── AI Chat ────────────────────────────────────────────────
export async function aiChat(message, sessionId = 'default') {
  const { data } = await api.post('/chat', {
    message,
    session_id: sessionId
  })
  return data
}

// ── Spell Check ────────────────────────────────────────────
export async function spellCheck(text, language = 'en-US') {
  const { data } = await api.post('/spellcheck/check', { text, language })
  return data
}

// ── Plagiarism ─────────────────────────────────────────────
export async function plagiarismCheck(text) {
  const { data } = await api.post('/plagiarism/check', { text })
  return data
}
