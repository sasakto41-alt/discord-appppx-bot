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
    .setName("kick")
    .setDescription("Kick a user from the server")
    .addUserOption((o) =>
      o.setName("user").setDescription("User to kick").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for kick")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const member = interaction.guild!.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        embeds: [errorEmbed("Error", "User not found in this server.")],
        ephemeral: true,
      });
    }

    const check = canModerate(interaction.member as any, member);
    if (!check.allowed) {
      return interaction.reply({
        embeds: [errorEmbed("Cannot Kick", check.reason!)],
        ephemeral: true,
      });
    }

    try {
      await member.kick(`${interaction.user.tag}: ${reason}`);

      await client.db.modLog.create({
        data: {
          guildId: interaction.guild!.id,
          userId: user.id,
          modId: interaction.user.id,
          action: "KICK",
          reason,
        },
      });

      await interaction.reply({
        embeds: [modEmbed("Kick", user.tag, interaction.user.tag, reason)],
      });
    } catch {
      await interaction.reply({
        embeds: [errorEmbed("Error", "Failed to kick this user.")],
        ephemeral: true,
      });
    }
  },
};
