import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors, errorEmbed } from "../../utils/embeds";

const workCooldowns = new Map<string, number>();

const jobs = [
  { job: "Developer", min: 50, max: 200, emoji: "💻" },
  { job: "Doctor", min: 80, max: 250, emoji: "🏥" },
  { job: "Chef", min: 30, max: 150, emoji: "👨‍🍳" },
  { job: "Artist", min: 20, max: 180, emoji: "🎨" },
  { job: "Driver", min: 40, max: 120, emoji: "🚗" },
  { job: "Teacher", min: 60, max: 160, emoji: "📚" },
  { job: "Streamer", min: 10, max: 300, emoji: "📺" },
  { job: "Musician", min: 25, max: 200, emoji: "🎵" },
];

export default {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work to earn coins"),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const key = `${interaction.guild!.id}-${interaction.user.id}`;
    const now = Date.now();
    const cooldown = workCooldowns.get(key);

    if (cooldown && now - cooldown < 3600000) {
      const remaining = 3600000 - (now - cooldown);
      const minutes = Math.floor(remaining / 60000);
      return interaction.reply({
        embeds: [errorEmbed("Work", `You can work again in **${minutes}m**!`)],
        ephemeral: true,
      });
    }

    workCooldowns.set(key, now);

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    await client.db.userEconomy.upsert({
      where: {
        guildId_userId: {
          guildId: interaction.guild!.id,
          userId: interaction.user.id,
        },
      },
      update: { balance: { increment: earned } },
      create: {
        guildId: interaction.guild!.id,
        userId: interaction.user.id,
        balance: earned,
      },
    });

    const embed = new EmbedBuilder()
      .setColor(Colors.economy)
      .setTitle(`${job.emoji} Work Complete!`)
      .setDescription(`You worked as a **${job.job}** and earned **${earned}** coins!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
