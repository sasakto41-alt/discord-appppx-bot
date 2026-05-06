import { Router, type Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, type AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/:guildId", async (req: AuthRequest, res: Response) => {
  try {
    const db: PrismaClient = req.app.get("db");
    const guildId = req.params.guildId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const action = req.query.action as string;

    const where: Record<string, unknown> = { guildId };
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      db.modLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.modLog.count({ where }),
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[API] Get logs error:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;
