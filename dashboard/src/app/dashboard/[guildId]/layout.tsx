"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export default function GuildLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const guildId = params.guildId as string;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar
        guildId={guildId}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <main className={cn("transition-all duration-300 p-6 lg:p-8", collapsed ? "ml-[72px]" : "ml-[260px]")}>
        {children}
      </main>
    </div>
  );
}
