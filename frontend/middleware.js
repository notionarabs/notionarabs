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

  // Handle academy.notionarabs.com subdomain rewrite
  const rawHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || hostname;
  const hostName = rawHost.split(':')[0];
  const isAcademySubdomain = hostName.startsWith('academy.') || hostName === 'academy.notionarabs.com';

  // Redirect /academy traffic from the main domain to the dedicated academy subdomain in production
  if (isProduction && !isLocalhost && !isAcademySubdomain && (pathname === '/academy' || pathname.startsWith('/academy/'))) {
    const academySubPath = pathname.replace(/^\/academy/, '') || '/';
    const targetUrl = new URL(academySubPath + request.nextUrl.search, 'https://academy.notionarabs.com');
    return NextResponse.redirect(targetUrl, 301);
  }

  if (isAcademySubdomain) {
    if (pathname === '/' || pathname === '/academy') {
      return NextResponse.rewrite(new URL('/academy', request.url));
    }
    if (pathname === '/learn' || pathname === '/academy/learn') {
      return NextResponse.rewrite(new URL('/academy/notion-masterclass/learn', request.url));
    }

    // Centralized Authentication: Redirect /login and /signup on subdomain to the central login portal
    if (pathname === '/login' || pathname === '/signup') {
      const returnUrl = request.nextUrl.searchParams.get('returnTo') || 
                        request.nextUrl.searchParams.get('redirect') || 
                        'https://academy.notionarabs.com';
      const fullReturnUrl = returnUrl.startsWith('http') 
        ? returnUrl 
        : `https://academy.notionarabs.com${returnUrl === '/' ? '' : returnUrl}`;
      const centralHost = isLocalhost ? request.nextUrl.origin : 'https://www.notionarabs.com';
      const centralAuthUrl = new URL(pathname, centralHost);
      centralAuthUrl.searchParams.set('returnTo', fullReturnUrl);
      return NextResponse.redirect(centralAuthUrl, 302);
    }

    // Shared routes must NOT be rewritten to /academy/* so Next.js renders their actual root pages
    const sharedRoutes = [
      '/login',
      '/signup',
      '/auth',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
      '/profile',
      '/settings',
      '/admin',
      '/terms',
      '/privacy',
      '/cookies'
    ];
    const isSharedRoute = sharedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    // Main site routes should redirect to www.notionarabs.com
    const mainSiteRoutes = [
      '/templates',
      '/categories',
      '/creators',
      '/blog',
      '/widgets',
      '/projects',
      '/about',
      '/contact',
      '/consultation',
      '/careers',
      '/testimonials',
      '/success-stories',
      '/refund-policy'
    ];
    const isMainSiteRoute = mainSiteRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    if (isMainSiteRoute) {
      const mainUrl = new URL(pathname + request.nextUrl.search, 'https://www.notionarabs.com');
      return NextResponse.redirect(mainUrl, 302);
    }

    if (!isSharedRoute && !pathname.startsWith('/academy') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.includes('.')) {
      return NextResponse.rewrite(new URL(`/academy${pathname}`, request.url));
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

  // Redirect old store page to homepage marketplace section
  if (pathname === '/store') {
    const redirectUrl = new URL('/#marketplace', request.url);
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
    '/privacy', '/terms', '/cookies', '/templates',
    '/categories', '/creators', '/blog', '/widgets', '/projects',
    '/refund-policy', '/academy'
  ];

  const isPublicRoute = publicRoutes.some(route => pathname === route);

  const isDynamicPublicRoute =
    (pathname.match(/^\/templates\/[^\/]+$/) && pathname !== '/templates/create') ||
    (pathname.match(/^\/blog\/[^\/]+$/) && !pathname.startsWith('/blog/create') && !pathname.startsWith('/blog/edit/')) ||
    pathname.match(/^\/creators\/[^\/]+$/) ||
    pathname.match(/^\/categories\/[^\/]+$/) ||
    pathname.startsWith('/widgets/') ||
    pathname.startsWith('/projects/') ||
    pathname.startsWith('/academy');

  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.');


  // Allow access if public or static asset
  if (isPublicRoute || isDynamicPublicRoute || isStaticAsset) {
    return NextResponse.next();
  }

  // 6. Handle protected routes — require auth token
  if (!token) {
    if (isAcademySubdomain) {
      const centralHost = isLocalhost ? request.nextUrl.origin : 'https://www.notionarabs.com';
      const centralLoginUrl = new URL('/login', centralHost);
      centralLoginUrl.searchParams.set('returnTo', `https://academy.notionarabs.com${pathname}`);
      return NextResponse.redirect(centralLoginUrl);
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin role verification happens server-side in each admin page/API call.
  // Middleware only checks token presence to gate the route.

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

