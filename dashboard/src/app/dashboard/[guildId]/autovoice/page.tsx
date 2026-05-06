"use client";

import { motion } from "framer-motion";
import { Mic2, Plus, Settings } from "lucide-react";

export default function AutoVoicePage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">АвтоГолос</h1>
        <p className="text-gray-400">Автоматическое создание голосовых каналов</p>
      </motion.div>

      <div className="glass p-6">
        <h3 className="font-semibold mb-4">Как это работает</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <p>1. Бот создаёт канал «Создать комнату»</p>
          <p>2. Когда пользователь заходит — создаётся личный голосовой канал</p>
          <p>3. Когда все выходят — канал удаляется автоматически</p>
        </div>
      </div>

      <div className="glass p-12 text-center">
        <Mic2 className="w-16 h-16 mx-auto mb-4 text-discord-green" />
        <p className="text-gray-500">
          Настройте через команду <code className="text-discord-blurple">/setup autovoice</code> в Discord
        </p>
      </div>
    </div>
  );
}
