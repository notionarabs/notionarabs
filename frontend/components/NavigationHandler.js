'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '../contexts/LoadingContext';

export default function NavigationHandler() {
  const pathname = usePathname();
  const { setLoading } = useLoading();

  useEffect(() => {
    // Set loading to false when pathname changes (page has loaded)
    setLoading(false);
  }, [pathname, setLoading]);

  // Handle browser navigation events
  useEffect(() => {
    const handleBeforeUnload = () => {
      setLoading(true);
    };

    const handlePopState = () => {
      setLoading(true);
    };

    // Listen for browser back/forward navigation
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setLoading]);

  return null; // This component doesn't render anything
}
