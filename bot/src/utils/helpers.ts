import ms from "ms";
import { PermissionFlagsBits, type GuildMember } from "discord.js";

export function parseDuration(input: string): number | null {
  try {
    const result = ms(input);
    return typeof result === "number" ? result : null;
  } catch {
    return null;
  }
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function canModerate(
  moderator: GuildMember,
  target: GuildMember
): { allowed: boolean; reason?: string } {
  if (target.id === moderator.guild.ownerId) {
    return { allowed: false, reason: "Cannot moderate the server owner" };
  }

  if (moderator.id === target.id) {
    return { allowed: false, reason: "Cannot moderate yourself" };
  }

  if (
    moderator.roles.highest.position <= target.roles.highest.position &&
    moderator.id !== moderator.guild.ownerId
  ) {
    return { allowed: false, reason: "Target has equal or higher role" };
  }

  const botMember = moderator.guild.members.me;
  if (botMember && botMember.roles.highest.position <= target.roles.highest.position) {
    return { allowed: false, reason: "Bot cannot moderate this user (role hierarchy)" };
  }

  return { allowed: true };
}

export function hasPermission(
  member: GuildMember,
  permission: bigint
): boolean {
  return (
    member.permissions.has(permission) ||
    member.permissions.has(PermissionFlagsBits.Administrator)
  );
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

export function generateCaptcha(): { text: string; answer: string } {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let text = "";
  for (let i = 0; i < 6; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return { text, answer: text };
}

export function calculateXpForLevel(level: number): number {
  return 5 * level * level + 50 * level + 100;
}

export function calculateLevel(totalXp: number): number {
  let level = 0;
  let xpNeeded = calculateXpForLevel(level);
  let remaining = totalXp;

  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level++;
    xpNeeded = calculateXpForLevel(level);
  }

  return level;
}
