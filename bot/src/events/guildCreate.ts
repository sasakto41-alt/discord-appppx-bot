import { Events, type Guild } from "discord.js";
import type { BotClient } from "../structures/BotClient";

export default {
  name: Events.GuildCreate,
  async execute(guild: Guild, client: BotClient) {
    console.log(`[GUILD] Joined: ${guild.name} (${guild.id})`);

    await client.db.guild.upsert({
      where: { id: guild.id },
      update: { name: guild.name, icon: guild.iconURL() },
      create: {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
        ownerId: guild.ownerId,
      },
    });

    await client.db.guildSettings.upsert({
      where: { guildId: guild.id },
      update: {},
      create: {
        id: guild.id,
        guildId: guild.id,
      },
    });
  },
};
