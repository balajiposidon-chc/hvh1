import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const AUTH_PAGES = ['/login', '/register'];

const isAuthPages = (url) => AUTH_PAGES.some(page => page.startsWith(url));

export async function middleware(request) {
  const { url, nextUrl } = request;
  
  // Retrieve token using next-auth helper
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const hasVerifiedToken = !!token;
  const isAuthPageRequested = isAuthPages(nextUrl.pathname);

  // Redirect to dashboard if logged in and trying to access auth pages
  if (isAuthPageRequested) {
    if (!hasVerifiedToken) {
      return NextResponse.next();
    }
    const role = token.role?.toLowerCase();
    if (role === 'customer') {
      return NextResponse.redirect(new URL('/', url));
    }
    if (role === 'super admin' || role === 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin-dashboard', url));
    }
    if (role === 'admin' || role === 'store manager' || role === 'manager') {
      return NextResponse.redirect(new URL('/admin', url));
    }
    if (role === 'accountant') {
      return NextResponse.redirect(new URL('/superadmin-dashboard/accounting', url));
    }
    return NextResponse.redirect(new URL('/', url));
  }

  // Path permissions mapping
  const currentPath = nextUrl.pathname;
  
  // 1. Super Admin section
  if (currentPath.startsWith('/superadmin-dashboard')) {
    if (!hasVerifiedToken) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(currentPath)}`, url));
    }
    
    // Accountant is allowed only on the accounting path
    if (token.role === 'Accountant' && currentPath.startsWith('/superadmin-dashboard/accounting')) {
      return NextResponse.next();
    }
    
    // Admin & Store Manager are allowed on products/orders paths under superadmin-dashboard
    if (['Admin', 'Store Manager'].includes(token.role) && 
        (currentPath.startsWith('/superadmin-dashboard/products') || currentPath.startsWith('/superadmin-dashboard/orders'))) {
      return NextResponse.next();
    }
    
    // Otherwise, only Super Admin is allowed
    if (token.role !== 'Super Admin') {
      return NextResponse.redirect(new URL('/unauthorized', url));
    }
  }

  // 2. Admin section (which maps to /admin)
  if (currentPath.startsWith('/admin')) {
    if (!hasVerifiedToken) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(currentPath)}`, url));
    }
    
    // Super Admin, Admin, and Store Manager are allowed
    const allowed = ['Super Admin', 'Admin', 'Store Manager'];
    if (!allowed.includes(token.role)) {
      return NextResponse.redirect(new URL('/unauthorized', url));
    }
  }

  // 3. Profile section
  if (currentPath.startsWith('/profile')) {
    if (!hasVerifiedToken) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(currentPath)}`, url));
    }
  }

  // 4. Checkout section
  if (currentPath.startsWith('/checkout')) {
    if (!hasVerifiedToken) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(currentPath)}`, url));
    }
    if (token.role !== 'Customer') {
      return NextResponse.redirect(new URL('/unauthorized', url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/superadmin-dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/login',
    '/register'
  ]
};
