import { NextResponse } from 'next/server';
import { verifyJwtToken } from './utils/auth';

const AUTH_PAGES = ['/login', '/register'];

const isAuthPages = (url) => AUTH_PAGES.some(page => page.startsWith(url));

export async function middleware(request) {
  const { url, nextUrl, cookies } = request;
  const { value: token } = cookies.get('token') ?? { value: null };

  const hasVerifiedToken = token && (await verifyJwtToken(token));
  const isAuthPageRequested = isAuthPages(nextUrl.pathname);

  // Redirect to dashboard if logged in and trying to access auth pages
  if (isAuthPageRequested) {
    if (!hasVerifiedToken) {
      return NextResponse.next();
    }
    const role = hasVerifiedToken.role;
    if (role === 'Customer') {
      return NextResponse.redirect(new URL('/', url));
    }
    return NextResponse.redirect(new URL(`/${role.toLowerCase().replace(' ', '')}-dashboard`, url));
  }

  // Define protected routes and their allowed roles
  const routePermissions = {
    '/superadmin-dashboard': ['Super Admin'],
    '/admin-dashboard': ['Super Admin', 'Admin'],
    '/accountant-dashboard': ['Super Admin', 'Accountant'],
    '/storemanager-dashboard': ['Super Admin', 'Store Manager'],
    '/profile': ['Super Admin', 'Admin', 'Accountant', 'Store Manager', 'Customer'],
    '/checkout': ['Customer'],
  };

  const currentPath = nextUrl.pathname;
  let requiredRoles = null;

  for (const [route, roles] of Object.entries(routePermissions)) {
    if (currentPath.startsWith(route)) {
      requiredRoles = roles;
      break;
    }
  }

  // If route is protected
  if (requiredRoles) {
    if (!hasVerifiedToken) {
      const searchParams = new URLSearchParams(nextUrl.searchParams);
      searchParams.set("next", currentPath);
      return NextResponse.redirect(new URL(`/login?${searchParams}`, url));
    }

    if (!requiredRoles.includes(hasVerifiedToken.role)) {
      // User doesn't have permission
      return NextResponse.redirect(new URL('/unauthorized', url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/superadmin-dashboard/:path*',
    '/admin-dashboard/:path*',
    '/accountant-dashboard/:path*',
    '/storemanager-dashboard/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/login',
    '/register'
  ]
};
