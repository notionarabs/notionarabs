'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

/**
 * Premium ScrollToTop Component
 * Appears after scrolling down and provides a smooth return to the top.
 */
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Toggle visibility based on scroll position
  useEffect(() => {
    // Only track scroll on home page
    if (pathname !== '/') return;

    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Only render on home page
  if (pathname !== '/') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-50 p-4 rounded-2xl bg-white/40 dark:bg-dark-secondary/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-2xl group transition-all duration-300"
          aria-label="العودة للأعلى"
        >
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-primary-500/0 group-hover:bg-primary-500/5 transition-colors duration-500" />
          
          <ChevronUp className="w-6 h-6 text-gray-700 dark:text-white group-hover:text-primary-500 transition-colors" />
          
          {/* Progress ring or indicator could be added here for extra polish */}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
