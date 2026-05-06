"use client";

import { motion } from "framer-motion";
import StatsCard from "@/components/shared/StatsCard";
import { BarChart3, Users, MessageSquare, Shield, TrendingUp, Activity } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Аналитика</h1>
        <p className="text-gray-400">Статистика и графики активности сервера</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard title="Участников" value="—" icon={Users} color="blue" />
        <StatsCard title="Сообщений за день" value="—" icon={MessageSquare} color="green" />
        <StatsCard title="Действий модерации" value="—" icon={Shield} color="red" />
        <StatsCard title="Активные голосовые" value="—" icon={Activity} color="purple" />
        <StatsCard title="Новые участники" value="—" icon={TrendingUp} color="green" trend="+0%" />
        <StatsCard title="Команд выполнено" value="—" icon={BarChart3} color="yellow" />
      </div>

      <div className="glass p-8 text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-lg font-semibold mb-2">Графики скоро появятся</h3>
        <p className="text-gray-500">
          Подробные графики активности сервера будут доступны после подключения бота и накопления данных.
        </p>
      </div>
    </div>
  );
}
