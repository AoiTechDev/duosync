import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = new Set(["/login", "/privacy", "/terms"]);

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;

    if (
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.startsWith("/opengraph-image") ||
      PUBLIC_PATHS.has(pathname)
    ) {
      return NextResponse.next();
    }

    const token = await getToken({ req });

    if (pathname === "/") {
      return token ? NextResponse.redirect(new URL("/feed", req.url)) : NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (PUBLIC_PATHS.has(pathname)) return true;

        if (pathname === "/") return true;

        if (pathname.startsWith("/opengraph-image")) return true;

        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
