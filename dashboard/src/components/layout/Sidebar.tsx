"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Shield,
  Settings,
  Users,
  Coins,
  BarChart3,
  Ticket,
  Bell,
  Star,
  Music,
  Gift,
  Database,
  Bot,
  FileText,
  Mic2,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  guildId: string;
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Обзор", href: "" },
  { icon: Settings, label: "Настройки", href: "/settings" },
  { icon: Shield, label: "Модерация", href: "/moderation" },
  { icon: Bell, label: "Приветствие", href: "/welcome" },
  { icon: FileText, label: "Логи", href: "/logs" },
  { icon: Ticket, label: "Тикеты", href: "/tickets" },
  { icon: Users, label: "Роли", href: "/roles" },
  { icon: Shield, label: "АвтоМод", href: "/automod" },
  { icon: Bot, label: "Верификация", href: "/verify" },
  { icon: Coins, label: "Экономика", href: "/economy" },
  { icon: Star, label: "Уровни", href: "/levels" },
  { icon: Music, label: "Музыка", href: "/music" },
  { icon: Mic2, label: "АвтоГолос", href: "/autovoice" },
  { icon: Gift, label: "Розыгрыши", href: "/giveaway" },
  { icon: Database, label: "Бэкапы", href: "/backup" },
  { icon: BarChart3, label: "Аналитика", href: "/analytics" },
];

export default function Sidebar({ guildId, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const basePath = `/dashboard/${guildId}`;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      className="fixed left-0 top-0 h-screen bg-discord-dark/80 backdrop-blur-xl border-r border-white/5 z-40 flex flex-col"
    >
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-discord-blurple flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">Панель</span>
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = item.href === "" ? pathname === basePath : pathname === href;

          return (
            <Link key={item.href} href={href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-discord-blurple/20 text-white border-l-2 border-discord-blurple"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium truncate">
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <Link href="/dashboard">
          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Все Серверы</span>}
          </motion.div>
        </Link>
      </div>
    </motion.aside>
  );
}
