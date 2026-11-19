import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Sign = ({ onClose, defaultTab = 'login' }) => {
  const { login, register } = useAuth()
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register form state
  const [regData, setRegData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    const result = await login(loginData.email, loginData.password)
    setLoginLoading(false)
    if (result.success) {
      onClose && onClose()
    } else {
      setLoginError(result.error || 'Login failed')
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setRegError('')
    setRegSuccess('')
    if (regData.password !== regData.confirmPassword) {
      setRegError('Passwords do not match')
      return
    }
    if (regData.password.length < 6) {
      setRegError('Password must be at least 6 characters')
      return
    }
    setRegLoading(true)
    const result = await register(regData.name, regData.email, regData.password)
    setRegLoading(false)
    if (result.success) {
      setRegSuccess('Account created! Please login.')
      setTimeout(() => setActiveTab('login'), 1200)
    } else {
      setRegError(result.error || 'Registration failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-96 max-w-full mx-4 transition-colors duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-5 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'login'
                ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'register'
                ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="Your password"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            {loginError && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              No account?{' '}
              <button type="button" onClick={() => setActiveTab('register')} className="text-blue-500 hover:underline font-medium">
                Register here
              </button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={regData.name}
                onChange={e => setRegData({ ...regData, name: e.target.value })}
                placeholder="Your name"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={regData.email}
                onChange={e => setRegData({ ...regData, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={regData.password}
                onChange={e => setRegData({ ...regData, password: e.target.value })}
                placeholder="At least 6 characters"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input
                type="password"
                value={regData.confirmPassword}
                onChange={e => setRegData({ ...regData, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            {regError && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{regError}</p>
            )}
            {regSuccess && (
              <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">{regSuccess}</p>
            )}
            <button
              type="submit"
              disabled={regLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {regLoading ? 'Creating account...' : 'Create Account'}
            </button>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button type="button" onClick={() => setActiveTab('login')} className="text-blue-500 hover:underline font-medium">
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default Sign
