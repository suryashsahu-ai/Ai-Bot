import React, { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { chatStorage } from '../utils/chatStorage'
import { chatApi } from '../api/botapi'

const Sidebar = ({ selectedChat, setSelectedChat, setIsSidebarOpen, onNewChat, onLoadChat }) => {
  const { isDarkMode } = useTheme()
  const { isLoggedIn, user, token } = useAuth()
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const loadChats = useCallback(async () => {
    setLoading(true)
    if (isLoggedIn && token) {
      try {
        const res = await chatApi.getConversations(token)
        if (res.ok) {
          const data = await res.json()
          setChatHistory(data)
        }
      } catch {
        setChatHistory([])
      }
    } else {
      setChatHistory(chatStorage.getAllChats())
    }
    setLoading(false)
  }, [isLoggedIn, token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChats()
  }, [loadChats])

  // Listen for localStorage chat save events (guest users)
  useEffect(() => {
    if (!isLoggedIn) {
      const refresh = () => loadChats()
      window.addEventListener('storage', refresh)
      window.addEventListener('chatSaved', refresh)
      return () => {
        window.removeEventListener('storage', refresh)
        window.removeEventListener('chatSaved', refresh)
      }
    }
  }, [isLoggedIn, loadChats])

  const createNewChat = () => {
    if (onNewChat) onNewChat()
    // On mobile, close sidebar after action
    if (window.innerWidth < 1024) setIsSidebarOpen(false)
  }

  const deleteChat = async (chatId, e) => {
    e.stopPropagation()
    if (isLoggedIn && token) {
      try {
        await chatApi.deleteConversation(token, chatId)
      } catch (err) {
        console.error('Delete failed:', err)
      }
      setChatHistory(prev => prev.filter(c => (c._id || c.id) !== chatId))
    } else {
      chatStorage.deleteChat(chatId)
      setChatHistory(prev => prev.filter(c => c.id !== chatId))
    }
    if (selectedChat === chatId) setSelectedChat(null)
  }

  const handleChatClick = (chatId) => {
    if (onLoadChat) onLoadChat(chatId)
    setSelectedChat(chatId)
    // On mobile, close sidebar after selecting a chat
    if (window.innerWidth < 1024) setIsSidebarOpen(false)
  }

  // Helpers to handle both backend format (_id, title, updatedAt) and localStorage format (id, messages, timestamp)
  const getChatId = (chat) => chat._id || chat.id
  const getChatTitle = (chat) => {
    if (chat.title && chat.title !== 'New Chat') return chat.title
    if (chat.messages && chat.messages.length > 0) return chatStorage.generateTitle(chat.messages)
    return 'New Chat'
  }
  const getChatTimestamp = (chat) => {
    const ts = chat.updatedAt || chat.timestamp
    return ts ? chatStorage.formatTimestamp(ts) : ''
  }

  return (
    <aside className={`
      h-full w-full flex flex-col border-r transition-colors duration-300
      ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    `}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
        <div className='flex items-center justify-between mb-3'>
          <h2 className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Chat History
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
            title="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <button
          onClick={createNewChat}
          className='w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm font-medium flex items-center justify-center gap-2'
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className='flex-1 overflow-y-auto'>
        <div className='p-2'>
          {loading && (
            <p className={`text-xs text-center mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Loading...
            </p>
          )}
          {!loading && chatHistory.length === 0 && (
            <div className="text-center mt-8 px-4">
              <svg className={`w-10 h-10 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No chats yet
              </p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-500'}`}>
                Start a new conversation!
              </p>
            </div>
          )}

          {chatHistory.map((chat) => {
            const id = getChatId(chat)
            const isSelected = selectedChat === id
            return (
              <div
                key={id}
                onClick={() => handleChatClick(id)}
                className={`p-3 rounded-lg cursor-pointer transition-all mb-1 group relative ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-blue-900/70 to-purple-900/70 border border-blue-700'
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                    : isDarkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                }`}
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1 min-w-0'>
                    <h3 className={`font-medium truncate text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {getChatTitle(chat)}
                    </h3>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5 block`}>
                      {getChatTimestamp(chat)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => deleteChat(id, e)}
                    className={`opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded transition-all ${
                      isDarkMode ? 'hover:bg-red-900/60 text-red-400' : 'hover:bg-red-100 text-red-500'
                    }`}
                    title="Delete chat"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer: user info */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
        {isLoggedIn && user ? (
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0'>
              <span className='text-white text-sm font-semibold'>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {user.name || 'User'}
              </p>
              <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {user.email || ''}
              </p>
            </div>
          </div>
        ) : (
          <div className='text-center'>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              🔒 Login to save chats to cloud
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
