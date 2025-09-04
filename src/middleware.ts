import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;

    // Skip middleware for API routes, static files, and auth pages
    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon.ico") ||
      pathname === "/login"
    ) {
      return NextResponse.next();
    }

    const token = await getToken({ req });

    // If user is not authenticated, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // For authenticated users visiting home page, redirect to dashboard
    // Let the dashboard/onboarding pages handle their own profile checks
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/posts", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to login page for everyone
        if (pathname === "/login") return true;
        
        // Allow access to public pages for everyone
        if (pathname === "/" || pathname === "/colors") return true;
        
        // Require authentication for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
