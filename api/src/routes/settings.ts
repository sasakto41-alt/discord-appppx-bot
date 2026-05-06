import { Router, type Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, type AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/:guildId", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const { guildId } = req.params;

    const settings = await db.guildSettings.findUnique({
      where: { guildId },
    });

    if (!settings) {
      res.json({});
      return;
    }

    res.json(settings);
  } catch (error) {
    console.error("[API] Get settings error:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.patch("/:guildId", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const { guildId } = req.params;
    const updates = req.body;

    // Validate allowed fields
    const allowedFields = [
      "modEnabled", "autoModEnabled", "antiRaidEnabled", "antiSpamEnabled",
      "antiLinkEnabled", "antiNsfwEnabled", "antiBotEnabled",
      "modLogChannel", "welcomeChannel", "goodbyeChannel", "ticketCategory",
      "logChannel", "voiceLogChannel",
      "muteRole", "jailRole", "autoRole", "verifyRole", "modRoles", "adminRoles",
      "verifyEnabled", "ticketEnabled", "economyEnabled", "levelsEnabled",
      "musicEnabled", "aiEnabled",
      "spamThreshold", "raidThreshold", "warnLimit", "warnAction",
      "captchaEnabled", "captchaType",
    ];

    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filtered[key] = value;
      }
    }

    const settings = await db.guildSettings.upsert({
      where: { guildId },
      update: filtered,
      create: { id: guildId, guildId, ...filtered },
    });

    res.json(settings);
  } catch (error) {
    console.error("[API] Update settings error:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

router.get("/:guildId/welcome", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const config = await db.welcomeConfig.findUnique({
      where: { guildId: req.params.guildId },
    });
    res.json(config ?? {});
  } catch (error) {
    console.error("[API] Get welcome config error:", error);
    res.status(500).json({ error: "Failed to fetch welcome config" });
  }
});

router.patch("/:guildId/welcome", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const { guildId } = req.params;

    const config = await db.welcomeConfig.upsert({
      where: { guildId },
      update: req.body,
      create: { id: guildId, guildId, ...req.body },
    });

    res.json(config);
  } catch (error) {
    console.error("[API] Update welcome config error:", error);
    res.status(500).json({ error: "Failed to update welcome config" });
  }
});

router.get("/:guildId/logs-config", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const config = await db.logConfig.findUnique({
      where: { guildId: req.params.guildId },
    });
    res.json(config ?? {});
  } catch (error) {
    console.error("[API] Get log config error:", error);
    res.status(500).json({ error: "Failed to fetch log config" });
  }
});

router.patch("/:guildId/logs-config", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const { guildId } = req.params;

    const config = await db.logConfig.upsert({
      where: { guildId },
      update: req.body,
      create: { id: guildId, guildId, ...req.body },
    });

    res.json(config);
  } catch (error) {
    console.error("[API] Update log config error:", error);
    res.status(500).json({ error: "Failed to update log config" });
  }
});

export default router;
