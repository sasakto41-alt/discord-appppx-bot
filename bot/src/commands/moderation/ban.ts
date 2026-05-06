import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { modEmbed, errorEmbed } from "../../utils/embeds";
import { canModerate } from "../../utils/helpers";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server")
    .addUserOption((o) =>
      o.setName("user").setDescription("User to ban").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for ban")
    )
    .addIntegerOption((o) =>
      o
        .setName("days")
        .setDescription("Delete message history (days)")
        .setMinValue(0)
        .setMaxValue(7)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const days = interaction.options.getInteger("days") ?? 0;
    const member = interaction.guild!.members.cache.get(user.id);

    if (member) {
      const check = canModerate(interaction.member as any, member);
      if (!check.allowed) {
        return interaction.reply({
          embeds: [errorEmbed("Cannot Ban", check.reason!)],
          ephemeral: true,
        });
      }
    }

    try {
      await interaction.guild!.members.ban(user.id, {
        reason: `${interaction.user.tag}: ${reason}`,
        deleteMessageSeconds: days * 86400,
      });

      await client.db.modLog.create({
        data: {
          guildId: interaction.guild!.id,
          userId: user.id,
          modId: interaction.user.id,
          action: "BAN",
          reason,
        },
      });

      await interaction.reply({
        embeds: [
          modEmbed("Ban", user.tag, interaction.user.tag, reason),
        ],
      });
    } catch {
      await interaction.reply({
        embeds: [errorEmbed("Error", "Failed to ban this user.")],
        ephemeral: true,
      });
    }
  },
};
