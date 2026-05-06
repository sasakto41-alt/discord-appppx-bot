import { NextResponse, type NextRequest } from "next/server";

/**
 * Clears the session cookies and redirects to the login page.
 */
export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const response = NextResponse.redirect(new URL("/login", baseUrl));
  response.cookies.delete("token");
  response.cookies.delete("session");
  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
