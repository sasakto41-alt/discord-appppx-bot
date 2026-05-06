import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors, successEmbed, errorEmbed } from "../../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Ticket system commands")
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Create a new ticket")
        .addStringOption((o) =>
          o.setName("subject").setDescription("Ticket subject")
        )
    )
    .addSubcommand((sub) =>
      sub.setName("close").setDescription("Close the current ticket")
    )
    .addSubcommand((sub) =>
      sub
        .setName("panel")
        .setDescription("Create a ticket panel")
    ),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const sub = interaction.options.getSubcommand();
    const settings = await client.db.guildSettings.findUnique({
      where: { guildId: interaction.guild!.id },
    });

    if (!settings?.ticketEnabled || !settings.ticketCategory) {
      return interaction.reply({
        embeds: [errorEmbed("Error", "Ticket system is not set up. Use `/setup tickets` first.")],
        ephemeral: true,
      });
    }

    switch (sub) {
      case "create": {
        const subject = interaction.options.getString("subject") ?? "No subject";

        const existingTicket = await client.db.ticket.findFirst({
          where: {
            guildId: interaction.guild!.id,
            userId: interaction.user.id,
            status: "open",
          },
        });

        if (existingTicket) {
          return interaction.reply({
            embeds: [errorEmbed("Error", `You already have an open ticket: <#${existingTicket.channelId}>`)],
            ephemeral: true,
          });
        }

        const channel = await interaction.guild!.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: ChannelType.GuildText,
          parent: settings.ticketCategory,
          permissionOverwrites: [
            {
              id: interaction.guild!.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.AttachFiles,
              ],
            },
          ],
        });

        await client.db.ticket.create({
          data: {
            guildId: interaction.guild!.id,
            channelId: channel.id,
            userId: interaction.user.id,
            subject,
          },
        });

        const embed = new EmbedBuilder()
          .setColor(Colors.primary)
          .setTitle("🎫 Ticket Created")
          .setDescription(`Subject: **${subject}**\n\nSupport will be with you shortly.\nUse \`/ticket close\` to close this ticket.`)
          .addFields({ name: "Created by", value: interaction.user.toString() })
          .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket-close")
            .setLabel("Close Ticket")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🔒")
        );

        await channel.send({ embeds: [embed], components: [row] });

        return interaction.reply({
          embeds: [successEmbed("Ticket Created", `Your ticket has been created: ${channel}`)],
          ephemeral: true,
        });
      }

      case "close": {
        const ticket = await client.db.ticket.findFirst({
          where: {
            guildId: interaction.guild!.id,
            channelId: interaction.channel!.id,
            status: "open",
          },
        });

        if (!ticket) {
          return interaction.reply({
            embeds: [errorEmbed("Error", "This is not a ticket channel or the ticket is already closed.")],
            ephemeral: true,
          });
        }

        await client.db.ticket.update({
          where: { id: ticket.id },
          data: { status: "closed", closedAt: new Date() },
        });

        await interaction.reply({
          embeds: [successEmbed("Ticket Closed", "This ticket will be deleted in 5 seconds.")],
        });

        setTimeout(async () => {
          try {
            await interaction.channel!.delete();
          } catch {
            // Channel may already be deleted
          }
        }, 5000);
        break;
      }

      case "panel": {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({
            embeds: [errorEmbed("Error", "Only administrators can create ticket panels.")],
            ephemeral: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor(Colors.primary)
          .setTitle("🎫 Support Tickets")
          .setDescription("Click the button below to create a support ticket.\nOur team will respond as soon as possible.")
          .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket-create")
            .setLabel("Create Ticket")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("📩")
        );

        await interaction.channel!.send({ embeds: [embed], components: [row] });

        return interaction.reply({
          embeds: [successEmbed("Panel Created", "Ticket panel has been created.")],
          ephemeral: true,
        });
      }
    }
  },
};
