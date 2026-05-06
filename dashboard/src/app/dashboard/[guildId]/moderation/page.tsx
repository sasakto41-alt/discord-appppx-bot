"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Shield, AlertTriangle, Clock, User, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface ModLog {
  id: string;
  userId: string;
  modId: string;
  action: string;
  reason: string | null;
  duration: number | null;
  createdAt: string;
}

interface Warn {
  id: string;
  userId: string;
  modId: string;
  reason: string;
  createdAt: string;
}

export default function ModerationPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [logs, setLogs] = useState<ModLog[]>([]);
  const [warns, setWarns] = useState<Warn[]>([]);
  const [activeTab, setActiveTab] = useState<"logs" | "warns">("logs");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [logsRes, warnsRes] = await Promise.all([
          api.get(`/api/moderation/${guildId}/logs`),
          api.get(`/api/moderation/${guildId}/warns`),
        ]);
        setLogs(logsRes.data.logs || []);
        setWarns(warnsRes.data || []);
      } catch {
        setLogs([]);
        setWarns([]);
      }
      setLoading(false);
    }
    load();
  }, [guildId]);

  const removeWarn = async (warnId: string) => {
    try {
      await api.delete(`/api/moderation/${guildId}/warns/${warnId}`);
      setWarns(warns.filter((w) => w.id !== warnId));
      toast.success("Предупреждение снято");
    } catch {
      toast.error("Ошибка при снятии предупреждения");
    }
  };

  const actionColors: Record<string, string> = {
    BAN: "text-discord-red bg-discord-red/10",
    KICK: "text-orange-400 bg-orange-400/10",
    MUTE: "text-discord-yellow bg-discord-yellow/10",
    TIMEOUT: "text-discord-yellow bg-discord-yellow/10",
    WARN: "text-discord-yellow bg-discord-yellow/10",
    PURGE: "text-discord-blurple bg-discord-blurple/10",
  };

  const actionNames: Record<string, string> = {
    BAN: "Бан",
    KICK: "Кик",
    MUTE: "Мут",
    TIMEOUT: "Таймаут",
    WARN: "Предупреждение",
    PURGE: "Очистка",
  };

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
        <h1 className="text-3xl font-bold mb-2">Модерация</h1>
        <p className="text-gray-400">Логи модерации и управление предупреждениями</p>
      </motion.div>

      {/* Табы */}
      <div className="flex gap-2">
        {[
          { id: "logs" as const, label: "Логи", icon: Shield },
          { id: "warns" as const, label: "Предупреждения", icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? "bg-discord-blurple/20 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "logs" && (
        <div className="glass overflow-hidden">
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
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${actionColors[log.action] ?? "text-gray-400 bg-white/5"}`}>
                          {actionNames[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{log.userId}</td>
                      <td className="p-4 text-sm">{log.modId}</td>
                      <td className="p-4 text-sm text-gray-400">{log.reason ?? "Без причины"}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Нет записей модерации
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "warns" && (
        <div className="space-y-3">
          {warns.length > 0 ? (
            warns.map((warn) => (
              <motion.div
                key={warn.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-discord-yellow/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-discord-yellow" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="text-sm">{warn.userId}</span>
                    </div>
                    <p className="text-sm text-gray-400">{warn.reason}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(warn.createdAt).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeWarn(warn.id)}
                  className="p-2 rounded-lg hover:bg-discord-red/10 text-gray-400 hover:text-discord-red transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="glass p-8 text-center text-gray-500">
              Нет активных предупреждений
            </div>
          )}
        </div>
      )}
    </div>
  );
}
