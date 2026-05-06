"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGuild } from "@/hooks/useGuild";
import FeatureToggle from "@/components/shared/FeatureToggle";
import { UserCheck, Lock, Shield } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const { settings, fetchSettings, updateSettings } = useGuild();

  useEffect(() => { fetchSettings(guildId); }, [guildId, fetchSettings]);

  const toggle = async (key: string) => {
    const current = (settings as Record<string, unknown>)?.[key] as boolean ?? false;
    await updateSettings(guildId, { [key]: !current });
    toast.success(!current ? "Включено" : "Выключено");
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Верификация</h1>
        <p className="text-gray-400">Настройка системы верификации участников</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeatureToggle title="Верификация" description="Требовать верификацию для новых участников" icon={UserCheck} enabled={settings?.verifyEnabled ?? false} onToggle={() => toggle("verifyEnabled")} />
        <FeatureToggle title="CAPTCHA" description="Использовать CAPTCHA при верификации" icon={Lock} enabled={settings?.captchaEnabled ?? false} onToggle={() => toggle("captchaEnabled")} />
      </div>

      <div className="glass p-6 space-y-4">
        <h3 className="font-semibold">Настройки верификации</h3>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Тип CAPTCHA</label>
          <select value={settings?.captchaType ?? "button"} onChange={(e) => updateSettings(guildId, { captchaType: e.target.value })} className="input-field w-48">
            <option value="button">Кнопка</option>
            <option value="reaction">Реакция</option>
            <option value="text">Текстовая</option>
          </select>
        </div>
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="text-sm text-gray-400">
            <Shield className="w-4 h-4 inline mr-1" />
            Настройте роль верификации через команду <code className="text-discord-blurple">/setup autorole</code> в Discord
          </p>
        </div>
      </div>
    </div>
  );
}
