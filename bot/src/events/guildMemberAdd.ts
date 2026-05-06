import { Events, EmbedBuilder, type GuildMember } from "discord.js";
import type { BotClient } from "../structures/BotClient";
import { Colors } from "../utils/embeds";

export default {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember, client: BotClient) {
    const settings = await client.db.guildSettings.findUnique({
      where: { guildId: member.guild.id },
    });

    if (!settings) return;

    // Auto Role
    if (settings.autoRole.length > 0) {
      try {
        await member.roles.add(settings.autoRole);
      } catch (error) {
        console.error(`[AUTOROLE] Failed for ${member.id}:`, error);
      }
    }

    // Welcome message
    const welcomeConfig = await client.db.welcomeConfig.findUnique({
      where: { guildId: member.guild.id },
    });

    if (welcomeConfig?.welcomeEnabled && settings.welcomeChannel) {
      const channel = member.guild.channels.cache.get(settings.welcomeChannel);
      if (!channel?.isTextBased()) return;

      const message = welcomeConfig.welcomeMessage
        .replace(/{user}/g, member.toString())
        .replace(/{username}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{memberCount}/g, member.guild.memberCount.toString());

      const embed = new EmbedBuilder()
        .setColor(Colors.success)
        .setTitle("👋 Welcome!")
        .setDescription(message)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setFooter({ text: `Member #${member.guild.memberCount}` })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    }

    // Anti-Raid check
    if (settings.antiRaidEnabled) {
      const recentJoins = member.guild.members.cache.filter(
        (m) =>
          m.joinedTimestamp &&
          Date.now() - m.joinedTimestamp < 10000
      );

      if (recentJoins.size >= settings.raidThreshold) {
        console.log(`[ANTIRAID] Raid detected in ${member.guild.name}`);
        // Could implement lockdown logic here
      }
    }

    // Log
    if (settings.logChannel) {
      const logChannel = member.guild.channels.cache.get(settings.logChannel);
      if (logChannel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setColor(Colors.success)
          .setTitle("📥 Member Joined")
          .addFields(
            { name: "User", value: `${member} (${member.user.tag})`, inline: true },
            { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: "Member Count", value: member.guild.memberCount.toString(), inline: true }
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }
    }
  },
};
