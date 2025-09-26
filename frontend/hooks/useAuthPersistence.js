'use client';

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';

export const useAuthPersistence = () => {
  const { user, loading, checkAuthStatus } = useAuth();

  useEffect(() => {
    // Re-check authentication when the component mounts
    // This helps with browser back navigation issues
    const recheckAuth = async () => {
      const token = Cookies.get('authToken');
      if (token && !user && !loading) {
        try {
          await checkAuthStatus();
        } catch (error) {
          console.error('Failed to re-check auth on mount:', error);
        }
      }
    };

    // Small delay to ensure the auth context has initialized
    const timeoutId = setTimeout(recheckAuth, 100);

    return () => clearTimeout(timeoutId);
  }, [user, loading, checkAuthStatus]);

  return { user, loading };
};
