import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(id: string, avatar: string | null, discriminator?: string): string {
  if (avatar) {
    return `https://cdn.discordapp.com/avatars/${id}/${avatar}.webp?size=256`;
  }
  const defaultIndex = discriminator
    ? parseInt(discriminator) % 5
    : (BigInt(id) >> 22n) % 6n;
  return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}

export function getGuildIconUrl(id: string, icon: string | null): string {
  if (icon) {
    return `https://cdn.discordapp.com/icons/${id}/${icon}.webp?size=256`;
  }
  return "";
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
