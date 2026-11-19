import React, { createContext, useContext, useState } from 'react'
import { authApi } from '../api/botapi'

const AuthContext = createContext(null)

// Read auth from localStorage once at module load — avoids setState-in-effect
function getInitialAuth() {
  try {
    const token = localStorage.getItem('auth_token')
    const user = JSON.parse(localStorage.getItem('auth_user') || 'null')
    if (token && user) return { token, user, isLoggedIn: true }
  } catch { /* ignore */ }
  return { token: null, user: null, isLoggedIn: false }
}

export const AuthProvider = ({ children }) => {
  const initial = getInitialAuth()
  const [user, setUser] = useState(initial.user)
  const [token, setToken] = useState(initial.token)
  const [isLoggedIn, setIsLoggedIn] = useState(initial.isLoggedIn)

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password)
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.message || 'Login failed' }
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      setIsLoggedIn(true)
      return { success: true }
    } catch {
      return { success: false, error: 'Network error. Is the server running?' }
    }
  }

  const register = async (name, email, password) => {
    try {
      const res = await authApi.register(name, email, password)
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.message || 'Registration failed' }
      return { success: true }
    } catch {
      return { success: false, error: 'Network error. Is the server running?' }
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, loading: false, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
