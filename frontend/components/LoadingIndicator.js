'use client';

import { useLoading } from '../contexts/LoadingContext';

export default function LoadingIndicator() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-dark-primary/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex items-center gap-2">
        {/* Three bouncing circle icons */}
        <div className="w-4 h-4 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-4 h-4 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-4 h-4 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
