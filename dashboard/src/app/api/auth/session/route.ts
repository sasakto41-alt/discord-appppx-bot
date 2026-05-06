import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";

/**
 * Returns the current session data if the user is authenticated.
 * Used by client components to check auth status without a full page reload.
 */
export async function GET(request: NextRequest) {
  const token =
    request.cookies.get("session")?.value ??
    request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      username: session.username,
      discriminator: session.discriminator,
      avatar: session.avatar,
      email: session.email,
      guilds: session.guilds,
    },
  });
}
