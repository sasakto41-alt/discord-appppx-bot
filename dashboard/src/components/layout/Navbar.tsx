"use client";

import { useAuth } from "@/hooks/useAuth";
import { getAvatarUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-discord-blurple to-discord-fuchsia flex items-center justify-center">
              <span className="text-xl font-bold">D</span>
            </div>
            <span className="text-lg font-bold hidden sm:block">
              Discord Бот
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all"
                >
                  <img
                    src={getAvatarUrl(user.id, user.avatar, user.discriminator)}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium hidden sm:block">{user.username}</span>
                </button>

                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden"
                  >
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 hover:bg-white/10 transition-colors text-sm"
                      onClick={() => setShowMenu(false)}
                    >
                      Панель управления
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-sm text-discord-red flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm">
                Войти через Discord
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
