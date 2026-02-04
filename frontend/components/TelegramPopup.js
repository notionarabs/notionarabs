import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import Link from 'next/link';

export default function TelegramPopup({ isOpen, onClose, onDismiss }) {
  const [isRTL, setIsRTL] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const htmlDir = document.documentElement.getAttribute('dir');
      setIsRTL(htmlDir === 'rtl');
    }
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleDismiss = () => {
    if (onDismiss) onDismiss();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className={`fixed bottom-0 sm:bottom-4 z-[60] w-full sm:w-auto sm:max-w-sm ${isRTL ? 'left-0 sm:left-4' : 'right-0 sm:right-4'
            }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="bg-white dark:bg-dark-secondary rounded-t-2xl sm:rounded-2xl shadow-soft dark:shadow-dark-soft border border-gray-200 dark:border-dark-card-border overflow-hidden">
            <div className="flex items-start gap-3 p-4 border-b border-gray-200 dark:border-dark-card-border">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-orange-500 dark:to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-accent-900 dark:text-dark-text-primary">
                  انضم لمجتمعنا
                </h3>
                <p className="text-xs text-accent-600 dark:text-dark-text-secondary mt-0.5">
                  تحديثات وأخبار نوشن أولاً بأول
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-quaternary transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <Link
                href="https://t.me/Notion_Arabs"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold text-sm rounded-lg transition-all duration-300 shadow-soft"
              >
                <Send className="w-4 h-4" />
                <span>انضم الآن</span>
              </Link>

              <button
                onClick={handleDismiss}
                className="w-full text-xs text-accent-600 dark:text-dark-text-secondary hover:text-accent-700 dark:hover:text-dark-text-primary transition-colors text-center"
              >
                عدم الإظهار مرة أخرى
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

