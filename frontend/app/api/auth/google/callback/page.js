"use client";

import { useEffect } from 'react';

export default function GoogleCallback() {
  useEffect(() => {
    // Get the authorization code from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      window.location.href = '/login?error=google_auth_failed';
      return;
    }

    if (!code) {
      window.location.href = '/login?error=no_code';
      return;
    }

    // Redirect to backend Google OAuth endpoint with the code
    // The backend will handle the OAuth flow and redirect back to /auth/callback
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' ? 'https://api.notionarabs.com/api' : 'http://localhost:5000/api');
    
    const redirectUrl = `${backendUrl}/auth/google/callback?code=${encodeURIComponent(code)}`;
    
    // Redirect to backend immediately
    window.location.href = redirectUrl;
  }, []);

  return null; // No UI needed, just redirect
}
