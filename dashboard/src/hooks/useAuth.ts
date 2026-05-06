"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { decodeSessionToken } from "@/lib/session";

interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  guilds: Guild[];
}

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
  botIn: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  fetchUser: async () => {
    const token = Cookies.get("token");
    if (!token) {
      set({ user: null, loading: false });
      return;
    }

    // First try to decode the session token directly (new Discord OAuth2 flow).
    // This avoids an extra round-trip to the API when the session is embedded in the cookie.
    const session = decodeSessionToken(token);
    if (session) {
      set({
        user: {
          id: session.userId,
          username: session.username,
          discriminator: session.discriminator,
          avatar: session.avatar,
          guilds: session.guilds.map((g) => ({
            ...g,
            botIn: false, // will be enriched by the API if available
          })),
        },
        loading: false,
      });

      // Optionally enrich guild data from the API in the background
      try {
        const res = await api.get("/api/auth/me");
        set({ user: res.data, loading: false });
      } catch {
        // Non-fatal: keep the session data we already have
      }
      return;
    }

    // Fallback: legacy JWT flow — ask the API to validate the token
    try {
      const res = await api.get("/api/auth/me");
      set({ user: res.data, loading: false });
    } catch {
      Cookies.remove("token");
      set({ user: null, loading: false });
    }
  },

  logout: () => {
    Cookies.remove("token");
    Cookies.remove("session");
    set({ user: null });
    window.location.href = "/login";
  },
}));
