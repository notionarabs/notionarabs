'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useLoading } from '../../../contexts/LoadingContext';
import Cookies from 'js-cookie';

function AuthCallbackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuthStatus } = useAuth();
  const { setLoading } = useLoading();
  const [error, setError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Disable global loading indicator since we have our own custom loading design
    setLoading(false);

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
          try {
            const authPromise = checkAuthStatus();
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Auth check timeout')), 5000)
            );

            await Promise.race([authPromise, timeoutPromise]);
            console.log('Auth status checked successfully');
          } catch (authError) {
            console.warn('Auth check failed, but token is valid:', authError.message);
            // Don't throw error - token is valid, just context update failed
            // The user will be authenticated when they navigate
          }

          // Small delay to ensure context is updated
          setTimeout(() => {
            if (!isRedirecting) {
              console.log('Redirecting to home page...');
              setIsRedirecting(true);
              // Use window.location for more reliable redirect
              window.location.href = '/';
            }
          }, 200);

        } catch (error) {
          console.error('Auth setup error:', error);

          // Check if token was stored successfully
          const storedToken = Cookies.get('authToken');
          if (storedToken) {
            console.log('Token stored successfully, redirecting despite error');
            // Token is valid, redirect to home page
            setTimeout(() => {
              if (!isRedirecting) {
                setIsRedirecting(true);
                window.location.href = '/';
              }
            }, 300);
          } else {
            setError(error.message || 'Authentication setup failed');
            // Redirect to login with error after a delay
            setTimeout(() => {
              if (!isRedirecting) {
                setIsRedirecting(true);
                window.location.href = '/login?error=auth_setup_failed';
              }
            }, 1000);
          }
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
        }, 1000);
      } else {
        // Handle error
        console.error('Google OAuth error:', error);
        setError(error || 'Google authentication failed');
        setTimeout(() => {
          if (!isRedirecting) {
            setIsRedirecting(true);
            window.location.href = '/login?error=google_auth_failed';
          }
        }, 1000);
      }
    };

    handleCallback();
  }, [searchParams, router, checkAuthStatus, setLoading]);

  // Cleanup effect to ensure global loading is disabled when component unmounts
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, [setLoading]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-primary flex items-center justify-center" dir="rtl">
      <div className="text-center">
        {error ? (
          <div className="space-y-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">حدث خطأ في تسجيل الدخول</h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">{error}</p>
            </div>
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-xs text-gray-400 dark:text-dark-text-quaternary">سيتم إعادة التوجيه إلى صفحة تسجيل الدخول...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Simple loading spinner */}
            <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-primary-500 dark:border-t-orange-500 rounded-full animate-spin mx-auto"></div>

            {/* Loading text */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-accent-600 dark:text-dark-text-primary">
                جاري تسجيل الدخول...
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                يرجى الانتظار بينما نقوم بإعداد حسابك
              </p>
            </div>

            {/* Simple progress dots */}
            <div className="flex items-center justify-center space-x-1.5 space-x-reverse">
              <div className="w-1.5 h-1.5 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
      <div className="min-h-screen bg-white dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="space-y-6">
            {/* Simple loading spinner */}
            <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-primary-500 dark:border-t-orange-500 rounded-full animate-spin mx-auto"></div>

            {/* Loading text */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-accent-600 dark:text-dark-text-primary">
                جاري التحميل...
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                يرجى الانتظار بينما نقوم بتحميل الصفحة
              </p>
            </div>

            {/* Simple progress dots */}
            <div className="flex items-center justify-center space-x-1.5 space-x-reverse">
              <div className="w-1.5 h-1.5 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackForm />
    </Suspense>
  );
}
