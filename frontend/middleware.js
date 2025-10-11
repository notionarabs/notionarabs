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
    '/privacy',
    '/terms',
    '/cookies',
    '/templates',
    '/categories',
    '/creators',
    '/blog',
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // Check if it's a dynamic route that's allowed without auth
  const isDynamicPublicRoute =
    (pathname.match(/^\/templates\/[^\/]+$/) && pathname !== '/templates/create') || // /templates/[id] but not /templates/create
    (pathname.match(/^\/blog\/[^\/]+$/) && !pathname.startsWith('/blog/create') && !pathname.startsWith('/blog/edit/')) || // /blog/[id] but not /blog/create or /blog/edit/[id]
    pathname.match(/^\/creators\/[^\/]+$/); // /creators/[username] - public creator profiles

  // Check if it's a static asset or Next.js internal route
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.');

  // Treat admin pages as public for routing (client guards will enforce role)
  const isAdminRoute = pathname.startsWith('/admin');

  // Allow access to public routes, dynamic public routes, static assets, and admin pages (guarded client-side)
  if (isPublicRoute || isDynamicPublicRoute || isStaticAsset || isAdminRoute) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, handle exceptions
  if (!token) {
    // In development, allow admin pages to render and let client-side guards handle auth
    if (process.env.NODE_ENV !== 'production' && pathname.startsWith('/admin')) {
      return NextResponse.next();
    }

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

