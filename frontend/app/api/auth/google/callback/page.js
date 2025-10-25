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
        const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 
          (process.env.NODE_ENV === 'production' ? 'https://api.notionarabs.com' : 'http://localhost:5000');
        
        const redirectUrl = `${backendUrl}/api/auth/google/callback?code=${encodeURIComponent(code)}`;
        
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Google Login
          </h2>
          <p className="text-gray-600">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
