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
    const permissions = token.permissions || [];
    if (role === 'customer') {
      return NextResponse.redirect(new URL('/', url));
    }
    if (role === 'super admin' || role === 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin-dashboard', url));
    }
    if (permissions.includes('dashboard')) {
      return NextResponse.redirect(new URL('/admin', url));
    }
    if (permissions.includes('accounting')) {
      return NextResponse.redirect(new URL('/superadmin-dashboard/accounting', url));
    }
    if (permissions.includes('store-panel')) {
      return NextResponse.redirect(new URL('/store-panel', url));
    }
    return NextResponse.redirect(new URL('/', url));
  }

  // Path permissions mapping
  const currentPath = nextUrl.pathname;
  
  const permissions = token?.permissions || [];
  const role = token?.role?.toLowerCase() || '';

  // 1. Super Admin section
  if (currentPath.startsWith('/superadmin-dashboard')) {
    if (!hasVerifiedToken) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(currentPath)}`, url));
    }
    
    // Check permission-based sub-paths
    if (currentPath.startsWith('/superadmin-dashboard/accounting') && permissions.includes('accounting')) {
      return NextResponse.next();
    }
    
    if (currentPath.startsWith('/superadmin-dashboard/products') && permissions.includes('products')) {
      return NextResponse.next();
    }
    
    if (currentPath.startsWith('/superadmin-dashboard/orders') && permissions.includes('orders')) {
      return NextResponse.next();
    }

    if (currentPath.startsWith('/superadmin-dashboard/users') && permissions.includes('users')) {
      return NextResponse.next();
    }

    if (currentPath.startsWith('/superadmin-dashboard/stores') && permissions.includes('stores')) {
      return NextResponse.next();
    }

    if (currentPath.startsWith('/superadmin-dashboard/roles') && permissions.includes('rbac')) {
      return NextResponse.next();
    }

    if (currentPath.startsWith('/superadmin-dashboard/audit') && permissions.includes('audit')) {
      return NextResponse.next();
    }

    if (currentPath.startsWith('/superadmin-dashboard/settings') && permissions.includes('settings')) {
      return NextResponse.next();
    }
    
    // Otherwise, only Super Admin or users with 'rbac' or 'audit' permission are allowed
    if (role !== 'super admin' && role !== 'superadmin' && !permissions.includes('rbac') && !permissions.includes('audit')) {
      return NextResponse.redirect(new URL('/unauthorized', url));
    }
  }

  // 2. Admin section (which maps to /admin)
  if (currentPath.startsWith('/admin')) {
    if (!hasVerifiedToken) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(currentPath)}`, url));
    }
    
    // Super Admins bypass checks
    if (role === 'super admin' || role === 'superadmin') {
      return NextResponse.next();
    }

    // Check specific sub-path permissions
    if (currentPath.startsWith('/admin/products') && !permissions.includes('products')) {
      return NextResponse.redirect(new URL('/unauthorized', url));
    }
    if (currentPath.startsWith('/admin/orders') && !permissions.includes('orders')) {
      return NextResponse.redirect(new URL('/unauthorized', url));
    }
    if (currentPath.startsWith('/admin/users') && !permissions.includes('users')) {
      return NextResponse.redirect(new URL('/unauthorized', url));
    }
    if (currentPath.startsWith('/admin/settings') && !permissions.includes('settings')) {
      return NextResponse.redirect(new URL('/unauthorized', url));
    }

    // Fallback dashboard access check
    if (!permissions.includes('dashboard') && permissions.length === 0) {
      return NextResponse.redirect(new URL('/unauthorized', url));
    }
  }

  // 3. Store Panel section
  if (currentPath.startsWith('/store-panel')) {
    if (!hasVerifiedToken) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(currentPath)}`, url));
    }
    if (role !== 'super admin' && role !== 'superadmin' && !permissions.includes('store-panel')) {
      return NextResponse.redirect(new URL('/unauthorized', url));
    }
  }

  // 4. Profile section
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
    '/store-panel/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/login',
    '/register'
  ]
};
