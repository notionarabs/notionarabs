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
  const [isRedirecting, setIsRedirecting] = useState(false);

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
            if (!isRedirecting) {
              console.log('Redirecting to home page...');
              setIsRedirecting(true);
              // Use window.location for more reliable redirect
              window.location.href = '/';
            }
          }, 500);

        } catch (error) {
          console.error('Auth setup error:', error);
          setError(error.message || 'Authentication setup failed');

          // Redirect to login with error after a delay
          setTimeout(() => {
            if (!isRedirecting) {
              setIsRedirecting(true);
              window.location.href = '/login?error=auth_setup_failed';
            }
          }, 2000);
        }
      } else if (success === 'true') {
        // Handle case where success=true but no token (shouldn't happen)
        console.error('Success=true but no token provided');
        setError('No authentication token provided');
        setTimeout(() => {
          if (!isRedirecting) {
            setIsRedirecting(true);
            window.location.href = '/login?error=no_token';
          }
        }, 2000);
      } else {
        // Handle error
        console.error('Google OAuth error:', error);
        setError(error || 'Google authentication failed');
        setTimeout(() => {
          if (!isRedirecting) {
            setIsRedirecting(true);
            window.location.href = '/login?error=google_auth_failed';
          }
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router, checkAuthStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-tertiary flex items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 dark:bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="text-center relative z-10">
        {error ? (
          <div className="bg-white dark:bg-dark-card-bg rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-dark-card-border max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">حدث خطأ في تسجيل الدخول</h3>
            <p className="text-gray-500 dark:text-dark-text-tertiary text-sm mb-4">{error}</p>
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-gray-400 dark:text-dark-text-quaternary text-xs mt-4">سيتم إعادة التوجيه إلى صفحة تسجيل الدخول...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card-bg rounded-3xl p-12 shadow-2xl border border-gray-200 dark:border-dark-card-border max-w-md mx-auto">
            {/* Enhanced loading spinner */}
            <div className="relative mb-8">
              {/* Outer rotating ring */}
              <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin mx-auto relative">
                <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 dark:border-t-orange-500 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
              </div>

              {/* Inner pulsing ring */}
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-orange-400 dark:border-r-orange-300 rounded-full animate-spin mx-auto" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>

              {/* Center pulsing dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-primary-500 dark:bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Loading text with animation */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-accent-600 dark:text-dark-text-primary animate-pulse">
                جاري تسجيل الدخول...
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                يرجى الانتظار بينما نقوم بإعداد حسابك
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center space-x-2 space-x-reverse mt-6">
                <div className="w-2 h-2 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-tertiary flex items-center justify-center relative overflow-hidden" dir="rtl">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 dark:bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="text-center relative z-10">
          <div className="bg-white dark:bg-dark-card-bg rounded-3xl p-12 shadow-2xl border border-gray-200 dark:border-dark-card-border max-w-md mx-auto">
            {/* Enhanced loading spinner */}
            <div className="relative mb-8">
              {/* Outer rotating ring */}
              <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin mx-auto relative">
                <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 dark:border-t-orange-500 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
              </div>

              {/* Inner pulsing ring */}
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-orange-400 dark:border-r-orange-300 rounded-full animate-spin mx-auto" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>

              {/* Center pulsing dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-primary-500 dark:bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Loading text with animation */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-accent-600 dark:text-dark-text-primary animate-pulse">
                جاري التحميل...
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                يرجى الانتظار بينما نقوم بتحميل الصفحة
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center space-x-2 space-x-reverse mt-6">
                <div className="w-2 h-2 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackForm />
    </Suspense>
  );
}
