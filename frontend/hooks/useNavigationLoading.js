'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '../contexts/LoadingContext';

export function useNavigationLoading() {
  const router = useRouter();
  const { setLoading } = useLoading();

  useEffect(() => {
    // Handle route changes for App Router (Next.js 13+)
    const handleRouteChangeStart = () => {
      setLoading(true);
    };

    const handleRouteChangeComplete = () => {
      setLoading(false);
    };

    const handleRouteChangeError = () => {
      setLoading(false);
    };

    // Listen for navigation events
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalForward = router.forward;

    // Override router methods to show loading
    router.push = (href, options) => {
      handleRouteChangeStart();
      return originalPush.call(router, href, options).finally(() => {
        // Add a small delay to ensure smooth transition
        setTimeout(handleRouteChangeComplete, 100);
      });
    };

    router.replace = (href, options) => {
      handleRouteChangeStart();
      return originalReplace.call(router, href, options).finally(() => {
        setTimeout(handleRouteChangeComplete, 100);
      });
    };

    router.back = () => {
      handleRouteChangeStart();
      return originalBack.call(router).finally(() => {
        setTimeout(handleRouteChangeComplete, 100);
      });
    };

    router.forward = () => {
      handleRouteChangeStart();
      return originalForward.call(router).finally(() => {
        setTimeout(handleRouteChangeComplete, 100);
      });
    };

    // Cleanup on unmount
    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      router.forward = originalForward;
    };
  }, [router, setLoading]);
}
