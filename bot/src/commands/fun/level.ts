import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors } from "../../utils/embeds";
import { calculateXpForLevel } from "../../utils/helpers";

export default {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Check your level and XP")
    .addUserOption((o) =>
      o.setName("user").setDescription("User to check")
    ),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    const userLevel = await client.db.userLevel.findUnique({
      where: {
        guildId_userId: {
          guildId: interaction.guild!.id,
          userId: user.id,
        },
      },
    });

    const level = userLevel?.level ?? 0;
    const xp = userLevel?.xp ?? 0;
    const messages = userLevel?.messages ?? 0;
    const xpNeeded = calculateXpForLevel(level);
    const currentLevelXp = xp - (level > 0 ? Array.from({ length: level }, (_, i) => calculateXpForLevel(i)).reduce((a, b) => a + b, 0) : 0);
    const progress = Math.min(Math.floor((currentLevelXp / xpNeeded) * 20), 20);
    const progressBar = "█".repeat(progress) + "░".repeat(20 - progress);

    // Get rank
    const allLevels = await client.db.userLevel.findMany({
      where: { guildId: interaction.guild!.id },
      orderBy: { xp: "desc" },
    });
    const rank = allLevels.findIndex((l) => l.userId === user.id) + 1;

    const embed = new EmbedBuilder()
      .setColor(Colors.level)
      .setTitle(`📊 ${user.username}'s Level`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "🏆 Rank", value: `#${rank || "N/A"}`, inline: true },
        { name: "⭐ Level", value: level.toString(), inline: true },
        { name: "✨ XP", value: `${currentLevelXp}/${xpNeeded}`, inline: true },
        { name: "💬 Messages", value: messages.toLocaleString(), inline: true },
        { name: "Progress", value: `\`${progressBar}\` ${Math.floor((currentLevelXp / xpNeeded) * 100)}%` }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
