'use client';

import { useEffect, useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';

const NavigationLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress
    setProgress(30);

    // Slow progress simulation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + (Math.random() * 10);
      });
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 shadow-[0_0_10px_rgba(251,146,60,0.5)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

const GlobalSpinner = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 dark:bg-black/60 backdrop-blur-md transition-all duration-500 animate-fadeIn">
    <div className="relative flex flex-col items-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-white/10 opacity-50"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-primary-600 dark:border-t-primary-400 border-r-transparent border-b-transparent border-l-transparent animate-spin shadow-lg shadow-primary-500/20"></div>
        <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-primary-500 dark:bg-primary-400 animate-ping opacity-75"></div>
      </div>
    </div>
  </div>
);

export default function LoadingIndicator() {
  const { isLoading, loadingType } = useLoading();

  if (!isLoading) return null;

  return loadingType === 'navigation' ? <NavigationLoader /> : <GlobalSpinner />;
}
