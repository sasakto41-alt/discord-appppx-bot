"use client";

import { motion } from "framer-motion";
import { Music, Volume2, SkipForward, Pause } from "lucide-react";

export default function MusicPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Музыка</h1>
        <p className="text-gray-400">Музыкальный плеер для голосовых каналов</p>
      </motion.div>

      <div className="glass p-12 text-center">
        <Music className="w-16 h-16 mx-auto mb-4 text-discord-blurple animate-float" />
        <h3 className="text-lg font-semibold mb-2">Музыкальный плеер</h3>
        <p className="text-gray-500 mb-6">
          Управляйте музыкой через slash-команды в Discord
        </p>
        <div className="flex justify-center gap-4">
          <div className="glass px-4 py-2 rounded-lg text-sm">
            <code className="text-discord-blurple">/play</code> — Воспроизвести
          </div>
          <div className="glass px-4 py-2 rounded-lg text-sm">
            <code className="text-discord-blurple">/skip</code> — Пропустить
          </div>
          <div className="glass px-4 py-2 rounded-lg text-sm">
            <code className="text-discord-blurple">/stop</code> — Остановить
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-6">
          Требуется настройка Lavalink сервера для полноценной работы
        </p>
      </div>
    </div>
  );
}
