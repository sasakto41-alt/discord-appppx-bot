import { Router, type Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, type AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/:guildId", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const guildId = req.params.guildId as string;

    const [
      totalMembers,
      totalWarns,
      totalTickets,
      openTickets,
      totalBans,
      totalMutes,
      activeEconomy,
      activeLevels,
    ] = await Promise.all([
      db.guild.findUnique({ where: { id: guildId }, select: { name: true } }),
      db.warn.count({ where: { guildId, active: true } }),
      db.ticket.count({ where: { guildId } }),
      db.ticket.count({ where: { guildId, status: "open" } }),
      db.modLog.count({ where: { guildId, action: "BAN" } }),
      db.modLog.count({ where: { guildId, action: "MUTE" } }),
      db.userEconomy.count({ where: { guildId } }),
      db.userLevel.count({ where: { guildId } }),
    ]);

    // Recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActions = await db.modLog.count({
      where: { guildId, createdAt: { gte: weekAgo } },
    });

    // Mod actions by type (last 30 days)
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const actionsByType = await db.modLog.groupBy({
      by: ["action"],
      where: { guildId, createdAt: { gte: monthAgo } },
      _count: true,
    });

    res.json({
      guild: totalMembers,
      moderation: {
        activeWarns: totalWarns,
        totalBans,
        totalMutes,
        recentActions,
        actionsByType: actionsByType.map((a) => ({
          action: a.action,
          count: a._count,
        })),
      },
      tickets: {
        total: totalTickets,
        open: openTickets,
      },
      economy: {
        activeUsers: activeEconomy,
      },
      levels: {
        activeUsers: activeLevels,
      },
    });
  } catch (error) {
    console.error("[API] Get stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
