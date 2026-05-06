import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { successEmbed, errorEmbed } from "../../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Toggle server features")
    .addSubcommand((sub) =>
      sub
        .setName("toggle")
        .setDescription("Toggle a feature on/off")
        .addStringOption((o) =>
          o
            .setName("feature")
            .setDescription("Feature to toggle")
            .setRequired(true)
            .addChoices(
              { name: "AntiRaid", value: "antiRaidEnabled" },
              { name: "AntiSpam", value: "antiSpamEnabled" },
              { name: "AntiLink", value: "antiLinkEnabled" },
              { name: "AntiNSFW", value: "antiNsfwEnabled" },
              { name: "AntiBot", value: "antiBotEnabled" },
              { name: "AutoMod", value: "autoModEnabled" },
              { name: "Economy", value: "economyEnabled" },
              { name: "Levels", value: "levelsEnabled" },
              { name: "Music", value: "musicEnabled" },
              { name: "AI", value: "aiEnabled" },
              { name: "Verify", value: "verifyEnabled" },
              { name: "Tickets", value: "ticketEnabled" },
              { name: "Captcha", value: "captchaEnabled" }
            )
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("warnlimit")
        .setDescription("Set warn limit")
        .addIntegerOption((o) =>
          o.setName("limit").setDescription("Max warnings before action").setRequired(true).setMinValue(1).setMaxValue(20)
        )
        .addStringOption((o) =>
          o
            .setName("action")
            .setDescription("Action on limit")
            .addChoices(
              { name: "Mute", value: "mute" },
              { name: "Kick", value: "kick" },
              { name: "Ban", value: "ban" }
            )
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "toggle": {
        const feature = interaction.options.getString("feature", true);

        const settings = await client.db.guildSettings.findUnique({
          where: { guildId: interaction.guild!.id },
        });

        const currentValue = (settings as Record<string, unknown>)?.[feature] as boolean ?? false;

        await client.db.guildSettings.upsert({
          where: { guildId: interaction.guild!.id },
          update: { [feature]: !currentValue },
          create: {
            id: interaction.guild!.id,
            guildId: interaction.guild!.id,
            [feature]: true,
          },
        });

        return interaction.reply({
          embeds: [
            successEmbed(
              "Settings Updated",
              `**${feature}** is now ${!currentValue ? "✅ Enabled" : "❌ Disabled"}`
            ),
          ],
          ephemeral: true,
        });
      }

      case "warnlimit": {
        const limit = interaction.options.getInteger("limit", true);
        const action = interaction.options.getString("action") ?? "mute";

        await client.db.guildSettings.upsert({
          where: { guildId: interaction.guild!.id },
          update: { warnLimit: limit, warnAction: action },
          create: {
            id: interaction.guild!.id,
            guildId: interaction.guild!.id,
            warnLimit: limit,
            warnAction: action,
          },
        });

        return interaction.reply({
          embeds: [
            successEmbed(
              "Warn Limit Updated",
              `Warn limit set to **${limit}** with action **${action}**`
            ),
          ],
          ephemeral: true,
        });
      }
    }
  },
};
