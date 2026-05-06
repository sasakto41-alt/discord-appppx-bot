/**
 * Utilities for reading and verifying the session token set by
 * /api/auth/callback/discord.
 *
 * The token format is: base64url(payload).base64url(hmac-sha256-signature)
 */

export interface SessionPayload {
  userId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string;
  accessToken: string;
  guilds: Guild[];
  exp: number;
}

export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
  owner?: boolean;
  features?: string[];
}

/**
 * Decodes the payload from a session token WITHOUT verifying the signature.
 * Use only on the client side where we trust the httpOnly cookie was set by us.
 */
export function decodeSessionToken(token: string): SessionPayload | null {
  try {
    const [payloadBase64] = token.split(".");
    if (!payloadBase64) return null;
    const json = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as SessionPayload;

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Verifies the session token signature using HMAC-SHA256 (server-side / Edge).
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const [payloadBase64, signatureBase64] = token.split(".");
    if (!payloadBase64 || !signatureBase64) return null;

    const secret = process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET ?? "";
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = Buffer.from(signatureBase64, "base64url");
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payloadBase64)
    );

    if (!valid) return null;

    const json = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as SessionPayload;

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
