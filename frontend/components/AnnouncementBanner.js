'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Megaphone, Info } from 'lucide-react';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  // Check if dismissed before
  useEffect(() => {
    const dismissed = localStorage.getItem('payment-banner-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('payment-banner-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-[60] bg-gradient-to-r from-primary-600 via-orange-500 to-rose-500 dark:from-primary-700 dark:via-orange-600 dark:to-rose-700 overflow-hidden"
          dir="rtl"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute top-1/2 left-[10%] w-1 h-1 bg-white rounded-full animate-ping" />
             <div className="absolute top-1/3 right-[15%] w-1 h-1 bg-white rounded-full animate-pulse" />
          </div>

          <div className="container-custom relative py-2.5 sm:py-3 px-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-white/20 backdrop-blur-md items-center justify-center text-white border border-white/30 shadow-inner">
                <Zap className="w-4 h-4 animate-bounce" />
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm font-black text-white tracking-tight leading-relaxed">
                <span className="opacity-80 ml-1.5 hidden sm:inline">إعلان هام:</span>
                نحن نعمل حالياً على تفعيل نظام المدفوعات التلقائي وتطوير ميزات حصرية للمبدعين! ابقوا بالقرب 🚀
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/20 text-white transition-colors group"
              aria-label="إغلاق الإعلان"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
