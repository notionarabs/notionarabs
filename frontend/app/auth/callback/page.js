'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Cookies from 'js-cookie';

function AuthCallbackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuthStatus } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const success = searchParams.get('success');
      const error = searchParams.get('error');

      console.log('Callback params:', { token, success, error });

      // If we have a token, proceed with authentication regardless of success parameter
      if (token) {
        try {
          console.log('Setting up authentication...');
          
          // Store the token
          Cookies.set('authToken', token, { expires: 7 });
          console.log('Token stored in cookie');

          // Set token in axios headers
          const api = (await import('../../../lib/api')).default;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Token set in API headers');

          // Check auth status to update context with timeout
          console.log('Checking auth status...');
          const authPromise = checkAuthStatus();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth check timeout')), 10000)
          );
          
          await Promise.race([authPromise, timeoutPromise]);
          console.log('Auth status checked successfully');

          // Small delay to ensure context is updated
          setTimeout(() => {
            console.log('Redirecting to home page...');
            router.push('/');
          }, 500);

        } catch (error) {
          console.error('Auth setup error:', error);
          setError(error.message || 'Authentication setup failed');
          
          // Redirect to login with error after a delay
          setTimeout(() => {
            router.push('/login?error=auth_setup_failed');
          }, 2000);
        }
      } else if (success === 'true') {
        // Handle case where success=true but no token (shouldn't happen)
        console.error('Success=true but no token provided');
        setError('No authentication token provided');
        setTimeout(() => {
          router.push('/login?error=no_token');
        }, 2000);
      } else {
        // Handle error
        console.error('Google OAuth error:', error);
        setError(error || 'Google authentication failed');
        setTimeout(() => {
          router.push('/login?error=google_auth_failed');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router, checkAuthStatus]);

  return (
    <div className="min-h-screen bg-gradient-bw flex items-center justify-center" dir="rtl">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 mb-2">حدث خطأ في تسجيل الدخول</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <p className="text-gray-400 text-xs mt-2">سيتم إعادة التوجيه إلى صفحة تسجيل الدخول...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-bw-gray">جاري تسجيل الدخول...</p>
          </>
        )}
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
