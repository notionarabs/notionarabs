'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoading } from '../contexts/LoadingContext';

export default function LoadingLink({ href, children, className, onClick, ...props }) {
  const router = useRouter();
  const { setLoading } = useLoading();

  const handleClick = (e) => {
    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Don't show loading for external links or anchor links
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    // Don't show loading if it's the same page
    if (href === window.location.pathname) {
      e.preventDefault();
      return;
    }

    // Show loading indicator
    setLoading(true, 'navigation');
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
