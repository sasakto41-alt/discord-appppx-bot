"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { getGuildIconUrl } from "@/lib/utils";
import Link from "next/link";
import { Plus, Users, Settings } from "lucide-react";

export default function DashboardPage() {
  const { user, loading, fetchUser } = useAuth();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-discord-blurple/30 border-t-discord-blurple rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Требуется авторизация</h2>
          <Link href="/login" className="btn-primary">
            Войти через Discord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold mb-2">Ваши Серверы</h1>
          <p className="text-gray-400">
            Выберите сервер для управления
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.guilds
            .filter((g) => (parseInt(g.permissions) & 0x20) === 0x20)
            .map((guild, index) => (
              <motion.div
                key={guild.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                {guild.botIn ? (
                  <Link href={`/dashboard/${guild.id}`}>
                    <div className="glass-hover p-6 cursor-pointer group">
                      <div className="flex items-center gap-4 mb-4">
                        {guild.icon ? (
                          <img
                            src={getGuildIconUrl(guild.id, guild.icon)}
                            alt={guild.name}
                            className="w-14 h-14 rounded-2xl"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-discord-blurple/20 flex items-center justify-center text-xl font-bold">
                            {guild.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{guild.name}</h3>
                          <span className="text-xs text-discord-green">Бот подключён</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Settings className="w-4 h-4" />
                          <span>Управление</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-discord-blurple text-sm">
                          Открыть →
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <a
                    href={process.env.NEXT_PUBLIC_BOT_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="glass-hover p-6 cursor-pointer opacity-60 hover:opacity-100">
                      <div className="flex items-center gap-4 mb-4">
                        {guild.icon ? (
                          <img
                            src={getGuildIconUrl(guild.id, guild.icon)}
                            alt={guild.name}
                            className="w-14 h-14 rounded-2xl"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-bold text-gray-500">
                            {guild.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{guild.name}</h3>
                          <span className="text-xs text-gray-500">Бот не подключён</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-discord-blurple">
                        <Plus className="w-4 h-4" />
                        <span>Добавить бота</span>
                      </div>
                    </div>
                  </a>
                )}
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
