const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/auth`

export const authApi = {
  login: (email, password) =>
    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }),
  register: (name, email, password) =>
    fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
}

export const chatApi = {
  quickChat: (message, messages) =>
    fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, messages })
    }),

  getConversations: (token) =>
    fetch(`${API_BASE}/conversations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  createConversation: (token) =>
    fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    }),

  getConversation: (token, id) =>
    fetch(`${API_BASE}/conversations/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  deleteConversation: (token, id) =>
    fetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  sendMessage: (token, conversationId, content, messages) =>
    fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, messages })
    })
}
