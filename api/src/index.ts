import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import { MongoClient } from "mongodb";
import authRoutes from "./routes/auth";
import guildRoutes from "./routes/guilds";
import settingsRoutes from "./routes/settings";
import moderationRoutes from "./routes/moderation";
import economyRoutes from "./routes/economy";
import logsRoutes from "./routes/logs";
import statsRoutes from "./routes/stats";

const app = express();
const db = new PrismaClient();
const PORT = process.env.API_PORT || 3001;

async function initReplicaSet() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return;
  try {
    const client = new MongoClient(dbUrl.replace('?directConnection=true', '').replace('&directConnection=true', ''), { directConnection: true });
    await client.connect();
    const admin = client.db('admin');
    try {
      await admin.command({ replSetGetStatus: 1 });
    } catch {
      console.log('[DB] Initializing replica set...');
      await admin.command({ replSetInitiate: { _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] } });
      await new Promise(r => setTimeout(r, 3000));
    }
    await client.close();
  } catch (e) {
    console.log('[DB] Replica set init skipped:', (e as Error).message);
  }
}
initReplicaSet();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Make db available in routes
app.set("db", db);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/guilds", guildRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/economy", economyRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/stats", statsRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[API] Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`[API] Running on port ${PORT}`);
});

export { app, db };
