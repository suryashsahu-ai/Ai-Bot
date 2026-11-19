import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import QuerySection from './QuerySection'
import { useAuth } from '../context/AuthContext'
import { chatStorage } from '../utils/chatStorage'
import { chatApi } from '../api/botapi'

const ChatArea = forwardRef((_props, ref) => {
  const { isLoggedIn, token } = useAuth()

  useImperativeHandle(ref, () => ({
    startNewChat,
    loadChat
  }))

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  // Store the backend conversation _id (string) OR localStorage chat id
  const currentChatIdRef = useRef(null)
  const [currentChatId, setCurrentChatId] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const querySectionRef = useRef(null)

  // Keep ref in sync with state to avoid stale closures in async functions
  useEffect(() => {
    currentChatIdRef.current = currentChatId
  }, [currentChatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const makeTimestamp = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Build history array for AI context
  const buildHistory = (msgs) =>
    msgs.map(m => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.content
    }))

  const saveToLocalStorage = (msgs, chatId) => {
    if (msgs.length === 0) return chatId
    const chatData = { id: chatId, messages: msgs, timestamp: new Date().toISOString() }
    const savedId = chatStorage.saveChat(chatData)
    return savedId
  }

  const startNewChat = () => {
    if (!isLoggedIn && messages.length > 0) {
      saveToLocalStorage(messages, currentChatIdRef.current)
    }
    setMessages([])
    setCurrentChatId(null)
    currentChatIdRef.current = null
    setChatStarted(false)
    setTimeout(() => {
      if (querySectionRef.current?.focusInput) {
        querySectionRef.current.focusInput()
      } else if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }

  // Load a chat — from backend if logged in, localStorage if not
  const loadChat = async (chatId) => {
    if (isLoggedIn && token) {
      try {
        const res = await chatApi.getConversation(token, chatId)
        if (res.ok) {
          const data = await res.json()
          const msgs = (data.messages || []).map((m, i) => ({
            id: i,
            type: m.role === 'user' ? 'user' : 'bot',
            content: m.content,
            timestamp: m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''
          }))
          setMessages(msgs)
          setCurrentChatId(chatId)
          currentChatIdRef.current = chatId
          setChatStarted(true)
          return
        }
      } catch (e) {
        console.error('loadChat error', e)
      }
    }
    // Fallback: localStorage
    const chat = chatStorage.getChatById(chatId)
    if (chat) {
      setMessages(chat.messages)
      setCurrentChatId(chatId)
      currentChatIdRef.current = chatId
      setChatStarted(true)
    }
  }

  // Persist to localStorage on message change (non-logged-in only)
  useEffect(() => {
    if (!isLoggedIn && messages.length > 0 && chatStarted) {
      const timeoutId = setTimeout(() => {
        const savedId = saveToLocalStorage(messages, currentChatIdRef.current)
        if (savedId && savedId !== currentChatIdRef.current) {
          setCurrentChatId(savedId)
          currentChatIdRef.current = savedId
        }
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [messages, chatStarted, isLoggedIn])

  // Core AI call — handles both logged-in (backend) and guest (simple chat endpoint)
  const callAI = async (userMessage, updatedMessages) => {
    const history = buildHistory(updatedMessages)
    try {
      if (isLoggedIn && token) {
        // Get or create conversation — use ref to avoid race conditions
        let convId = currentChatIdRef.current
        if (!convId) {
          const createRes = await chatApi.createConversation(token)
          if (!createRes.ok) throw new Error('Failed to create conversation')
          const createData = await createRes.json()
          convId = createData._id || createData.id
          setCurrentChatId(convId)
          currentChatIdRef.current = convId
        }
        const res = await chatApi.sendMessage(token, convId, userMessage, history)
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.message || `Server error ${res.status}`)
        }
        const data = await res.json()
        return data.assistantMessage?.content || data.reply || 'No response received'
      } else {
        // Guest: simple stateless endpoint
        const res = await chatApi.quickChat(userMessage, history)
        if (!res.ok) {
          const error = await res.json().catch(() => ({}))
          throw new Error(error.message || error.error || `Server error ${res.status}`)
        }
        const data = await res.json()
        return data.reply || data.response || 'No response received'
      }
    } catch (err) {
      const isNetwork = err.message.toLowerCase().includes('fetch') ||
        err.message.toLowerCase().includes('failed to fetch') ||
        err.message.toLowerCase().includes('network')
      if (isNetwork) {
        return "⚠️ Can't reach the API. Make sure the backend is running and the frontend API URL or development proxy points to it."
      }
      return `❌ Error: ${err.message}`
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return

    const currentMessage = inputMessage.trim()
    setInputMessage('')
    setChatStarted(true)

    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: currentMessage,
      timestamp: makeTimestamp()
    }

    // Add user message immediately so UI responds instantly
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsTyping(true)

    const reply = await callAI(currentMessage, updatedMessages)
    setIsTyping(false)

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      type: 'bot',
      content: reply,
      timestamp: makeTimestamp()
    }])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleQueryMessage = async (query) => {
    if (!query.trim() || isTyping) return
    setChatStarted(true)

    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: makeTimestamp()
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsTyping(true)

    const reply = await callAI(query, updatedMessages)
    setIsTyping(false)

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      type: 'bot',
      content: reply,
      timestamp: makeTimestamp()
    }])
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-3">
        {!chatStarted ? (
          <QuerySection
            ref={querySectionRef}
            onSendMessage={handleQueryMessage}
          />
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[88%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm sm:text-base leading-relaxed ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p className={`text-xs mt-1.5 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mr-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex space-x-1 items-center h-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Login nudge for guests */}
        {!isLoggedIn && chatStarted && messages.length > 0 && (
          <div className="flex justify-center pt-1">
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              💡 Login to save your chats across sessions
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {chatStarted && (
        <div className="shrink-0 px-2 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-300">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage() }}
            className="relative w-full max-w-3xl mx-auto"
          >
            <div className="relative bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus-within:shadow-md focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all">
              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="w-full min-h-[44px] text-sm sm:text-base bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none px-4 py-3 pr-12"
                rows={1}
                style={{ maxHeight: '200px' }}
                disabled={isTyping}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="absolute right-2 bottom-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                title="Send message"
              >
                {isTyping ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
              AI can make mistakes. Verify important information.
            </p>
          </form>
        </div>
      )}
    </div>
  )
})

export default ChatArea
