"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}

const colorMap = {
  blue: "from-discord-blurple/20 to-discord-blurple/5 border-discord-blurple/30",
  green: "from-discord-green/20 to-discord-green/5 border-discord-green/30",
  yellow: "from-discord-yellow/20 to-discord-yellow/5 border-discord-yellow/30",
  red: "from-discord-red/20 to-discord-red/5 border-discord-red/30",
  purple: "from-discord-fuchsia/20 to-discord-fuchsia/5 border-discord-fuchsia/30",
};

const iconColorMap = {
  blue: "text-discord-blurple",
  green: "text-discord-green",
  yellow: "text-discord-yellow",
  red: "text-discord-red",
  purple: "text-discord-fuchsia",
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "p-6 rounded-2xl border bg-gradient-to-br backdrop-blur-xl",
        colorMap[color]
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center bg-white/10",
            iconColorMap[color]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs text-discord-green bg-discord-green/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}
