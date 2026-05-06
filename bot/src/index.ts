import "dotenv/config";
import { BotClient } from "./structures/BotClient";

const client = new BotClient();

process.on("unhandledRejection", (error) => {
  console.error("[ERROR] Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("[ERROR] Uncaught exception:", error);
});

client.start(process.env.DISCORD_TOKEN!).catch(console.error);

export { client };
