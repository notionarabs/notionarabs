'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '../contexts/LoadingContext';

export default function NavigationHandler() {
  const pathname = usePathname();
  const { setLoading, getLoadingStartTime } = useLoading();

  useEffect(() => {
    // Calculate how long the loading state has been active
    const startTime = getLoadingStartTime();
    const loadingDuration = startTime ? Date.now() - startTime : 0;

    // Minimum loading duration in milliseconds (500ms for better UX)
    const minLoadingDuration = 500;
    const remainingTime = Math.max(0, minLoadingDuration - loadingDuration);

    // Set loading to false after minimum duration
    const timer = setTimeout(() => {
      setLoading(false);
    }, remainingTime);

    // Exact pages where we don't want automatic scroll to top (not sub-pages)
    const noScrollPages = [
      '/',
      '/templates',
      '/creators',
      '/blog',
      '/about',
      '/pricing',
      '/features',
      '/help',
      '/press',
      '/privacy',
      '/terms',
      '/careers',
      '/contact',
      '/cookies'
    ];

    // Check if current page should skip auto-scroll (exact match only)
    const shouldSkipScroll = noScrollPages.includes(pathname);

    // Only scroll to top if not on main pages
    if (!shouldSkipScroll) {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        // Fallback for environments without smooth behavior support
        window.scrollTo(0, 0);
      }
    }

    // Cleanup timer on unmount or pathname change
    return () => clearTimeout(timer);
  }, [pathname, setLoading, getLoadingStartTime]);

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
