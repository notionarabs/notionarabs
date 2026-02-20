'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TelegramPopup({ isOpen, onClose, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRTL, setIsRTL] = useState(true); // Default to RTL for Arabic

  useEffect(() => {
    // Detect document direction
    if (typeof window !== 'undefined') {
      const htmlDir = document.documentElement.getAttribute('dir');
      const isRTLDirection = htmlDir === 'rtl' ||
        (htmlDir === null && window.getComputedStyle(document.documentElement).direction === 'rtl');
      setIsRTL(isRTLDirection);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Show popup with animation - NO scroll blocking
      setTimeout(() => setIsVisible(true), 10);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    // Non-blocking slide-in - position based on language direction
    // Responsive: full width on mobile, centered. Smaller width on desktop
    <div
      id="telegram-popup"
      className={`fixed bottom-0 sm:bottom-4 z-[60] w-full sm:w-auto sm:max-w-sm transition-all duration-500 ease-out ${isRTL

        ? 'left-0 sm:left-4'
        : 'right-0 sm:right-4'
        } ${isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Card - No backdrop, no blocking */}
      <div
        className={`relative bg-white dark:bg-dark-secondary rounded-t-2xl sm:rounded-2xl shadow-soft dark:shadow-dark-soft border border-gray-200 dark:border-dark-card-border transform transition-all duration-500 hover:shadow-medium dark:hover:shadow-dark-medium ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
      >
        {/* Compact Header with Icon */}
        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-b border-gray-200 dark:border-dark-card-border">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-orange-500 dark:to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.608 7.592c-.119.537-.43.668-.873.416l-2.41-1.777-1.163 1.118c-.129.129-.237.237-.486.237l.173-2.454 4.47-4.035c.194-.173-.043-.268-.301-.096l-5.52 3.48-2.38-.742c-.518-.161-.531-.518.107-.775l9.333-3.598c.43-.161.807.096.668.581z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-accent-900 dark:text-dark-text-primary">
              انضم إلى مجتمعنا على تيليجرام
            </h3>
            <p className="text-xs text-accent-600 dark:text-dark-text-secondary mt-0.5 sm:mt-1">
              احصل على آخر الأخبار والتحديثات
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-quaternary transition-colors flex-shrink-0"
            aria-label="إغلاق"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Compact Content */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Compact CTA Button */}
          <Link
            href="https://t.me/Notion_Arabs"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-primary-600 hover:bg-primary-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all duration-300 transform hover:scale-105 shadow-soft hover:shadow-medium dark:shadow-dark-soft dark:hover:shadow-dark-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.608 7.592c-.119.537-.43.668-.873.416l-2.41-1.777-1.163 1.118c-.129.129-.237.237-.486.237l.173-2.454 4.47-4.035c.194-.173-.043-.268-.301-.096l-5.52 3.48-2.38-.742c-.518-.161-.531-.518.107-.775l9.333-3.598c.43-.161.807.096.668.581z" />
            </svg>
            <span>انضم الآن</span>
          </Link>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="w-full text-xs text-accent-600 dark:text-dark-text-secondary hover:text-accent-700 dark:hover:text-dark-text-primary transition-colors text-center py-1"
          >
            لا تظهر لي مرة أخرى
          </button>
        </div>
      </div>
    </div>
  );
}

