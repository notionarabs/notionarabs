"use client";

import { useEffect } from 'react';

export default function GoogleCallback() {
  useEffect(() => {
    // Redirect immediately without any delay
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      window.location.replace('/login?error=google_auth_failed');
      return;
    }

    if (!code) {
      window.location.replace('/login?error=no_code');
      return;
    }

    // Redirect to backend Google OAuth endpoint with the code
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' ? 'https://api.notionarabs.com/api' : 'http://localhost:5000/api');
    
    const redirectUrl = `${backendUrl}/auth/google/callback?code=${encodeURIComponent(code)}`;
    
    // Use replace instead of href to avoid showing the page
    window.location.replace(redirectUrl);
  }, []);

  // Return a loading state that matches the website theme
  return (
    <div className="min-h-screen bg-white dark:bg-dark-primary flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="space-y-6">
          {/* Loading spinner */}
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-primary-500 dark:border-t-orange-500 rounded-full animate-spin mx-auto"></div>

          {/* Loading text */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-accent-600 dark:text-dark-text-primary">
              جاري التوجيه...
            </h3>
            <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
              يرجى الانتظار بينما نقوم بتوجيهك إلى صفحة تسجيل الدخول
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
