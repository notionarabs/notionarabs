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
      '/consultation',
      '/cookies'
    ];

    // Check if current page should skip auto-scroll (exact match only)
    const shouldSkipScroll = noScrollPages.includes(pathname);

    // Only scroll to top if not on main pages
    // Use requestAnimationFrame to batch scroll operation and prevent forced reflow
    if (!shouldSkipScroll) {
      requestAnimationFrame(() => {
        try {
          // Use instant scroll to avoid forced reflow from smooth scroll
          window.scrollTo(0, 0);
        } catch (e) {
          // Fallback for environments without scrollTo support
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      });
    }

    // Cleanup timer on unmount or pathname change
    return () => clearTimeout(timer);
  }, [pathname, setLoading, getLoadingStartTime]);

  // Handle browser navigation events
  useEffect(() => {
    const handleBeforeUnload = () => {
      setLoading(true, 'navigation');
    };

    const handlePopState = () => {
      setLoading(true, 'navigation');
    };

    const handleClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor || !anchor.href) return;

      // Ignore if target is _blank
      if (anchor.target === '_blank') return;

      // Ignore if modifier keys are pressed
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      // Get the URL
      const url = new URL(anchor.href);

      // Check if it's an internal link
      if (url.origin === window.location.origin) {
        // Ignore hash links on the same page
        if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
          return;
        }

        // Check if it's a file download or mailto/tel
        if (anchor.hasAttribute('download') || url.protocol === 'mailto:' || url.protocol === 'tel:') {
          return;
        }

        setLoading(true, 'navigation');
      }
    };

    // Listen for browser back/forward navigation
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
    };
  }, [setLoading]);

  return null; // This component doesn't render anything
}
