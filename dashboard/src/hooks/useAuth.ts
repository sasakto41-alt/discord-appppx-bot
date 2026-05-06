"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import api from "@/lib/api";

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
    set({ user: null });
    window.location.href = "/login";
  },
}));
