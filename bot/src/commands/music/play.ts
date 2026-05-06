import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { BotClient } from "../../structures/BotClient";
import { Colors, errorEmbed } from "../../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music in a voice channel")
    .addStringOption((o) =>
      o.setName("query").setDescription("Song name or URL").setRequired(true)
    ),

  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
    const member = interaction.guild!.members.cache.get(interaction.user.id);
    const voiceChannel = member?.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [errorEmbed("Error", "You must be in a voice channel to use this command.")],
        ephemeral: true,
      });
    }

    const query = interaction.options.getString("query", true);

    // Music player placeholder — requires Lavalink or similar setup
    const embed = new EmbedBuilder()
      .setColor(Colors.primary)
      .setTitle("🎵 Music Player")
      .setDescription(
        `**Searching for:** ${query}\n\n` +
        "⚠️ Music functionality requires a Lavalink server.\n" +
        "Configure `LAVALINK_HOST`, `LAVALINK_PORT`, and `LAVALINK_PASSWORD` in your `.env` file."
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
