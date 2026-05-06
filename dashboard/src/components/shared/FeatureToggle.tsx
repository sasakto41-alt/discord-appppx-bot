"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureToggleProps {
  title: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  onToggle: () => void;
  color?: string;
}

export default function FeatureToggle({
  title,
  description,
  icon: Icon,
  enabled,
  onToggle,
}: FeatureToggleProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass p-5 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            enabled
              ? "bg-discord-blurple/20 text-discord-blurple"
              : "bg-white/5 text-gray-500"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={cn(
          "relative w-14 h-7 rounded-full transition-colors duration-300",
          enabled ? "bg-discord-blurple" : "bg-white/10"
        )}
      >
        <motion.div
          animate={{ x: enabled ? 28 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
        />
      </button>
    </motion.div>
  );
}
