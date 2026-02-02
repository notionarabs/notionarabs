'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile?tab=settings');
  }, [router]);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center">
      <LoadingIndicator />
    </div>
  );
}
