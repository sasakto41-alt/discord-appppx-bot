import { NextResponse, type NextRequest } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";

/**
 * Creates a signed token using HMAC-SHA256 via the Web Crypto API.
 * Format: base64url(payload).base64url(signature)
 */
async function createSignedToken(payload: Record<string, unknown>): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET ?? "fallback-secret-change-me";
  const encoder = new TextEncoder();
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadBase64)
  );

  const signatureBase64 = Buffer.from(signature).toString("base64url");
  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Handles the Discord OAuth2 callback.
 * Discord redirects here after the user authorizes the application.
 * This route exchanges the authorization code for an access token,
 * fetches the user's profile and guilds, creates a signed JWT session,
 * and sets it as an httpOnly cookie before redirecting to the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl =
    process.env.NEXTAUTH_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  if (error || !code) {
    const loginUrl = new URL("/login", baseUrl);
    loginUrl.searchParams.set("error", error ?? "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/callback/discord`;

    // Exchange authorization code for access token
    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error("[AUTH] Token exchange failed:", body);
      return NextResponse.redirect(new URL("/login?error=token_exchange", baseUrl));
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    };

    // Fetch Discord user profile
    const userRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      console.error("[AUTH] Failed to fetch user profile");
      return NextResponse.redirect(new URL("/login?error=user_fetch", baseUrl));
    }

    const userData = (await userRes.json()) as {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
      email: string;
    };

    // Fetch user's guilds
    const guildsRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const guildsData = guildsRes.ok ? await guildsRes.json() : [];

    // Optionally sync user to the Express API backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try {
        await fetch(`${apiUrl}/api/auth/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: userData,
            guilds: guildsData,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
          }),
        });
      } catch {
        // Non-fatal: continue even if sync fails
        console.warn("[AUTH] Backend sync failed, continuing without it");
      }
    }

    // Build session payload
    const sessionPayload = {
      userId: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar,
      email: userData.email,
      accessToken: tokenData.access_token,
      guilds: Array.isArray(guildsData) ? guildsData : [],
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    // Encode session as base64 JSON (signed via HMAC-SHA256 using Web Crypto API)
    const sessionToken = await createSignedToken(sessionPayload);

    // Set session cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL("/dashboard", baseUrl));
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // Also set a non-httpOnly token for the existing API client (backward compat)
    response.cookies.set("token", sessionToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[AUTH] Callback error:", err);
    return NextResponse.redirect(new URL("/login?error=server_error", baseUrl));
  }
}
