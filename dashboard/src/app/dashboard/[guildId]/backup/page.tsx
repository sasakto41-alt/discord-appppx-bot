"use client";

import { motion } from "framer-motion";
import { Database, Download, Upload, Clock } from "lucide-react";

export default function BackupPage() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Бэкапы</h1>
        <p className="text-gray-400">Резервное копирование и восстановление сервера</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <motion.div whileHover={{ y: -4 }} className="glass p-6 cursor-pointer">
          <Download className="w-10 h-10 text-discord-blurple mb-4" />
          <h3 className="text-lg font-semibold mb-2">Создать Бэкап</h3>
          <p className="text-sm text-gray-400">
            Сохранить текущие каналы, роли и настройки сервера
          </p>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="glass p-6 cursor-pointer">
          <Upload className="w-10 h-10 text-discord-green mb-4" />
          <h3 className="text-lg font-semibold mb-2">Восстановить</h3>
          <p className="text-sm text-gray-400">
            Восстановить сервер из сохранённого бэкапа
          </p>
        </motion.div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">История бэкапов</h2>
        <div className="glass p-12 text-center">
          <Database className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">Бэкапы пока отсутствуют</p>
          <p className="text-sm text-gray-600 mt-2">
            Используйте команду <code className="text-discord-blurple">/backup create</code> в Discord
          </p>
        </div>
      </div>
    </div>
  );
}
