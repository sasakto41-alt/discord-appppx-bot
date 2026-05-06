"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import StatsCard from "@/components/shared/StatsCard";
import {
  Shield,
  Users,
  Ticket,
  AlertTriangle,
  Ban,
  Volume2,
  Coins,
  Star,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api";

interface GuildStats {
  guild: { name: string } | null;
  moderation: {
    activeWarns: number;
    totalBans: number;
    totalMutes: number;
    recentActions: number;
    actionsByType: Array<{ action: string; count: number }>;
  };
  tickets: { total: number; open: number };
  economy: { activeUsers: number };
  levels: { activeUsers: number };
}

export default function GuildOverview() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [stats, setStats] = useState<GuildStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/stats/${guildId}`);
        setStats(res.data);
      } catch {
        // Use defaults if API unavailable
        setStats({
          guild: { name: "Сервер" },
          moderation: { activeWarns: 0, totalBans: 0, totalMutes: 0, recentActions: 0, actionsByType: [] },
          tickets: { total: 0, open: 0 },
          economy: { activeUsers: 0 },
          levels: { activeUsers: 0 },
        });
      }
      setLoading(false);
    }
    load();
  }, [guildId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-discord-blurple/30 border-t-discord-blurple rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Обзор Сервера</h1>
        <p className="text-gray-400">Статистика и аналитика вашего сервера</p>
      </motion.div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Активные предупреждения"
          value={stats?.moderation.activeWarns ?? 0}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatsCard
          title="Всего банов"
          value={stats?.moderation.totalBans ?? 0}
          icon={Ban}
          color="red"
        />
        <StatsCard
          title="Открытые тикеты"
          value={stats?.tickets.open ?? 0}
          icon={Ticket}
          color="blue"
        />
        <StatsCard
          title="Действия за неделю"
          value={stats?.moderation.recentActions ?? 0}
          icon={TrendingUp}
          color="green"
          trend="+12%"
        />
      </div>

      {/* Вторая строка */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Пользователей экономики"
          value={stats?.economy.activeUsers ?? 0}
          icon={Coins}
          color="yellow"
        />
        <StatsCard
          title="Пользователей уровней"
          value={stats?.levels.activeUsers ?? 0}
          icon={Star}
          color="purple"
        />
        <StatsCard
          title="Всего тикетов"
          value={stats?.tickets.total ?? 0}
          icon={Ticket}
          color="blue"
        />
      </div>

      {/* Быстрые действия */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">Быстрые Действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Shield, label: "Модерация", href: "moderation", color: "text-discord-red" },
            { icon: Users, label: "Роли", href: "roles", color: "text-discord-blurple" },
            { icon: Volume2, label: "Логи", href: "logs", color: "text-discord-green" },
            { icon: Coins, label: "Экономика", href: "economy", color: "text-discord-yellow" },
          ].map((action) => (
            <motion.a
              key={action.href}
              href={`/dashboard/${guildId}/${action.href}`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="glass-hover p-5 flex items-center gap-4 cursor-pointer"
            >
              <action.icon className={`w-8 h-8 ${action.color}`} />
              <span className="font-medium">{action.label}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Действия модерации */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Действия Модерации (30 дней)</h2>
        <div className="glass p-6">
          {stats?.moderation.actionsByType && stats.moderation.actionsByType.length > 0 ? (
            <div className="space-y-3">
              {stats.moderation.actionsByType.map((at) => (
                <div key={at.action} className="flex items-center justify-between">
                  <span className="text-gray-400">{at.action}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-40 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-discord-blurple rounded-full"
                        style={{
                          width: `${Math.min((at.count / Math.max(...stats.moderation.actionsByType.map((a) => a.count))) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{at.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Нет данных за последние 30 дней</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
