"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Coins, Trophy, TrendingUp } from "lucide-react";

interface EconomyUser {
  userId: string;
  balance: number;
  bank: number;
}

export default function EconomyPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [leaderboard, setLeaderboard] = useState<EconomyUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/economy/${guildId}/leaderboard`, {
          params: { type: "economy", limit: 20 },
        });
        setLeaderboard(res.data || []);
      } catch {
        setLeaderboard([]);
      }
      setLoading(false);
    }
    load();
  }, [guildId]);

  const getMedal = (pos: number) => {
    switch (pos) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return `#${pos + 1}`;
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Экономика</h1>
        <p className="text-gray-400">Рейтинг и управление экономикой сервера</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -4 }} className="glass p-6">
          <Coins className="w-8 h-8 text-discord-yellow mb-3" />
          <p className="text-sm text-gray-400">Всего пользователей</p>
          <p className="text-2xl font-bold">{leaderboard.length}</p>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="glass p-6">
          <TrendingUp className="w-8 h-8 text-discord-green mb-3" />
          <p className="text-sm text-gray-400">Общий баланс</p>
          <p className="text-2xl font-bold">
            {leaderboard.reduce((sum, u) => sum + u.balance + u.bank, 0).toLocaleString()}
          </p>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="glass p-6">
          <Trophy className="w-8 h-8 text-discord-fuchsia mb-3" />
          <p className="text-sm text-gray-400">Топ-1 баланс</p>
          <p className="text-2xl font-bold">
            {leaderboard[0] ? (leaderboard[0].balance + leaderboard[0].bank).toLocaleString() : "0"}
          </p>
        </motion.div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">🏆 Рейтинг</h2>
        <div className="glass overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-3 border-discord-blurple/30 border-t-discord-blurple rounded-full animate-spin" />
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="divide-y divide-white/5">
              {leaderboard.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold w-10 text-center">{getMedal(index)}</span>
                    <span className="text-sm">{user.userId}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-400">Кошелёк: </span>
                      <span className="font-medium">{user.balance.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Банк: </span>
                      <span className="font-medium">{user.bank.toLocaleString()}</span>
                    </div>
                    <div className="text-discord-yellow font-bold">
                      {(user.balance + user.bank).toLocaleString()} 💰
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              Нет данных экономики
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
