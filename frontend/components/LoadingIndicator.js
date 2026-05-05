'use client';

import { useEffect, useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-dark-primary/60 backdrop-blur-xl transition-all duration-500">
    <div className="relative flex flex-col items-center">
      <div className="relative w-24 h-24">
        {/* Outer Glow Ring */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-4 rounded-full bg-primary-500/20 blur-xl"
        />
        
        {/* Orbiting Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-primary-500/10 border-t-primary-500 border-r-primary-500 shadow-glow-primary"
        />
        
        {/* Inner Pulsing Core */}
        <div className="absolute inset-4 rounded-full bg-white dark:bg-dark-secondary shadow-large flex items-center justify-center border border-gray-100 dark:border-dark-card-border overflow-hidden">
          <motion.div 
             animate={{ 
               scale: [1, 1.5, 1],
               opacity: [0.5, 0.8, 0.5]
             }}
             transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
             className="w-4 h-4 rounded-full bg-primary-500 blur-[2px]"
          />
        </div>

        {/* Floating Particles */}
        {[0, 120, 240].map((angle, i) => (
          <motion.div
            key={i}
            animate={{ 
              rotate: angle + 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-400 shadow-glow-primary" />
          </motion.div>
        ))}
      </div>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.3em] animate-pulse"
        dir="rtl"
      >
        جاري التحميل...
      </motion.p>
    </div>
  </div>
);

export default function LoadingIndicator() {
  const { isLoading, loadingType } = useLoading();

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {loadingType === 'navigation' ? <NavigationLoader /> : <GlobalSpinner />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
