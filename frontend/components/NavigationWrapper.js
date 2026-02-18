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
  ) || pathname.includes('/embed');

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
    if (pathname.startsWith('/success-stories')) return 'success-stories';
    if (pathname.startsWith('/blog')) return 'blog';
    if (pathname.startsWith('/about')) return 'about';
    if (pathname.startsWith('/careers')) return 'careers';
    if (pathname.startsWith('/consultation')) return 'consultation';
    if (pathname.startsWith('/contact')) return 'contact';
    if (pathname.startsWith('/widgets')) return 'widgets';
    return '';
  };

  return <Navigation activePage={getActivePage()} />;
}
