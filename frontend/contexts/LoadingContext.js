'use client';

import { createContext, useContext, useState, useRef } from 'react';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingStartTimeRef = useRef(null);

  const setLoading = (loading) => {
    if (loading) {
      // Track when loading starts
      loadingStartTimeRef.current = Date.now();
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  };

  const getLoadingStartTime = () => loadingStartTimeRef.current;

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, getLoadingStartTime }}>
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
