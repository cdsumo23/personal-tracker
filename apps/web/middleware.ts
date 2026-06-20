import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Retrieve token - check cookie (our store or refresh token cookie)
  const hasToken = request.cookies.has('budget_token');

  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/register') || 
                     pathname.startsWith('/forgot-password') || 
                     pathname.startsWith('/reset-password') || 
                     pathname.startsWith('/verify-email');

  const isDashboardPage = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/accounts') || 
                          pathname.startsWith('/transactions') || 
                          pathname.startsWith('/budgets') || 
                          pathname.startsWith('/goals') || 
                          pathname.startsWith('/debts') || 
                          pathname.startsWith('/bills') || 
                          pathname.startsWith('/calendar') || 
                          pathname.startsWith('/reports') || 
                          pathname.startsWith('/profile') || 
                          pathname.startsWith('/currency') || 
                          pathname.startsWith('/admin');

  // If user has token and is trying to access auth pages, redirect to dashboard
  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user does not have token and is trying to access protected dashboard routes, redirect to login
  if (!hasToken && isDashboardPage) {
    const loginUrl = new URL('/login', request.url);
    // Keep search query if redirecting
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js, manifest.json (PWA files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
  ],
};
