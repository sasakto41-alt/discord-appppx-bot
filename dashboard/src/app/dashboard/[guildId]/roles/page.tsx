"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Users, Shield } from "lucide-react";

interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
}

export default function RolesPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/guilds/${guildId}/roles`);
        setRoles((res.data || []).sort((a: Role, b: Role) => b.position - a.position));
      } catch {
        setRoles([]);
      }
      setLoading(false);
    }
    load();
  }, [guildId]);

  const colorToHex = (color: number) => (color === 0 ? "#99aab5" : `#${color.toString(16).padStart(6, "0")}`);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Роли</h1>
        <p className="text-gray-400">Управление ролями сервера</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-3 border-discord-blurple/30 border-t-discord-blurple rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {roles.map((role) => (
            <motion.div key={role.id} whileHover={{ x: 4 }} className="glass p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorToHex(role.color) }} />
                <span className="font-medium">{role.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Позиция: {role.position}</span>
                <span className="text-xs font-mono">{role.id}</span>
              </div>
            </motion.div>
          ))}
          {roles.length === 0 && (
            <div className="glass p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              Не удалось загрузить роли
            </div>
          )}
        </div>
      )}
    </div>
  );
}
