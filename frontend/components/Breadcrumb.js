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
      className={`flex items-center gap-2 text-sm text-accent-700/60 dark:text-white/40 overflow-x-auto ${className}`}
    >
      {/* Home Icon */}
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-primary dark:hover:text-primary transition-colors flex-shrink-0"
        aria-label="الرئيسية"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2 flex-shrink-0">
            {/* Separator */}
            <ChevronLeft className="w-3 h-3 text-accent-900/20 dark:text-white/10 flex-shrink-0" />

            {/* Breadcrumb Item */}
            {isLast ? (
              <span className="text-accent-900 dark:text-white font-black truncate max-w-[120px] sm:max-w-xs uppercase tracking-widest text-[10px]" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url || item.href}
                className="hover:text-primary dark:hover:text-primary transition-all whitespace-nowrap font-black uppercase tracking-widest text-[10px]"
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
    <div className="container-custom pt-8 sm:pt-12 pb-4">
      <div className="flex w-fit max-w-full items-center px-6 py-3 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-full border-none shadow-soft overflow-hidden">
        <Breadcrumb items={items} className={className} />
      </div>
    </div>
  );
}
