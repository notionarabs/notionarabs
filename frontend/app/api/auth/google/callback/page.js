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

  // Return a minimal loading state while redirect happens
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e3e3e3',
          borderTop: '4px solid #f5631e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{ color: '#666', fontSize: '14px' }}>جاري التوجيه...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
