"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { FileText, Filter } from "lucide-react";

interface LogEntry {
  id: string;
  userId: string;
  modId: string;
  action: string;
  reason: string | null;
  createdAt: string;
}

export default function LogsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/logs/${guildId}`, {
          params: { page, action: filter || undefined },
        });
        setLogs(res.data.logs || []);
        setTotalPages(res.data.pages || 1);
      } catch {
        setLogs([]);
      }
      setLoading(false);
    }
    load();
  }, [guildId, page, filter]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Логи Сервера</h1>
        <p className="text-gray-400">История действий и событий</p>
      </motion.div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="input-field w-48"
          >
            <option value="">Все действия</option>
            <option value="BAN">Баны</option>
            <option value="KICK">Кики</option>
            <option value="MUTE">Муты</option>
            <option value="WARN">Предупреждения</option>
            <option value="PURGE">Очистка</option>
          </select>
        </div>
      </div>

      <div className="glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-discord-blurple/30 border-t-discord-blurple rounded-full animate-spin" />
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Действие</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Пользователь</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Модератор</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Причина</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-discord-blurple/10 text-discord-blurple">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{log.userId}</td>
                      <td className="p-4 text-sm">{log.modId}</td>
                      <td className="p-4 text-sm text-gray-400">{log.reason ?? "—"}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString("ru-RU")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-white/5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                ← Назад
              </button>
              <span className="text-sm text-gray-400">
                Страница {page} из {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Далее →
              </button>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500">Нет записей</p>
          </div>
        )}
      </div>
    </div>
  );
}
