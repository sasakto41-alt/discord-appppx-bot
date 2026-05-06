import { NextResponse, type NextRequest } from "next/server";

/**
 * Legacy callback handler for the custom JWT flow from the Express API.
 * The Express API redirects here after completing Discord OAuth2 with a signed JWT.
 * Example: /api/auth/callback?token=<jwt>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
