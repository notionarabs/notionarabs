'use client';

import { createContext, useContext, useState, useRef } from 'react';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState('navigation'); // Default to navigation (Top Bar)
  const loadingStartTimeRef = useRef(null);

  const setLoading = (loading, type = 'navigation') => {
    if (loading) {
      // Track when loading starts
      loadingStartTimeRef.current = Date.now();
      setLoadingType(type);
      setIsLoading(true);
    } else {
      setIsLoading(false);
      // Reset type after a delay
      setTimeout(() => setLoadingType('navigation'), 500);
    }
  };

  const getLoadingStartTime = () => loadingStartTimeRef.current;

  return (
    <LoadingContext.Provider value={{ isLoading, loadingType, setLoading, getLoadingStartTime }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
