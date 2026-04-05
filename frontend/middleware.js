import { NextResponse } from 'next/server';
import { categorySlugMap } from './lib/categoryMapping';

export function middleware(request) {
  const { pathname, protocol, hostname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Only enforce HTTPS and www redirects in production on the actual domain
  // Skip redirects for localhost, IP addresses, and development environments
  // 1. Force HTTPS and www redirects in production
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.includes('.local');

  if (isProduction && !isLocalhost && (hostname === 'notionarabs.com' || hostname === 'www.notionarabs.com')) {
    if (protocol === 'http:') {
      url.protocol = 'https:';
      return NextResponse.redirect(url, 301);
    }
    if (hostname === 'notionarabs.com') {
      url.hostname = 'www.notionarabs.com';
      return NextResponse.redirect(url, 301);
    }
  }

  // 2. Get the auth token from cookies
  const token = request.cookies.get('authToken')?.value;


  // 4. Handle redirects and old routes
  const templateCategoryMatch = pathname.match(/^\/templates\/category\/(.+)$/);
  if (templateCategoryMatch) {
    const categorySlug = templateCategoryMatch[1];
    const redirectUrl = new URL(`/categories/${categorySlug}`, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 301);
  }

  const categoryMatch = pathname.match(/^\/categories\/(.+)$/);
  if (categoryMatch) {
    const categorySlug = decodeURIComponent(categoryMatch[1]);
    if (categorySlugMap[categorySlug]) {
      const englishSlug = categorySlugMap[categorySlug];
      const redirectUrl = new URL(`/categories/${englishSlug}`, request.url);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl, 301);
    }
  }

  // 5. Define public routes
  const publicRoutes = [
    '/', '/login', '/signup', '/auth/callback', '/verify-email',
    '/forgot-password', '/reset-password', '/about', '/contact',
    '/consultation', '/careers', '/testimonials', '/success-stories',
    '/store', '/privacy', '/terms', '/cookies', '/templates',
    '/categories', '/creators', '/blog', '/widgets', '/projects'
  ];

  const isPublicRoute = publicRoutes.some(route => pathname === route);

  const isDynamicPublicRoute =
    (pathname.match(/^\/templates\/[^\/]+$/) && pathname !== '/templates/create') ||
    (pathname.match(/^\/blog\/[^\/]+$/) && !pathname.startsWith('/blog/create') && !pathname.startsWith('/blog/edit/')) ||
    pathname.match(/^\/creators\/[^\/]+$/) ||
    pathname.match(/^\/categories\/[^\/]+$/) ||
    pathname.startsWith('/widgets/') ||
    pathname.startsWith('/projects/');

  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.');

  const isAdminRoute = pathname.startsWith('/admin');

  // Allow access if public, static, or admin
  if (isPublicRoute || isDynamicPublicRoute || isStaticAsset || isAdminRoute) {
    return NextResponse.next();
  }

  // 6. Handle other protected routes
  if (!token) {
    if (process.env.NODE_ENV !== 'production' && pathname.startsWith('/admin')) {
      return NextResponse.next();
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

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

