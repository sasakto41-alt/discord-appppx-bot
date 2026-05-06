import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors } from "../../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your or another user's balance")
    .addUserOption((o) =>
      o.setName("user").setDescription("User to check")
    ),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    const economy = await client.db.userEconomy.findUnique({
      where: {
        guildId_userId: {
          guildId: interaction.guild!.id,
          userId: user.id,
        },
      },
    });

    const balance = economy?.balance ?? 0;
    const bank = economy?.bank ?? 0;

    const embed = new EmbedBuilder()
      .setColor(Colors.economy)
      .setTitle(`💰 ${user.username}'s Balance`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "💵 Wallet", value: `\`${balance.toLocaleString()}\` coins`, inline: true },
        { name: "🏦 Bank", value: `\`${bank.toLocaleString()}\` coins`, inline: true },
        { name: "💎 Total", value: `\`${(balance + bank).toLocaleString()}\` coins`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
