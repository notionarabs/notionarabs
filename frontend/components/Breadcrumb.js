import Link from 'next/link';
import { Home, ChevronLeft } from 'lucide-react';

/**
 * Breadcrumb Navigation Component
 * Displays hierarchical navigation path for better UX and SEO
 * 
 * @param {Array} items - Array of breadcrumb items with { name, url } structure
 * @param {string} className - Optional additional CSS classes
 */
export default function Breadcrumb({ items = [], className = '' }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm text-accent-600 dark:text-dark-text-secondary overflow-x-auto ${className}`}
    >
      {/* Home Icon */}
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-accent-700 dark:hover:text-dark-text-primary transition-colors flex-shrink-0"
        aria-label="الرئيسية"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2 flex-shrink-0">
            {/* Separator */}
            <ChevronLeft className="w-4 h-4 text-accent-400 dark:text-dark-text-quaternary flex-shrink-0" />

            {/* Breadcrumb Item */}
            {isLast ? (
              <span className="text-accent-500 dark:text-dark-text-primary font-medium truncate max-w-[120px] sm:max-w-xs" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="hover:text-accent-700 dark:hover:text-dark-text-primary transition-colors whitespace-nowrap"
              >
                {item.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Breadcrumb Wrapper Component with Padding
 * Use this for consistent spacing across pages
 */
export function BreadcrumbWrapper({ items, className = '' }) {
  return (
    <div className="container-custom pt-4 sm:pt-6 pb-2">
      <div className="flex w-fit max-w-full items-center px-4 py-2 bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-md rounded-full border border-gray-200/50 dark:border-dark-card-border shadow-sm overflow-hidden">
        <Breadcrumb items={items} className={className} />
      </div>
    </div>
  );
}

