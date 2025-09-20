'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Cookies from 'js-cookie';

function AuthCallbackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const success = searchParams.get('success');
      const error = searchParams.get('error');

      if (success === 'true' && token) {
        // Store the token
        Cookies.set('authToken', token, { expires: 7 });

        // Set token in axios headers
        const api = (await import('../../../lib/api')).default;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Check auth status to update context
        await checkAuthStatus();

        // Redirect to home page
        router.push('/');
      } else {
        // Handle error
        console.error('Google OAuth error:', error);
        router.push('/login?error=google_auth_failed');
      }
    };

    handleCallback();
  }, [searchParams, router, checkAuthStatus]);

  return (
    <div className="min-h-screen bg-gradient-bw flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-bw-gray">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-accent-600 dark:text-dark-text-secondary">جاري التحميل...</p>
        </div>
      </div>
    }>
      <AuthCallbackForm />
    </Suspense>
  );
}
