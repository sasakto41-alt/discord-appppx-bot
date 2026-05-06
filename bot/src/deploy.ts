import "dotenv/config";
import { BotClient } from "./structures/BotClient";

async function deploy() {
  const client = new BotClient();
  await client.loadCommands();
  await client.deployCommands();
  console.log("Commands deployed. Exiting.");
  process.exit(0);
}

deploy().catch(console.error);
