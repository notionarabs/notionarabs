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

        // Forward the code to your EC2 backend
        const api = (await import('../../../../lib/api')).default;
        const response = await api.post('/auth/google/callback', {
          code: code,
          redirectUri: window.location.origin + '/api/auth/google/callback'
        });

        if (response.data.success) {
          setStatus('Login successful! Redirecting...');
          
          // Store the auth token
          if (response.data.token) {
            document.cookie = `authToken=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
          }
          
          // Redirect to dashboard or home page
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          setStatus('Login failed. Please try again.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
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
