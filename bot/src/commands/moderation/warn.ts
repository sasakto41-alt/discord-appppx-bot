import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { warnEmbed, errorEmbed, successEmbed } from "../../utils/embeds";
import { canModerate } from "../../utils/helpers";

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user")
    .addUserOption((o) =>
      o.setName("user").setDescription("User to warn").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for warning").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
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
        embeds: [errorEmbed("Cannot Warn", check.reason!)],
        ephemeral: true,
      });
    }

    await client.db.warn.create({
      data: {
        guildId: interaction.guild!.id,
        userId: user.id,
        modId: interaction.user.id,
        reason,
      },
    });

    const activeWarns = await client.db.warn.count({
      where: { guildId: interaction.guild!.id, userId: user.id, active: true },
    });

    const settings = await client.db.guildSettings.findUnique({
      where: { guildId: interaction.guild!.id },
    });

    const warnLimit = settings?.warnLimit ?? 3;

    await interaction.reply({
      embeds: [
        warnEmbed(user.tag, interaction.user.tag, reason, activeWarns, warnLimit),
      ],
    });

    // Auto-action on warn limit
    if (activeWarns >= warnLimit) {
      const action = settings?.warnAction ?? "mute";

      try {
        switch (action) {
          case "mute":
            await member.timeout(3600000, "Warn limit reached");
            break;
          case "kick":
            await member.kick("Warn limit reached");
            break;
          case "ban":
            await member.ban({ reason: "Warn limit reached" });
            break;
        }

        await client.db.modLog.create({
          data: {
            guildId: interaction.guild!.id,
            userId: user.id,
            modId: client.user!.id,
            action: action.toUpperCase(),
            reason: `Automatic: Warn limit reached (${activeWarns}/${warnLimit})`,
          },
        });

        await interaction.followUp({
          embeds: [
            successEmbed(
              "Auto-Action",
              `${user.tag} has been **${action}ed** for reaching the warn limit.`
            ),
          ],
        });
      } catch (error) {
        console.error("[WARN] Auto-action failed:", error);
      }
    }
  },
};
