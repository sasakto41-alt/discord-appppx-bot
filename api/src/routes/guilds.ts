import { Router, type Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, type AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");

    const user = await db.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Filter guilds where user has MANAGE_GUILD permission
    const manageable = (user.guilds as Array<{ id: string; permissions: string; name: string; icon: string }>).filter(
      (g) => (parseInt(g.permissions) & 0x20) === 0x20
    );

    // Check which guilds the bot is in
    const botGuilds = await db.guild.findMany({
      where: { id: { in: manageable.map((g) => g.id) } },
    });
    const botGuildIds = new Set(botGuilds.map((g) => g.id));

    const guilds = manageable.map((g) => ({
      ...g,
      botIn: botGuildIds.has(g.id),
    }));

    res.json(guilds);
  } catch (error) {
    console.error("[API] Get guilds error:", error);
    res.status(500).json({ error: "Failed to fetch guilds" });
  }
});

router.get("/:guildId", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const { guildId } = req.params;

    const guild = await db.guild.findUnique({
      where: { id: guildId },
      include: { settings: true },
    });

    if (!guild) {
      res.status(404).json({ error: "Guild not found" });
      return;
    }

    res.json(guild);
  } catch (error) {
    console.error("[API] Get guild error:", error);
    res.status(500).json({ error: "Failed to fetch guild" });
  }
});

router.get("/:guildId/channels", async (req: AuthRequest, res: Response) => {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${req.params.guildId}/channels`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` } }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("[API] Get channels error:", error);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

router.get("/:guildId/roles", async (req: AuthRequest, res: Response) => {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${req.params.guildId}/roles`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` } }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("[API] Get roles error:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

export default router;
