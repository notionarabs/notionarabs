'use client';

import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Show loading state while mounting
  if (!mounted) {
    return (
      <div className="w-12 h-6 bg-gray-200 dark:bg-dark-tertiary rounded-full animate-pulse"></div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
        ${theme === 'dark'
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg'
          : 'bg-gray-300 hover:bg-gray-400'
        }
        ${isAnimating ? 'scale-110' : 'scale-100'}
        transform transition-transform duration-200
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Toggle Circle */}
      <div
        className={`
          absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md
          transition-all duration-300 ease-in-out transform
          ${theme === 'dark'
            ? 'ltr:translate-x-6 rtl:-translate-x-[1.6rem]'
            : 'ltr:translate-x-0.5 rtl:-translate-x-0.5'}
          ${isAnimating ? 'scale-110' : 'scale-100'}
        `}
      >
        {/* Icon inside the circle */}
        <div className="flex items-center justify-center w-full h-full">
          {theme === 'dark' ? (
            <svg
              className="w-3 h-3 text-orange-500 transition-all duration-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {/* Moon */}
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              className="w-3 h-3 text-gray-600 transition-all duration-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Sun with rays */}
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          )}
        </div>
      </div>

      {/* Background gradient overlay for dark mode */}
      {theme === 'dark' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/20 to-orange-600/20 animate-pulse"></div>
      )}

      {/* Ripple effect on click */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
      )}
    </button>
  );
}
