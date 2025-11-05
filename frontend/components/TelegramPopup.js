'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TelegramPopup({ isOpen, onClose, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);

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
    // Non-blocking slide-in from bottom-right corner
    <div 
      className={`fixed bottom-4 right-4 z-[60] w-full max-w-sm transition-all duration-500 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      dir="rtl"
    >
      {/* Card - No backdrop, no blocking */}
      <div
        className={`relative bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-card-border transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Compact Header with Icon */}
        <div className="flex items-start gap-3 p-4 border-b border-gray-200 dark:border-dark-card-border">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.608 7.592c-.119.537-.43.668-.873.416l-2.41-1.777-1.163 1.118c-.129.129-.237.237-.486.237l.173-2.454 4.47-4.035c.194-.173-.043-.268-.301-.096l-5.52 3.48-2.38-.742c-.518-.161-.531-.518.107-.775l9.333-3.598c.43-.161.807.096.668.581z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 dark:text-dark-text-primary">
              انضم إلى مجتمعنا على تيليجرام
            </h3>
            <p className="text-xs text-gray-600 dark:text-dark-text-secondary mt-1">
              احصل على آخر الأخبار والتحديثات
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-6 h-6 rounded-full bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-primary transition-colors flex-shrink-0"
            aria-label="إغلاق"
          >
            <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Compact Content */}
        <div className="p-4 space-y-3">
          {/* Compact CTA Button */}
          <Link
            href="https://t.me/notionarabs"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
            className="w-full text-xs text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary transition-colors text-center"
          >
            لا تظهر لي مرة أخرى
          </button>
        </div>
      </div>
    </div>
  );
}

