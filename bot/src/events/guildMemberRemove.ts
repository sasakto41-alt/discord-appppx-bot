import { Events, EmbedBuilder, type GuildMember } from "discord.js";
import type { BotClient } from "../structures/BotClient";
import { Colors } from "../utils/embeds";

export default {
  name: Events.GuildMemberRemove,
  async execute(member: GuildMember, client: BotClient) {
    const settings = await client.db.guildSettings.findUnique({
      where: { guildId: member.guild.id },
    });

    if (!settings) return;

    // Goodbye message
    const welcomeConfig = await client.db.welcomeConfig.findUnique({
      where: { guildId: member.guild.id },
    });

    if (welcomeConfig?.goodbyeEnabled && settings.welcomeChannel) {
      const channel = member.guild.channels.cache.get(settings.welcomeChannel);
      if (!channel?.isTextBased()) return;

      const message = welcomeConfig.goodbyeMessage
        .replace(/{user}/g, member.toString())
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{memberCount}/g, member.guild.memberCount.toString());

      const embed = new EmbedBuilder()
        .setColor(Colors.danger)
        .setTitle("👋 Goodbye!")
        .setDescription(message)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    }

    // Log
    if (settings.logChannel) {
      const logChannel = member.guild.channels.cache.get(settings.logChannel);
      if (logChannel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(Colors.danger)
          .setTitle("📤 Member Left")
          .addFields(
            { name: "User", value: `${member} (${member.user.tag})`, inline: true },
            { name: "Roles", value: member.roles.cache.filter((r) => r.id !== member.guild.id).map((r) => r.toString()).join(", ") || "None", inline: false }
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }
    }
  },
};
