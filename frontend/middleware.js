import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get the auth token from cookies
  const token = request.cookies.get('authToken')?.value;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/auth/callback',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/about',
    '/contact',
    '/help',
    '/privacy',
    '/terms',
    '/cookies',
    '/careers',
    '/press',
    '/features',
    '/pricing',
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // Check if it's a dynamic route that's allowed without auth
  const isDynamicPublicRoute =
    pathname.match(/^\/templates\/[^\/]+$/) || // /templates/[id]
    pathname.match(/^\/blog\/[^\/]+$/) ||      // /blog/[id]
    pathname.match(/^\/creators\/[^\/]+$/);    // /creators/[username]

  // Check if it's a static asset or Next.js internal route
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.');

  // Allow access to public routes, dynamic public routes, and static assets
  if (isPublicRoute || isDynamicPublicRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

// Configure which routes should be checked by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};

