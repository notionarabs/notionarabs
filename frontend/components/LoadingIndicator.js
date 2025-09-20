'use client';

import { useLoading } from '../contexts/LoadingContext';

export default function LoadingIndicator() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="relative">
        {/* Main loading spinner */}
        <div className="loading-spinner"></div>

        {/* Outer glow ring */}
        <div className="loading-spinner-outer"></div>

        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="loading-dot"></div>
        </div>

        {/* Loading text */}
        <div className="mt-6 text-center">
          <p className="loading-text">
            جاري التحميل...
          </p>
        </div>
      </div>
    </div>
  );
}
