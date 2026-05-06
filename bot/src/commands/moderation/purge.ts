import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type TextChannel,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { successEmbed, errorEmbed } from "../../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete multiple messages")
    .addIntegerOption((o) =>
      o.setName("amount").setDescription("Number of messages (1-100)").setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .addUserOption((o) =>
      o.setName("user").setDescription("Only delete messages from this user")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const amount = interaction.options.getInteger("amount", true);
    const user = interaction.options.getUser("user");
    const channel = interaction.channel as TextChannel;

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await channel.messages.fetch({ limit: amount });

      if (user) {
        messages = messages.filter((m) => m.author.id === user.id);
      }

      const deleted = await channel.bulkDelete(messages, true);

      await client.db.modLog.create({
        data: {
          guildId: interaction.guild!.id,
          userId: interaction.user.id,
          modId: interaction.user.id,
          action: "PURGE",
          reason: `Deleted ${deleted.size} messages${user ? ` from ${user.tag}` : ""}`,
        },
      });

      await interaction.editReply({
        embeds: [
          successEmbed("Purge", `Deleted **${deleted.size}** messages.`),
        ],
      });
    } catch {
      await interaction.editReply({
        embeds: [errorEmbed("Error", "Failed to delete messages. Messages older than 14 days cannot be bulk deleted.")],
      });
    }
  },
};
