import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  type ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { successEmbed, errorEmbed, Colors } from "../../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Server setup commands")
    .addSubcommand((sub) =>
      sub
        .setName("welcome")
        .setDescription("Set up welcome channel")
        .addChannelOption((o) =>
          o.setName("channel").setDescription("Welcome channel").setRequired(true).addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption((o) =>
          o.setName("message").setDescription("Welcome message ({user}, {server}, {memberCount})")
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("logs")
        .setDescription("Set up log channel")
        .addChannelOption((o) =>
          o.setName("channel").setDescription("Log channel").setRequired(true).addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("modlog")
        .setDescription("Set up moderation log channel")
        .addChannelOption((o) =>
          o.setName("channel").setDescription("Mod log channel").setRequired(true).addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("autorole")
        .setDescription("Set up auto role")
        .addRoleOption((o) =>
          o.setName("role").setDescription("Role to auto-assign").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("tickets")
        .setDescription("Set up ticket system")
        .addChannelOption((o) =>
          o.setName("category").setDescription("Ticket category").setRequired(true).addChannelTypes(ChannelType.GuildCategory)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("overview").setDescription("View current server settings")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "welcome": {
        const channel = interaction.options.getChannel("channel", true);
        const message = interaction.options.getString("message") ?? "Welcome {user} to {server}! 🎉";

        await client.db.guildSettings.upsert({
          where: { guildId: interaction.guild!.id },
          update: { welcomeChannel: channel.id },
          create: { id: interaction.guild!.id, guildId: interaction.guild!.id, welcomeChannel: channel.id },
        });

        await client.db.welcomeConfig.upsert({
          where: { guildId: interaction.guild!.id },
          update: { welcomeEnabled: true, welcomeMessage: message },
          create: { id: interaction.guild!.id, guildId: interaction.guild!.id, welcomeEnabled: true, welcomeMessage: message },
        });

        return interaction.reply({
          embeds: [successEmbed("Welcome Setup", `Welcome channel set to ${channel}\nMessage: ${message}`)],
          ephemeral: true,
        });
      }

      case "logs": {
        const channel = interaction.options.getChannel("channel", true);

        await client.db.guildSettings.upsert({
          where: { guildId: interaction.guild!.id },
          update: { logChannel: channel.id },
          create: { id: interaction.guild!.id, guildId: interaction.guild!.id, logChannel: channel.id },
        });

        await client.db.logConfig.upsert({
          where: { guildId: interaction.guild!.id },
          update: {},
          create: { id: interaction.guild!.id, guildId: interaction.guild!.id },
        });

        return interaction.reply({
          embeds: [successEmbed("Logs Setup", `Log channel set to ${channel}`)],
          ephemeral: true,
        });
      }

      case "modlog": {
        const channel = interaction.options.getChannel("channel", true);

        await client.db.guildSettings.upsert({
          where: { guildId: interaction.guild!.id },
          update: { modLogChannel: channel.id },
          create: { id: interaction.guild!.id, guildId: interaction.guild!.id, modLogChannel: channel.id },
        });

        return interaction.reply({
          embeds: [successEmbed("ModLog Setup", `ModLog channel set to ${channel}`)],
          ephemeral: true,
        });
      }

      case "autorole": {
        const role = interaction.options.getRole("role", true);

        const settings = await client.db.guildSettings.findUnique({
          where: { guildId: interaction.guild!.id },
        });

        const autoRoles = settings?.autoRole ?? [];
        if (!autoRoles.includes(role.id)) {
          autoRoles.push(role.id);
        }

        await client.db.guildSettings.upsert({
          where: { guildId: interaction.guild!.id },
          update: { autoRole: autoRoles },
          create: { id: interaction.guild!.id, guildId: interaction.guild!.id, autoRole: autoRoles },
        });

        return interaction.reply({
          embeds: [successEmbed("AutoRole Setup", `Auto role set to ${role}`)],
          ephemeral: true,
        });
      }

      case "tickets": {
        const category = interaction.options.getChannel("category", true);

        await client.db.guildSettings.upsert({
          where: { guildId: interaction.guild!.id },
          update: { ticketCategory: category.id, ticketEnabled: true },
          create: { id: interaction.guild!.id, guildId: interaction.guild!.id, ticketCategory: category.id, ticketEnabled: true },
        });

        return interaction.reply({
          embeds: [successEmbed("Tickets Setup", `Ticket category set to ${category}`)],
          ephemeral: true,
        });
      }

      case "overview": {
        const settings = await client.db.guildSettings.findUnique({
          where: { guildId: interaction.guild!.id },
        });

        const embed = new EmbedBuilder()
          .setColor(Colors.primary)
          .setTitle("⚙️ Server Settings")
          .addFields(
            { name: "🛡️ Moderation", value: `Enabled: ${settings?.modEnabled ? "✅" : "❌"}\nAutoMod: ${settings?.autoModEnabled ? "✅" : "❌"}\nAntiRaid: ${settings?.antiRaidEnabled ? "✅" : "❌"}\nAntiSpam: ${settings?.antiSpamEnabled ? "✅" : "❌"}`, inline: true },
            { name: "📝 Channels", value: `Welcome: ${settings?.welcomeChannel ? `<#${settings.welcomeChannel}>` : "Not set"}\nLogs: ${settings?.logChannel ? `<#${settings.logChannel}>` : "Not set"}\nModLog: ${settings?.modLogChannel ? `<#${settings.modLogChannel}>` : "Not set"}`, inline: true },
            { name: "🎮 Features", value: `Tickets: ${settings?.ticketEnabled ? "✅" : "❌"}\nEconomy: ${settings?.economyEnabled ? "✅" : "❌"}\nLevels: ${settings?.levelsEnabled ? "✅" : "❌"}\nMusic: ${settings?.musicEnabled ? "✅" : "❌"}\nAI: ${settings?.aiEnabled ? "✅" : "❌"}`, inline: true },
            { name: "🎭 AutoRole", value: settings?.autoRole.length ? settings.autoRole.map((r) => `<@&${r}>`).join(", ") : "None", inline: false }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
