import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;
  const isAdmin = token?.role === 'ADMIN';
  
  // Get the pathname from the URL
  const { pathname } = req.nextUrl;

  // Check if the request is for the dashboard
  if (pathname.startsWith('/dashboard')) {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const url = new URL('/auth/login', req.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }

    // Only allow admin users to access dashboard
    if (!isAdmin) {
      // Redirect non-admin users to homepage with an error message
      const url = new URL('/', req.url);
      url.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(url);
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}; 