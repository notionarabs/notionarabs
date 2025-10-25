"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setStatus('Login failed. Please try again.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        if (!code) {
          setStatus('No authorization code received.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        // Redirect to backend Google OAuth endpoint with the code
        // The backend will handle the OAuth flow and redirect back to /auth/callback
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 
          (process.env.NODE_ENV === 'production' ? 'https://api.notionarabs.com/api' : 'http://localhost:5000/api');
        
        const redirectUrl = `${backendUrl}/auth/google/callback?code=${encodeURIComponent(code)}`;
        
        // Redirect to backend
        window.location.href = redirectUrl;
        
      } catch (error) {
        console.error('Google callback error:', error);
        setStatus('Login failed. Please try again.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    handleGoogleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-primary flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="space-y-6">
          {/* Loading spinner */}
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-primary-500 dark:border-t-orange-500 rounded-full animate-spin mx-auto"></div>

          {/* Loading text */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-accent-600 dark:text-dark-text-primary">
              جاري تسجيل الدخول...
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
              {status}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center space-x-1.5 space-x-reverse">
            <div className="w-1.5 h-1.5 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-primary-500 dark:bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
