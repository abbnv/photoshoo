import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const isPhotoshoots = pathname.startsWith('/photoshoots');
        const isAdmin = pathname.startsWith('/admin');

        if ((isPhotoshoots || isAdmin) && !token) return false;
        if (isAdmin && !isAdminEmail(token?.email)) return false;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/photoshoots/:path*', '/admin/:path*'],
};
