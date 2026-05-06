"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  Shield,
  Zap,
  Music,
  BarChart3,
  Bot,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Globe,
} from "lucide-react";

const features = [
  { icon: Shield, title: "Продвинутая Модерация", description: "AI-модерация с AntiRaid, AntiSpam, AntiLink и другими системами защиты" },
  { icon: Zap, title: "Авто Настройка", description: "Автоматическая настройка сервера по шаблонам с умными настройками по умолчанию" },
  { icon: Bot, title: "AI Интеграция", description: "Интеграция с ChatGPT для умных ответов и модерации контента" },
  { icon: Music, title: "Музыкальная Система", description: "Высококачественное воспроизведение музыки с управлением очередью" },
  { icon: BarChart3, title: "Аналитика", description: "Детальная статистика сервера и отслеживание активности" },
  { icon: Sparkles, title: "Экономика и Уровни", description: "Полная система экономики с ежедневными наградами, магазином и уровнями XP" },
];

const stats = [
  { icon: Users, value: "10K+", label: "Серверов" },
  { icon: Star, value: "50+", label: "Команд" },
  { icon: Globe, value: "99.9%", label: "Аптайм" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Герой */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-discord-blurple/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-discord-fuchsia/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-discord-blurple/10 border border-discord-blurple/20 text-discord-blurple text-sm mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Премиум Discord Бот
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Лучший
              <br />
              <span className="bg-gradient-to-r from-discord-blurple to-discord-fuchsia bg-clip-text text-transparent">
                Discord Бот
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Профессиональный Discord бот с продвинутой модерацией, системой экономики,
              музыкальным плеером и красивой веб-панелью управления.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                >
                  Открыть Панель
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a
                href={process.env.NEXT_PUBLIC_BOT_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Добавить на Сервер
                </motion.button>
              </a>
            </div>
          </motion.div>

          {/* Статистика */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-12 mt-20"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-discord-blurple" />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Функции */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Мощные Возможности</h2>
            <p className="text-gray-400 text-lg">
              Всё, что нужно для управления вашим Discord сервером
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-hover p-8 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-discord-blurple/10 flex items-center justify-center mb-6 group-hover:bg-discord-blurple/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-discord-blurple" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-discord-blurple/10 to-discord-fuchsia/10" />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">Готовы начать?</h2>
              <p className="text-gray-400 text-lg mb-8">
                Добавьте бота на свой сервер и начните управлять им через панель.
              </p>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Начать Бесплатно
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Футер */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Discord Bot Dashboard. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
