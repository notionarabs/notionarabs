'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

/**
 * Premium ScrollToTop Component
 * Appears after scrolling down and provides a smooth return to the top.
 * Uses CSS transitions instead of framer-motion for a smaller bundle footprint.
 */
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') return;

    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (pathname !== '/') return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="العودة للأعلى"
      className={`fixed bottom-8 left-8 z-50 p-4 rounded-2xl bg-white/40 dark:bg-dark-secondary/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-2xl group transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 active:scale-90 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-5 pointer-events-none'
      }`}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-primary-500/0 group-hover:bg-primary-500/5 transition-colors duration-500" />
      <ChevronUp className="w-6 h-6 text-gray-700 dark:text-white group-hover:text-primary-500 transition-colors" />
    </button>
  );
}
