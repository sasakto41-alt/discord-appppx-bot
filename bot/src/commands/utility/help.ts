import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  type ChatInputCommandInteraction,
  ComponentType,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors } from "../../utils/embeds";

const categories: Record<string, { emoji: string; description: string }> = {
  moderation: { emoji: "🛡️", description: "Moderation commands" },
  admin: { emoji: "⚙️", description: "Admin & setup commands" },
  economy: { emoji: "💰", description: "Economy commands" },
  utility: { emoji: "🔧", description: "Utility commands" },
  fun: { emoji: "🎮", description: "Fun commands" },
  music: { emoji: "🎵", description: "Music commands" },
};

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("View all bot commands")
    .addStringOption((o) =>
      o.setName("command").setDescription("Get info about a specific command")
    ),

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const specific = interaction.options.getString("command");

    if (specific) {
      const cmd = client.commands.get(specific);
      if (!cmd) {
        return interaction.reply({
          content: "Command not found.",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(Colors.primary)
        .setTitle(`/${cmd.data.name}`)
        .setDescription(cmd.data.description)
        .addFields(
          { name: "Cooldown", value: `${cmd.cooldown ?? 0}s`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(Colors.primary)
      .setTitle("📖 Bot Commands")
      .setDescription("Select a category below to view commands.")
      .setThumbnail(client.user!.displayAvatarURL())
      .setTimestamp();

    for (const [name, cat] of Object.entries(categories)) {
      const cmds = client.commands.filter((c) => {
        const path = (c as any).__path ?? "";
        return path.includes(name);
      });
      embed.addFields({
        name: `${cat.emoji} ${name.charAt(0).toUpperCase() + name.slice(1)}`,
        value: cat.description,
        inline: true,
      });
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("help-category")
        .setPlaceholder("Select a category")
        .addOptions(
          Object.entries(categories).map(([name, cat]) => ({
            label: name.charAt(0).toUpperCase() + name.slice(1),
            value: name,
            description: cat.description,
            emoji: cat.emoji,
          }))
        )
    );

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) return;

      const category = i.values[0];
      const cmds = [...client.commands.values()];

      const categoryEmbed = new EmbedBuilder()
        .setColor(Colors.primary)
        .setTitle(
          `${categories[category].emoji} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`
        )
        .setDescription(
          cmds.length > 0
            ? cmds.map((c) => `\`/${c.data.name}\` — ${c.data.description}`).join("\n")
            : "No commands in this category."
        )
        .setTimestamp();

      await i.update({ embeds: [categoryEmbed] });
    });
  },
};
