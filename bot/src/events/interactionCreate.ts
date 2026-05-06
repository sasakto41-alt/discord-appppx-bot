import {
  Events,
  type ChatInputCommandInteraction,
  type Interaction,
  Collection,
} from "discord.js";
import type { BotClient } from "../structures/BotClient";
import { errorEmbed } from "../utils/embeds";

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: BotClient) {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction, client);
    }
  },
};

async function handleCommand(
  interaction: ChatInputCommandInteraction,
  client: BotClient
) {
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Cooldown check
  if (command.cooldown) {
    if (!client.cooldowns.has(command.data.name)) {
      client.cooldowns.set(command.data.name, new Collection());
    }

    const timestamps = client.cooldowns.get(command.data.name)!;
    const cooldownMs = command.cooldown * 1000;
    const now = Date.now();

    if (timestamps.has(interaction.user.id)) {
      const expiration = timestamps.get(interaction.user.id)! + cooldownMs;
      if (now < expiration) {
        const remaining = ((expiration - now) / 1000).toFixed(1);
        await interaction.reply({
          embeds: [
            errorEmbed(
              "Cooldown",
              `Please wait **${remaining}s** before using this command again.`
            ),
          ],
          ephemeral: true,
        });
        return;
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownMs);
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`[CMD] Error in ${command.data.name}:`, error);

    const reply = {
      embeds: [errorEmbed("Error", "An unexpected error occurred while executing this command.")],
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}
