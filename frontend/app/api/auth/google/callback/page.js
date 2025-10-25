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

  return null; // No UI needed, just redirect
}
