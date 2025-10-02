# Authentication Protection System

## Overview

This document describes the global authentication protection system implemented for the Notion Arabs platform.

## Implementation Details

### Middleware-Based Protection

A Next.js middleware (`frontend/middleware.js`) has been implemented to globally protect all routes except specific public pages.

### How It Works

1. **Token Verification**: The middleware checks for the `authToken` cookie on every request.

2. **Route Protection**:

   - If a user is **authenticated** → Access granted
   - If a user is **not authenticated** → Redirected to `/login` with the intended destination stored in the URL

3. **Redirect After Login**: After successful login, users are automatically redirected to their intended destination.

## Public Routes (No Authentication Required)

### Static Pages

- `/` - Homepage
- `/login` - Login page
- `/signup` - Signup page
- `/auth/callback` - OAuth callback
- `/verify-email` - Email verification
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset confirmation
- `/about` - About page
- `/contact` - Contact page
- `/help` - Help center
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/cookies` - Cookie policy
- `/careers` - Careers page
- `/press` - Press page
- `/features` - Features page
- `/pricing` - Pricing page

### Dynamic Public Routes (View Only)

- `/templates/[id]` - Individual template detail pages
- `/blog/[id]` - Individual blog post pages

## Protected Routes (Authentication Required)

All other routes require authentication, including but not limited to:

### Template Routes

- `/templates` - Templates listing/browse page
- `/templates/create` - Create new template

### Creator Routes

- `/creators` - Creators listing page
- `/creators/apply` - Creator application page
- `/creators/[username]` - Individual creator profile pages

### Blog Routes

- `/blog` - Blog listing page
- `/blog/create` - Create new blog post
- `/blog/edit/[id]` - Edit blog post

### User Routes

- `/profile` - User profile
- `/profile/settings` - Profile settings
- `/profile/templates` - User's templates
- `/profile/my-blogs` - User's blog posts
- `/settings` - Account settings
- `/orders` - Order history

### Admin Routes

- `/admin` - Admin dashboard
- `/admin/*` - All admin pages

## Technical Implementation

### Middleware Location

```text
frontend/middleware.js
```

### Middleware Configuration

The middleware uses Next.js 13+ middleware API with matcher configuration to:

- Exclude static assets (`_next/static`, `_next/image`, etc.)
- Exclude files with extensions (images, fonts, etc.)
- Include all application routes

### Code Example

```javascript
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authToken")?.value;

  // Check if route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  const isDynamicPublicRoute =
    pathname.match(/^\/templates\/[^\/]+$/) ||
    pathname.match(/^\/blog\/[^\/]+$/);
  // Note: /creators/[username] routes are now protected

  // Allow public routes
  if (isPublicRoute || isDynamicPublicRoute) {
    return NextResponse.next();
  }

  // Redirect if not authenticated
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

## Benefits of This Approach

1. **Centralized Protection**: One place to manage all authentication logic
2. **Easy to Maintain**: Add/remove protected routes in one location
3. **Consistent Behavior**: All routes follow the same authentication rules
4. **Better UX**: Automatic redirect to intended destination after login
5. **Performance**: Checks happen at the edge before page rendering
6. **Security**: Server-side validation prevents unauthorized access
