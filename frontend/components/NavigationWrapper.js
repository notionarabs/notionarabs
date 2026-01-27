'use client';

import Navigation from './Navigation';
import { usePathname } from 'next/navigation';

export default function NavigationWrapper() {
  const pathname = usePathname();

  // Pages that should NOT show the header
  const pagesWithoutHeader = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/auth/callback',
    '/admin',
    '/profile'
  ];

  // Check if current page should hide the header
  const shouldHideHeader = pagesWithoutHeader.some(page =>
    pathname === page || pathname.startsWith(page + '/')
  );

  // Don't render header for specific pages
  if (shouldHideHeader) {
    return null;
  }

  // Determine active page based on pathname
  const getActivePage = () => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/store')) return 'store';
    if (pathname.startsWith('/templates')) return 'templates';
    if (pathname.startsWith('/creators')) return 'creators';
    if (pathname.startsWith('/services')) return 'services';
    if (pathname.startsWith('/testimonials')) return 'testimonials';
    if (pathname.startsWith('/blog')) return 'blog';
    if (pathname.startsWith('/about')) return 'about';
    return '';
  };

  return <Navigation activePage={getActivePage()} />;
}
