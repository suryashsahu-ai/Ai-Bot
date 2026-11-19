import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import Sign from './Sign'

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [authModal, setAuthModal] = useState(null) // null | 'login' | 'register'
  const { isDarkMode, toggleTheme } = useTheme()
  const { isLoggedIn, user, logout } = useAuth()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      <header className='flex items-center justify-between h-14 px-4 w-full shrink-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300'>
        <div className='flex items-center gap-3'>
          <div className='w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className='hidden md:block text-xl font-bold text-gray-800 dark:text-gray-100'>Digital Market AI Bot</h1>
        </div>

        <div className='flex items-center gap-2 md:gap-3'>
          {/* Sidebar toggle */}
          <button
            onClick={toggleSidebar}
            className='flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            title='Toggle sidebar'
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className='p-1.5 md:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Auth Buttons */}
          {isLoggedIn ? (
            <div className='flex items-center gap-2'>
              <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg'>
                <div className='w-6 h-6 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                  <span className='text-white text-xs font-bold'>
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </span>
                </div>
                <span className='text-sm font-medium text-gray-800 dark:text-gray-100 max-w-24 truncate'>
                  {user?.name || 'User'}
                </span>
              </div>
              <button
                onClick={logout}
                className='px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              >
                Logout
              </button>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setAuthModal('login')}
                className='px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              >
                Login
              </button>
              <button
                onClick={() => setAuthModal('register')}
                className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 text-sm'
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {authModal && (
        <Sign
          defaultTab={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  )
}

export default Header
