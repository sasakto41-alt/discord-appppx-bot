import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors } from "../../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View server leaderboard")
    .addStringOption((o) =>
      o
        .setName("type")
        .setDescription("Leaderboard type")
        .addChoices(
          { name: "Levels", value: "levels" },
          { name: "Economy", value: "economy" },
          { name: "Messages", value: "messages" }
        )
    ),

  cooldown: 10,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const type = interaction.options.getString("type") ?? "levels";
    await interaction.deferReply();

    let entries: string[] = [];
    let title = "";

    switch (type) {
      case "levels": {
        const data = await client.db.userLevel.findMany({
          where: { guildId: interaction.guild!.id },
          orderBy: { xp: "desc" },
          take: 10,
        });

        title = "⭐ Level Leaderboard";
        entries = data.map(
          (d, i) =>
            `**${getMedal(i + 1)} #${i + 1}** — <@${d.userId}>\nLevel ${d.level} • ${d.xp.toLocaleString()} XP`
        );
        break;
      }

      case "economy": {
        const data = await client.db.userEconomy.findMany({
          where: { guildId: interaction.guild!.id },
          orderBy: { balance: "desc" },
          take: 10,
        });

        title = "💰 Economy Leaderboard";
        entries = data.map(
          (d, i) =>
            `**${getMedal(i + 1)} #${i + 1}** — <@${d.userId}>\n${(d.balance + d.bank).toLocaleString()} coins`
        );
        break;
      }

      case "messages": {
        const data = await client.db.userLevel.findMany({
          where: { guildId: interaction.guild!.id },
          orderBy: { messages: "desc" },
          take: 10,
        });

        title = "💬 Messages Leaderboard";
        entries = data.map(
          (d, i) =>
            `**${getMedal(i + 1)} #${i + 1}** — <@${d.userId}>\n${d.messages.toLocaleString()} messages`
        );
        break;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(Colors.primary)
      .setTitle(title)
      .setDescription(entries.length > 0 ? entries.join("\n\n") : "No data yet.")
      .setThumbnail(interaction.guild!.iconURL({ size: 256 }) ?? "")
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

function getMedal(pos: number): string {
  switch (pos) {
    case 1: return "🥇";
    case 2: return "🥈";
    case 3: return "🥉";
    default: return "🏅";
  }
}
