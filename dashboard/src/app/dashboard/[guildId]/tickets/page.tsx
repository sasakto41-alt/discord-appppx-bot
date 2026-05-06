"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Ticket, Clock, CheckCircle, XCircle } from "lucide-react";

interface TicketData {
  id: string;
  channelId: string;
  userId: string;
  subject: string | null;
  status: string;
  createdAt: string;
  closedAt: string | null;
  _count: { messages: number };
}

export default function TicketsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/moderation/${guildId}/tickets`, {
          params: { status: filter || undefined },
        });
        setTickets(res.data || []);
      } catch {
        setTickets([]);
      }
      setLoading(false);
    }
    load();
  }, [guildId, filter]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Тикеты</h1>
        <p className="text-gray-400">Управление тикетами поддержки</p>
      </motion.div>

      <div className="flex gap-2">
        {["", "open", "closed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              filter === f ? "bg-discord-blurple/20 text-white" : "text-gray-400 hover:bg-white/5"
            }`}
          >
            {f === "" ? "Все" : f === "open" ? "Открытые" : "Закрытые"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-3 border-discord-blurple/30 border-t-discord-blurple rounded-full animate-spin" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <motion.div key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  ticket.status === "open" ? "bg-discord-green/10" : "bg-gray-500/10"
                }`}>
                  {ticket.status === "open" ? (
                    <CheckCircle className="w-5 h-5 text-discord-green" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{ticket.subject ?? "Без темы"}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>ID: {ticket.userId}</span>
                    <span>•</span>
                    <span>{ticket._count.messages} сообщений</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  ticket.status === "open" ? "bg-discord-green/10 text-discord-green" : "bg-gray-500/10 text-gray-500"
                }`}>
                  {ticket.status === "open" ? "Открыт" : "Закрыт"}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ticket.createdAt).toLocaleDateString("ru-RU")}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass p-12 text-center">
          <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">Нет тикетов</p>
        </div>
      )}
    </div>
  );
}
