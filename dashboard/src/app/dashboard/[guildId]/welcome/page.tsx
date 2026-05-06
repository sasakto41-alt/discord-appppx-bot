"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import FeatureToggle from "@/components/shared/FeatureToggle";
import { Bell, MessageSquare, Mail } from "lucide-react";
import toast from "react-hot-toast";

interface WelcomeConfig {
  welcomeEnabled: boolean;
  welcomeMessage: string;
  welcomeDm: boolean;
  goodbyeEnabled: boolean;
  goodbyeMessage: string;
}

export default function WelcomePage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [config, setConfig] = useState<WelcomeConfig>({
    welcomeEnabled: false,
    welcomeMessage: "Добро пожаловать {user} на {server}!",
    welcomeDm: false,
    goodbyeEnabled: false,
    goodbyeMessage: "До свидания {user}!",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/settings/${guildId}/welcome`);
        if (res.data && Object.keys(res.data).length > 0) {
          setConfig(res.data);
        }
      } catch { /* use defaults */ }
    }
    load();
  }, [guildId]);

  const save = async (updates: Partial<WelcomeConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    try {
      await api.patch(`/api/settings/${guildId}/welcome`, updates);
      toast.success("Настройки сохранены");
    } catch {
      toast.error("Ошибка сохранения");
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Приветствие</h1>
        <p className="text-gray-400">Настройка приветственных и прощальных сообщений</p>
      </motion.div>

      {/* Приветствие */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">👋 Приветствие</h2>
        <FeatureToggle
          title="Приветственное сообщение"
          description="Отправлять сообщение при входе нового участника"
          icon={Bell}
          enabled={config.welcomeEnabled}
          onToggle={() => save({ welcomeEnabled: !config.welcomeEnabled })}
        />
        <FeatureToggle
          title="Приветствие в ЛС"
          description="Отправлять приветствие в личные сообщения"
          icon={Mail}
          enabled={config.welcomeDm}
          onToggle={() => save({ welcomeDm: !config.welcomeDm })}
        />
        <div className="glass p-6">
          <label className="block text-sm font-medium mb-2">Текст приветствия</label>
          <textarea
            value={config.welcomeMessage}
            onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
            onBlur={() => save({ welcomeMessage: config.welcomeMessage })}
            className="input-field h-24 resize-none"
            placeholder="Добро пожаловать {user} на {server}!"
          />
          <p className="text-xs text-gray-500 mt-2">
            Переменные: {"{user}"} — упоминание, {"{username}"} — имя, {"{server}"} — сервер, {"{memberCount}"} — участников
          </p>
        </div>
      </div>

      {/* Прощание */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">👋 Прощание</h2>
        <FeatureToggle
          title="Прощальное сообщение"
          description="Отправлять сообщение при выходе участника"
          icon={MessageSquare}
          enabled={config.goodbyeEnabled}
          onToggle={() => save({ goodbyeEnabled: !config.goodbyeEnabled })}
        />
        <div className="glass p-6">
          <label className="block text-sm font-medium mb-2">Текст прощания</label>
          <textarea
            value={config.goodbyeMessage}
            onChange={(e) => setConfig({ ...config, goodbyeMessage: e.target.value })}
            onBlur={() => save({ goodbyeMessage: config.goodbyeMessage })}
            className="input-field h-24 resize-none"
            placeholder="До свидания {user}!"
          />
        </div>
      </div>
    </div>
  );
}
