"use client";

import { create } from "zustand";
import api from "@/lib/api";

interface GuildSettings {
  modEnabled: boolean;
  autoModEnabled: boolean;
  antiRaidEnabled: boolean;
  antiSpamEnabled: boolean;
  antiLinkEnabled: boolean;
  antiNsfwEnabled: boolean;
  antiBotEnabled: boolean;
  verifyEnabled: boolean;
  ticketEnabled: boolean;
  economyEnabled: boolean;
  levelsEnabled: boolean;
  musicEnabled: boolean;
  aiEnabled: boolean;
  captchaEnabled: boolean;
  modLogChannel: string | null;
  welcomeChannel: string | null;
  logChannel: string | null;
  ticketCategory: string | null;
  autoRole: string[];
  warnLimit: number;
  warnAction: string;
  spamThreshold: number;
  raidThreshold: number;
  captchaType: string;
  [key: string]: unknown;
}

interface GuildState {
  settings: GuildSettings | null;
  loading: boolean;
  fetchSettings: (guildId: string) => Promise<void>;
  updateSettings: (guildId: string, updates: Partial<GuildSettings>) => Promise<void>;
}

export const useGuild = create<GuildState>((set, get) => ({
  settings: null,
  loading: true,

  fetchSettings: async (guildId: string) => {
    try {
      const res = await api.get(`/api/settings/${guildId}`);
      set({ settings: res.data, loading: false });
    } catch {
      set({ settings: null, loading: false });
    }
  },

  updateSettings: async (guildId: string, updates: Partial<GuildSettings>) => {
    try {
      const res = await api.patch(`/api/settings/${guildId}`, updates);
      set({ settings: { ...get().settings!, ...res.data } });
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  },
}));
