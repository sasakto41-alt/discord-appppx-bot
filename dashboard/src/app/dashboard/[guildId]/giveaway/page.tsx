"use client";

import { motion } from "framer-motion";
import { Gift, Clock, Trophy } from "lucide-react";

export default function GiveawayPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Розыгрыши</h1>
        <p className="text-gray-400">Управление розыгрышами на сервере</p>
      </motion.div>

      <div className="glass p-12 text-center">
        <Gift className="w-16 h-16 mx-auto mb-4 text-discord-fuchsia" />
        <h3 className="text-lg font-semibold mb-2">Розыгрыши управляются через Discord</h3>
        <p className="text-gray-500 mb-4">
          Используйте следующие команды для управления:
        </p>
        <div className="space-y-2 text-sm">
          <div className="inline-block glass px-4 py-2 rounded-lg">
            <code className="text-discord-blurple">/giveaway start</code> — Начать розыгрыш
          </div>
          <br />
          <div className="inline-block glass px-4 py-2 rounded-lg">
            <code className="text-discord-blurple">/giveaway end</code> — Завершить розыгрыш
          </div>
          <br />
          <div className="inline-block glass px-4 py-2 rounded-lg">
            <code className="text-discord-blurple">/giveaway reroll</code> — Перевыбрать победителя
          </div>
        </div>
      </div>
    </div>
  );
}
