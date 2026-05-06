"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGuild } from "@/hooks/useGuild";
import FeatureToggle from "@/components/shared/FeatureToggle";
import {
  Shield,
  Zap,
  Link2,
  ImageOff,
  Bot,
  Ticket,
  Coins,
  Star,
  Music,
  Sparkles,
  UserCheck,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const { settings, loading, fetchSettings, updateSettings } = useGuild();

  useEffect(() => {
    fetchSettings(guildId);
  }, [guildId, fetchSettings]);

  const toggle = async (key: string) => {
    const current = (settings as Record<string, unknown>)?.[key] as boolean ?? false;
    await updateSettings(guildId, { [key]: !current });
    toast.success(`${key} ${!current ? "включён" : "выключен"}`);
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
        <h1 className="text-3xl font-bold mb-2">Настройки Сервера</h1>
        <p className="text-gray-400">Управление функциями и модулями бота</p>
      </motion.div>

      {/* Защита */}
      <div>
        <h2 className="text-xl font-semibold mb-4">🛡️ Защита</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FeatureToggle
            title="AntiRaid"
            description="Защита от массовых вступлений"
            icon={Shield}
            enabled={settings?.antiRaidEnabled ?? false}
            onToggle={() => toggle("antiRaidEnabled")}
          />
          <FeatureToggle
            title="AntiSpam"
            description="Защита от спама сообщениями"
            icon={Zap}
            enabled={settings?.antiSpamEnabled ?? false}
            onToggle={() => toggle("antiSpamEnabled")}
          />
          <FeatureToggle
            title="AntiLink"
            description="Блокировка ссылок"
            icon={Link2}
            enabled={settings?.antiLinkEnabled ?? false}
            onToggle={() => toggle("antiLinkEnabled")}
          />
          <FeatureToggle
            title="AntiNSFW"
            description="Блокировка NSFW контента"
            icon={ImageOff}
            enabled={settings?.antiNsfwEnabled ?? false}
            onToggle={() => toggle("antiNsfwEnabled")}
          />
          <FeatureToggle
            title="AntiBot"
            description="Защита от ботов"
            icon={Bot}
            enabled={settings?.antiBotEnabled ?? false}
            onToggle={() => toggle("antiBotEnabled")}
          />
          <FeatureToggle
            title="AutoMod"
            description="Автоматическая модерация"
            icon={Shield}
            enabled={settings?.autoModEnabled ?? false}
            onToggle={() => toggle("autoModEnabled")}
          />
        </div>
      </div>

      {/* Модули */}
      <div>
        <h2 className="text-xl font-semibold mb-4">🎮 Модули</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FeatureToggle
            title="Тикеты"
            description="Система поддержки через тикеты"
            icon={Ticket}
            enabled={settings?.ticketEnabled ?? false}
            onToggle={() => toggle("ticketEnabled")}
          />
          <FeatureToggle
            title="Экономика"
            description="Система валюты и магазин"
            icon={Coins}
            enabled={settings?.economyEnabled ?? false}
            onToggle={() => toggle("economyEnabled")}
          />
          <FeatureToggle
            title="Уровни"
            description="Система XP и уровней"
            icon={Star}
            enabled={settings?.levelsEnabled ?? false}
            onToggle={() => toggle("levelsEnabled")}
          />
          <FeatureToggle
            title="Музыка"
            description="Музыкальный плеер"
            icon={Music}
            enabled={settings?.musicEnabled ?? false}
            onToggle={() => toggle("musicEnabled")}
          />
          <FeatureToggle
            title="AI"
            description="ИИ-ответы и ChatGPT"
            icon={Sparkles}
            enabled={settings?.aiEnabled ?? false}
            onToggle={() => toggle("aiEnabled")}
          />
          <FeatureToggle
            title="Верификация"
            description="Верификация новых участников"
            icon={UserCheck}
            enabled={settings?.verifyEnabled ?? false}
            onToggle={() => toggle("verifyEnabled")}
          />
          <FeatureToggle
            title="Капча"
            description="CAPTCHA при верификации"
            icon={Lock}
            enabled={settings?.captchaEnabled ?? false}
            onToggle={() => toggle("captchaEnabled")}
          />
        </div>
      </div>

      {/* Лимиты */}
      <div>
        <h2 className="text-xl font-semibold mb-4">⚙️ Лимиты</h2>
        <div className="glass p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Лимит предупреждений</label>
            <input
              type="number"
              value={settings?.warnLimit ?? 3}
              onChange={(e) => updateSettings(guildId, { warnLimit: parseInt(e.target.value) })}
              className="input-field w-32"
              min={1}
              max={20}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Действие при лимите</label>
            <select
              value={settings?.warnAction ?? "mute"}
              onChange={(e) => updateSettings(guildId, { warnAction: e.target.value })}
              className="input-field w-48"
            >
              <option value="mute">Мут</option>
              <option value="kick">Кик</option>
              <option value="ban">Бан</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Порог антиспама</label>
            <input
              type="number"
              value={settings?.spamThreshold ?? 5}
              onChange={(e) => updateSettings(guildId, { spamThreshold: parseInt(e.target.value) })}
              className="input-field w-32"
              min={3}
              max={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
