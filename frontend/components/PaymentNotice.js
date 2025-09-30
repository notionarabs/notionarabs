'use client';

import { usePathname } from 'next/navigation';

const ALLOWED_PREFIXES = [
  '/',
  '/templates',
  '/creators',
  '/blog',
  '/about',
  '/features',
  '/pricing',
  '/contact',
];

export default function PaymentNotice() {
  const pathname = usePathname() || '/';

  const shouldShow = ALLOWED_PREFIXES.some((prefix) => {
    if (prefix === '/') return pathname === '/';
    return pathname.startsWith(prefix);
  });

  if (!shouldShow) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-y border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
      <div className="container-custom py-3 text-center text-sm">
        تنبيه: ميزة الدفع داخل المنصة ستُفعَّل قريباً. تصفح القوالب الآن وسنعلن فور إطلاق الدفع.
      </div>
    </div>
  );
}


