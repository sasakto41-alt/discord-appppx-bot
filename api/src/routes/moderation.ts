import { Router, type Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, type AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/:guildId/logs", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const { guildId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [logs, total] = await Promise.all([
      db.modLog.findMany({
        where: { guildId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.modLog.count({ where: { guildId } }),
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[API] Get mod logs error:", error);
    res.status(500).json({ error: "Failed to fetch mod logs" });
  }
});

router.get("/:guildId/warns", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const { guildId } = req.params;

    const warns = await db.warn.findMany({
      where: { guildId, active: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(warns);
  } catch (error) {
    console.error("[API] Get warns error:", error);
    res.status(500).json({ error: "Failed to fetch warnings" });
  }
});

router.delete("/:guildId/warns/:warnId", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");

    await db.warn.update({
      where: { id: req.params.warnId },
      data: { active: false },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("[API] Remove warn error:", error);
    res.status(500).json({ error: "Failed to remove warning" });
  }
});

router.get("/:guildId/tickets", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const { guildId } = req.params;
    const status = req.query.status as string;

    const tickets = await db.ticket.findMany({
      where: { guildId, ...(status ? { status } : {}) },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { messages: true } } },
    });

    res.json(tickets);
  } catch (error) {
    console.error("[API] Get tickets error:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

export default router;
