import { Router, type Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, type AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/:guildId/leaderboard", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const guildId = req.params.guildId as string;
    const type = req.query.type as string || "economy";
    const limit = parseInt(req.query.limit as string) || 10;

    if (type === "levels") {
      const data = await db.userLevel.findMany({
        where: { guildId },
        orderBy: { xp: "desc" },
        take: limit,
      });
      res.json(data);
    } else {
      const data = await db.userEconomy.findMany({
        where: { guildId },
        orderBy: { balance: "desc" },
        take: limit,
      });
      res.json(data);
    }
  } catch (error) {
    console.error("[API] Get leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.get("/:guildId/user/:userId", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const guildId = req.params.guildId as string;
    const userId = req.params.userId as string;

    const [economy, level] = await Promise.all([
      db.userEconomy.findUnique({
        where: { guildId_userId: { guildId, userId } },
      }),
      db.userLevel.findUnique({
        where: { guildId_userId: { guildId, userId } },
      }),
    ]);

    res.json({ economy, level });
  } catch (error) {
    console.error("[API] Get user economy error:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

export default router;
