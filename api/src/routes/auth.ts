import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = Router();

const DISCORD_API = "https://discord.com/api/v10";

router.get("/login", (_req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: process.env.DISCORD_OAUTH2_REDIRECT_URI!,
    response_type: "code",
    scope: "identify email guilds",
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

router.get("/callback", async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) {
    res.status(400).json({ error: "No code provided" });
    return;
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: process.env.DISCORD_OAUTH2_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenRes.json() as { access_token: string; refresh_token: string };

    // Get user info
    const userRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json() as {
      id: string;
      username: string;
      discriminator: string;
      avatar: string;
      email: string;
    };

    // Get user guilds
    const guildsRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const guildsData = await guildsRes.json();

    const db: PrismaClient = req.app.get("db");

    // Save user
    await db.user.upsert({
      where: { id: userData.id },
      update: {
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        guilds: Array.isArray(guildsData) ? guildsData : [],
      },
      create: {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        guilds: Array.isArray(guildsData) ? guildsData : [],
      },
    });

    // Create JWT
    const token = jwt.sign(
      { userId: userData.id, accessToken: tokenData.access_token },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.redirect(
      `${process.env.NEXTAUTH_URL}/api/auth/callback?token=${token}`
    );
  } catch (error) {
    console.error("[AUTH] Callback error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const db: PrismaClient = req.app.get("db");

    const user = await db.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      guilds: user.guilds,
    });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true });
});

/**
 * Sync endpoint called by the Next.js dashboard after completing Discord OAuth2.
 * Upserts the user record in the database so guild-specific features work correctly.
 */
router.post("/sync", async (req: Request, res: Response) => {
  const { user: userData, guilds: guildsData, accessToken, refreshToken } = req.body as {
    user: {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
      email: string;
    };
    guilds: unknown[];
    accessToken: string;
    refreshToken: string;
  };

  if (!userData?.id) {
    res.status(400).json({ error: "Missing user data" });
    return;
  }

  try {
    const db: PrismaClient = req.app.get("db");

    await db.user.upsert({
      where: { id: userData.id },
      update: {
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
        accessToken,
        refreshToken,
        guilds: Array.isArray(guildsData) ? guildsData : [],
      },
      create: {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar ?? "",
        email: userData.email,
        accessToken,
        refreshToken,
        guilds: Array.isArray(guildsData) ? guildsData : [],
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("[AUTH] Sync error:", error);
    res.status(500).json({ error: "Sync failed" });
  }
});

export default router;
