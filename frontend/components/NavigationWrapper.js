'use client';

import Navigation from './Navigation';
import { usePathname } from 'next/navigation';

export default function NavigationWrapper() {
  const pathname = usePathname();

  // Determine active page based on pathname
  const getActivePage = () => {
    if (pathname.startsWith('/templates')) return 'templates';
    if (pathname.startsWith('/creators')) return 'creators';
    if (pathname.startsWith('/blog')) return 'blog';
    if (pathname.startsWith('/about')) return 'about';
    return '';
  };

  return <Navigation activePage={getActivePage()} />;
}
