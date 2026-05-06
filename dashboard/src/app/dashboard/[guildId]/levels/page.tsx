"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Star, MessageSquare } from "lucide-react";

interface LevelUser {
  userId: string;
  xp: number;
  level: number;
  messages: number;
}

export default function LevelsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [leaderboard, setLeaderboard] = useState<LevelUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/economy/${guildId}/leaderboard`, {
          params: { type: "levels", limit: 20 },
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
        <h1 className="text-3xl font-bold mb-2">Уровни</h1>
        <p className="text-gray-400">Рейтинг уровней участников сервера</p>
      </motion.div>

      <div className="glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-discord-blurple/30 border-t-discord-blurple rounded-full animate-spin" />
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="divide-y divide-white/5">
            {leaderboard.map((user, index) => {
              const xpForNext = 5 * user.level * user.level + 50 * user.level + 100;
              const progress = Math.min((user.xp / (xpForNext + user.xp)) * 100, 100);

              return (
                <div key={user.userId} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold w-10 text-center">{getMedal(index)}</span>
                    <div>
                      <span className="text-sm font-medium">{user.userId}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{user.messages.toLocaleString()} сообщений</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{user.xp.toLocaleString()} XP</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-discord-blurple rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-discord-blurple font-bold">
                      <Star className="w-4 h-4" />
                      <span>Ур. {user.level}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            Нет данных об уровнях
          </div>
        )}
      </div>
    </div>
  );
}
