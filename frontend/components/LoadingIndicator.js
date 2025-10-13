'use client';

import { useLoading } from '../contexts/LoadingContext';

export default function LoadingIndicator() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-dark-primary/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center gap-4">
        {/* Simple elegant spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-orange-200 dark:border-orange-900/40 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 dark:border-t-orange-500 rounded-full animate-spin"></div>
        </div>

        {/* Loading text */}
        <p className="text-sm font-medium text-accent-600 dark:text-dark-text-secondary animate-pulse">
          جاري التحميل...
        </p>
      </div>
    </div>
  );
}
