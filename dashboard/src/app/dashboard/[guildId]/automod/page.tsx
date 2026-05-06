"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGuild } from "@/hooks/useGuild";
import FeatureToggle from "@/components/shared/FeatureToggle";
import { Shield, Zap, Link2, ImageOff, Bot } from "lucide-react";
import toast from "react-hot-toast";

export default function AutoModPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const { settings, fetchSettings, updateSettings } = useGuild();

  useEffect(() => {
    fetchSettings(guildId);
  }, [guildId, fetchSettings]);

  const toggle = async (key: string) => {
    const current = (settings as Record<string, unknown>)?.[key] as boolean ?? false;
    await updateSettings(guildId, { [key]: !current });
    toast.success(`${!current ? "Включено" : "Выключено"}`);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">АвтоМодерация</h1>
        <p className="text-gray-400">Настройка автоматической модерации</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeatureToggle title="АвтоМод" description="Главный переключатель автомодерации" icon={Shield} enabled={settings?.autoModEnabled ?? false} onToggle={() => toggle("autoModEnabled")} />
        <FeatureToggle title="AntiSpam" description="Автоматическое обнаружение спама" icon={Zap} enabled={settings?.antiSpamEnabled ?? false} onToggle={() => toggle("antiSpamEnabled")} />
        <FeatureToggle title="AntiLink" description="Удаление ссылок из сообщений" icon={Link2} enabled={settings?.antiLinkEnabled ?? false} onToggle={() => toggle("antiLinkEnabled")} />
        <FeatureToggle title="AntiNSFW" description="Блокировка неприемлемого контента" icon={ImageOff} enabled={settings?.antiNsfwEnabled ?? false} onToggle={() => toggle("antiNsfwEnabled")} />
        <FeatureToggle title="AntiRaid" description="Защита от массовых вступлений" icon={Shield} enabled={settings?.antiRaidEnabled ?? false} onToggle={() => toggle("antiRaidEnabled")} />
        <FeatureToggle title="AntiBot" description="Блокировка подозрительных аккаунтов" icon={Bot} enabled={settings?.antiBotEnabled ?? false} onToggle={() => toggle("antiBotEnabled")} />
      </div>

      <div className="glass p-6 space-y-4">
        <h3 className="font-semibold">Настройки порогов</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Порог антиспама (сообщений за 3 сек)</label>
            <input type="number" value={settings?.spamThreshold ?? 5} onChange={(e) => updateSettings(guildId, { spamThreshold: parseInt(e.target.value) })} className="input-field w-32" min={3} max={20} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Порог антирейда (вступлений за 10 сек)</label>
            <input type="number" value={settings?.raidThreshold ?? 10} onChange={(e) => updateSettings(guildId, { raidThreshold: parseInt(e.target.value) })} className="input-field w-32" min={3} max={50} />
          </div>
        </div>
      </div>
    </div>
  );
}
