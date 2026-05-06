import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { modEmbed, errorEmbed } from "../../utils/embeds";
import { canModerate, parseDuration, formatDuration } from "../../utils/helpers";

export default {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout a user")
    .addUserOption((o) =>
      o.setName("user").setDescription("User to mute").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("duration").setDescription("Duration (e.g. 10m, 1h, 1d)").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for mute")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const user = interaction.options.getUser("user", true);
    const durationStr = interaction.options.getString("duration", true);
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
        embeds: [errorEmbed("Cannot Mute", check.reason!)],
        ephemeral: true,
      });
    }

    const duration = parseDuration(durationStr);
    if (!duration || duration > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({
        embeds: [errorEmbed("Invalid Duration", "Please provide a valid duration (max 28 days).")],
        ephemeral: true,
      });
    }

    try {
      await member.timeout(duration, `${interaction.user.tag}: ${reason}`);

      await client.db.modLog.create({
        data: {
          guildId: interaction.guild!.id,
          userId: user.id,
          modId: interaction.user.id,
          action: "MUTE",
          reason,
          duration,
        },
      });

      await interaction.reply({
        embeds: [
          modEmbed("Mute", user.tag, interaction.user.tag, reason, formatDuration(duration)),
        ],
      });
    } catch {
      await interaction.reply({
        embeds: [errorEmbed("Error", "Failed to mute this user.")],
        ephemeral: true,
      });
    }
  },
};
