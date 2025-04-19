import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;
  const isAuthorized = token?.role === 'ADMIN' || token?.role === 'EDITOR';
  
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

    // Only allow admin or editor users to access dashboard
    if (!isAuthorized) {
      // Redirect non-authorized users to homepage
      const url = new URL('/', req.url);
      return NextResponse.redirect(url);
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}; 