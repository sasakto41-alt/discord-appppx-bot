import { EmbedBuilder, type ColorResolvable } from "discord.js";

export const Colors = {
  primary: "#5865F2" as ColorResolvable,
  success: "#57F287" as ColorResolvable,
  warning: "#FEE75C" as ColorResolvable,
  danger: "#ED4245" as ColorResolvable,
  info: "#5865F2" as ColorResolvable,
  moderation: "#EB459E" as ColorResolvable,
  economy: "#F1C40F" as ColorResolvable,
  level: "#9B59B6" as ColorResolvable,
} as const;

export function successEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.success)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function errorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.danger)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function infoEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.info)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

export function modEmbed(
  action: string,
  user: string,
  moderator: string,
  reason: string,
  duration?: string
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(Colors.moderation)
    .setTitle(`🔨 ${action}`)
    .addFields(
      { name: "User", value: user, inline: true },
      { name: "Moderator", value: moderator, inline: true },
      { name: "Reason", value: reason || "No reason provided" }
    )
    .setTimestamp();

  if (duration) {
    embed.addFields({ name: "Duration", value: duration, inline: true });
  }

  return embed;
}

export function warnEmbed(
  user: string,
  moderator: string,
  reason: string,
  count: number,
  max: number
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.warning)
    .setTitle("⚠️ Warning")
    .addFields(
      { name: "User", value: user, inline: true },
      { name: "Moderator", value: moderator, inline: true },
      { name: "Reason", value: reason },
      { name: "Warnings", value: `${count}/${max}`, inline: true }
    )
    .setTimestamp();
}
