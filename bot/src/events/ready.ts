import { ActivityType, Events } from "discord.js";
import type { BotClient } from "../structures/BotClient";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: BotClient) {
    console.log(`[BOT] Logged in as ${client.user?.tag}`);
    console.log(`[BOT] Serving ${client.guilds.cache.size} guilds`);

    client.user?.setPresence({
      activities: [
        {
          name: `/help | ${client.guilds.cache.size} servers`,
          type: ActivityType.Watching,
        },
      ],
      status: "online",
    });

    await client.deployCommands();

    // Ensure all guilds are in database
    for (const [id, guild] of client.guilds.cache) {
      await client.db.guild.upsert({
        where: { id },
        update: { name: guild.name, icon: guild.iconURL() },
        create: {
          id,
          name: guild.name,
          icon: guild.iconURL(),
          ownerId: guild.ownerId,
        },
      });
    }
  },
};
