import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors } from "../../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("View server information"),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const guild = interaction.guild!;

    const embed = new EmbedBuilder()
      .setColor(Colors.primary)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }) ?? "")
      .addFields(
        { name: "👑 Owner", value: `<@${guild.ownerId}>`, inline: true },
        { name: "📅 Created", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "🆔 ID", value: guild.id, inline: true },
        { name: "👥 Members", value: guild.memberCount.toString(), inline: true },
        { name: "💬 Channels", value: guild.channels.cache.size.toString(), inline: true },
        { name: "🎭 Roles", value: guild.roles.cache.size.toString(), inline: true },
        { name: "😀 Emojis", value: guild.emojis.cache.size.toString(), inline: true },
        { name: "🔒 Verification", value: guild.verificationLevel.toString(), inline: true },
        { name: "🚀 Boosts", value: `${guild.premiumSubscriptionCount ?? 0} (Tier ${guild.premiumTier})`, inline: true }
      )
      .setImage(guild.bannerURL({ size: 1024 }) ?? "")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
