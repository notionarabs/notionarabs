import { NextResponse } from 'next/server';
import { categorySlugMap } from './lib/categoryMapping';

export function middleware(request) {
  const { pathname, protocol, hostname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Only enforce HTTPS and www redirects in production on the actual domain
  // Skip redirects for localhost, IP addresses, and development environments
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.includes('.local');

  // Only apply redirects in production and on the actual production domain
  if (isProduction && !isLocalhost && (hostname === 'notionarabs.com' || hostname === 'www.notionarabs.com')) {
    // Force HTTPS redirect (301 permanent) - only in production
    if (protocol === 'http:') {
      url.protocol = 'https:';
      return NextResponse.redirect(url, 301);
    }

    // Force www redirect (301 permanent) - redirect non-www to www
    if (hostname === 'notionarabs.com') {
      url.hostname = 'www.notionarabs.com';
      return NextResponse.redirect(url, 301);
    }
  }

  // Handle old /templates/category/[id] route - redirect to /categories/[id]
  const templateCategoryMatch = pathname.match(/^\/templates\/category\/(.+)$/);
  if (templateCategoryMatch) {
    const categorySlug = templateCategoryMatch[1];
    const redirectUrl = new URL(`/categories/${categorySlug}`, request.url);
    // Preserve query parameters
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Handle Arabic category slugs - redirect to English slugs
  const categoryMatch = pathname.match(/^\/categories\/(.+)$/);
  if (categoryMatch) {
    // Decode URL-encoded category slug (handles Arabic characters)
    const categorySlug = decodeURIComponent(categoryMatch[1]);
    // Check if it's an Arabic category name that needs redirecting
    if (categorySlugMap[categorySlug]) {
      const englishSlug = categorySlugMap[categorySlug];
      const redirectUrl = new URL(`/categories/${englishSlug}`, request.url);
      // Preserve query parameters
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl, 301);
    }
  }

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
    '/consultation',
    '/careers',
    '/testimonials',
    '/success-stories',
    '/store',
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
    pathname.match(/^\/creators\/[^\/]+$/) || // /creators/[username] - public creator profiles
    pathname.match(/^\/categories\/[^\/]+$/) || // /categories/[id] - public category pages
    (pathname.startsWith('/widgets') && !pathname.includes('/embed')); // /widgets but not /widgets/*/embed

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

