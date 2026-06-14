import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('[GOOGLE CALLBACK ROUTE] Google returned error:', error);
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
  }

  if (!code) {
    console.error('[GOOGLE CALLBACK ROUTE] No code received from Google');
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  // Redirect to backend Google OAuth endpoint with the code
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://api.notionarabs.com/api' 
      : 'http://localhost:5000/api');
  
  const redirectUrl = `${backendUrl.replace(/\/$/, '')}/auth/google/callback?code=${encodeURIComponent(code)}`;
  
  console.log('[GOOGLE CALLBACK ROUTE] Redirecting to backend:', backendUrl);
  
  // Use a 307 temporary redirect to maintain the request method and parameters if needed
  // although here it's a fresh GET request to the backend.
  return NextResponse.redirect(redirectUrl);
}

// Ensure this route is always dynamic and not cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;
