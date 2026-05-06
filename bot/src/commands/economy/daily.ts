import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors, errorEmbed } from "../../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily reward"),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const economy = await client.db.userEconomy.findUnique({
      where: {
        guildId_userId: {
          guildId: interaction.guild!.id,
          userId: interaction.user.id,
        },
      },
    });

    const now = new Date();
    const lastDaily = economy?.lastDaily;

    if (lastDaily) {
      const diff = now.getTime() - lastDaily.getTime();
      if (diff < 86400000) {
        const remaining = 86400000 - diff;
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        return interaction.reply({
          embeds: [
            errorEmbed("Daily Reward", `Come back in **${hours}h ${minutes}m**!`),
          ],
          ephemeral: true,
        });
      }
    }

    // Streak calculation
    let streak = economy?.streak ?? 0;
    if (lastDaily) {
      const diff = now.getTime() - lastDaily.getTime();
      streak = diff < 172800000 ? streak + 1 : 1;
    } else {
      streak = 1;
    }

    const baseReward = 100;
    const streakBonus = Math.min(streak * 10, 200);
    const reward = baseReward + streakBonus;

    await client.db.userEconomy.upsert({
      where: {
        guildId_userId: {
          guildId: interaction.guild!.id,
          userId: interaction.user.id,
        },
      },
      update: {
        balance: { increment: reward },
        lastDaily: now,
        streak,
      },
      create: {
        guildId: interaction.guild!.id,
        userId: interaction.user.id,
        balance: reward,
        lastDaily: now,
        streak,
      },
    });

    const embed = new EmbedBuilder()
      .setColor(Colors.economy)
      .setTitle("🎁 Daily Reward")
      .setDescription(`You received **${reward}** coins!`)
      .addFields(
        { name: "🔥 Streak", value: `${streak} days`, inline: true },
        { name: "💰 Bonus", value: `+${streakBonus} coins`, inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
