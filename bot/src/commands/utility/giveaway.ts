import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors, successEmbed, errorEmbed } from "../../utils/embeds";
import { parseDuration, formatDuration } from "../../utils/helpers";

export default {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Giveaway commands")
    .addSubcommand((sub) =>
      sub
        .setName("start")
        .setDescription("Start a giveaway")
        .addStringOption((o) =>
          o.setName("prize").setDescription("Prize").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("duration").setDescription("Duration (e.g. 1h, 1d)").setRequired(true)
        )
        .addIntegerOption((o) =>
          o.setName("winners").setDescription("Number of winners").setMinValue(1).setMaxValue(20)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("end")
        .setDescription("End a giveaway early")
        .addStringOption((o) =>
          o.setName("message_id").setDescription("Giveaway message ID").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("reroll")
        .setDescription("Reroll giveaway winners")
        .addStringOption((o) =>
          o.setName("message_id").setDescription("Giveaway message ID").setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const sub = interaction.options.getSubcommand();

    switch (sub) {
      case "start": {
        const prize = interaction.options.getString("prize", true);
        const durationStr = interaction.options.getString("duration", true);
        const winners = interaction.options.getInteger("winners") ?? 1;

        const duration = parseDuration(durationStr);
        if (!duration) {
          return interaction.reply({
            embeds: [errorEmbed("Error", "Invalid duration format.")],
            ephemeral: true,
          });
        }

        const endsAt = new Date(Date.now() + duration);

        const embed = new EmbedBuilder()
          .setColor(Colors.primary)
          .setTitle("🎉 GIVEAWAY 🎉")
          .setDescription(
            `**${prize}**\n\nReact with 🎉 to enter!\n\n⏰ Ends: <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n🏆 Winners: ${winners}\n👤 Hosted by: ${interaction.user}`
          )
          .setTimestamp(endsAt);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("giveaway-enter")
            .setLabel("Enter Giveaway")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🎉")
        );

        const msg = await interaction.channel!.send({
          embeds: [embed],
          components: [row],
        });

        await client.db.giveaway.create({
          data: {
            guildId: interaction.guild!.id,
            channelId: interaction.channel!.id,
            messageId: msg.id,
            hostId: interaction.user.id,
            prize,
            winners,
            endsAt,
          },
        });

        return interaction.reply({
          embeds: [successEmbed("Giveaway Started", `Giveaway for **${prize}** has started! Ends ${formatDuration(duration)}.`)],
          ephemeral: true,
        });
      }

      case "end": {
        const messageId = interaction.options.getString("message_id", true);

        const giveaway = await client.db.giveaway.findFirst({
          where: { messageId, guildId: interaction.guild!.id, ended: false },
        });

        if (!giveaway) {
          return interaction.reply({
            embeds: [errorEmbed("Error", "Giveaway not found.")],
            ephemeral: true,
          });
        }

        const winnerIds = pickWinners(giveaway.entries, giveaway.winners);

        await client.db.giveaway.update({
          where: { id: giveaway.id },
          data: { ended: true },
        });

        const winnersStr = winnerIds.length > 0
          ? winnerIds.map((id) => `<@${id}>`).join(", ")
          : "No entries";

        await interaction.channel!.send({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.economy)
              .setTitle("🎉 Giveaway Ended!")
              .setDescription(`**${giveaway.prize}**\n\n🏆 Winners: ${winnersStr}`)
              .setTimestamp(),
          ],
        });

        return interaction.reply({
          embeds: [successEmbed("Giveaway Ended", "The giveaway has been ended.")],
          ephemeral: true,
        });
      }

      case "reroll": {
        const messageId = interaction.options.getString("message_id", true);

        const giveaway = await client.db.giveaway.findFirst({
          where: { messageId, guildId: interaction.guild!.id },
        });

        if (!giveaway) {
          return interaction.reply({
            embeds: [errorEmbed("Error", "Giveaway not found.")],
            ephemeral: true,
          });
        }

        const winnerIds = pickWinners(giveaway.entries, giveaway.winners);
        const winnersStr = winnerIds.length > 0
          ? winnerIds.map((id) => `<@${id}>`).join(", ")
          : "No entries";

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.economy)
              .setTitle("🎉 Giveaway Rerolled!")
              .setDescription(`**${giveaway.prize}**\n\n🏆 New Winners: ${winnersStr}`)
              .setTimestamp(),
          ],
        });
        break;
      }
    }
  },
};

function pickWinners(entries: string[], count: number): string[] {
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
