import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { useTheme } from '../context/ThemeContext'

const QuerySection = forwardRef(({ onSendMessage }, ref) => {
  const { isDarkMode } = useTheme()
  const [query, setQuery] = useState('')
  const textareaRef = useRef(null)

  useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (textareaRef.current) textareaRef.current.focus()
    }
  }))

  const handleSend = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    setQuery('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onSendMessage(trimmed)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e) => {
    setQuery(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  const suggestions = [
    "How to improve SEO rankings?",
    "Best social media strategy",
    "Content marketing tips",
    "Email marketing templates",
    "PPC advertising basics",
    "How to write better code?",
    "Explain machine learning"
  ]

  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="w-full max-w-3xl px-4 flex flex-col items-center justify-center">
        {/* Heading */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Digital Market AI Bot
          </h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
            Your general-purpose AI assistant — marketing, coding, education & more
          </p>
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="relative w-full">
          <div className={`relative w-full border rounded-xl shadow-sm focus-within:shadow-md focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all ${
            isDarkMode
              ? 'bg-gray-800 border-gray-600'
              : 'bg-white border-gray-300'
          }`}>
            <textarea
              ref={textareaRef}
              value={query}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className={`w-full px-4 py-3 pr-12 bg-transparent resize-none focus:outline-none text-sm sm:text-base ${
                isDarkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
              }`}
              rows={1}
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="absolute right-2 bottom-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>

        {/* Suggestion chips */}
        {query.length === 0 && (
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className={`px-3 py-1.5 border rounded-full text-xs sm:text-sm transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export default QuerySection
