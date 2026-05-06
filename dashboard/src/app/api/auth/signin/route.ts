import { NextResponse, type NextRequest } from "next/server";

/**
 * Initiates Discord OAuth2 flow directly from Next.js.
 * Redirects the user to Discord's authorization page.
 * The redirect_uri is set to /api/auth/callback/discord so that
 * Discord returns the user to the Next.js dashboard after authorization.
 */
export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const redirectUri = `${baseUrl}/api/auth/callback/discord`;

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email guilds",
  });

  return NextResponse.redirect(
    `https://discord.com/api/oauth2/authorize?${params.toString()}`
  );
}
