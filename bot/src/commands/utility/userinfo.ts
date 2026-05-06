import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors } from "../../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("View user information")
    .addUserOption((o) =>
      o.setName("user").setDescription("User to view")
    ),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const member = interaction.guild!.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setColor(member?.displayHexColor ?? Colors.primary)
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "🆔 ID", value: user.id, inline: true },
        { name: "📅 Account Created", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();

    if (member) {
      embed.addFields(
        { name: "📥 Joined Server", value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>` : "Unknown", inline: true },
        { name: "🎭 Roles", value: member.roles.cache.filter((r) => r.id !== interaction.guild!.id).map((r) => r.toString()).join(", ") || "None", inline: false },
        { name: "🔝 Highest Role", value: member.roles.highest.toString(), inline: true }
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};
