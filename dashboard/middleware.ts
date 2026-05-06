import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware that protects /dashboard routes.
 * Redirects unauthenticated users to /login.
 * Auth routes (/api/auth/*) are always allowed through.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all auth-related API routes through without any checks
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("token")?.value;
    const session = request.cookies.get("session")?.value;

    if (!token && !session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
