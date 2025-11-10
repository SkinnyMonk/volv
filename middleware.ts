import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/auth/login', '/api/auth'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the route is public
  const isPublic = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublic) {
    return NextResponse.next();
  }

  // For protected routes, we'll rely on client-side protection
  // since auth tokens are stored in memory in React Context
  // This middleware is a placeholder for future enhancements
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

