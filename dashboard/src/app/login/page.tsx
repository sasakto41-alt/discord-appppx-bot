"use client";

import dynamic from "next/dynamic";

const LoginPage = dynamic(() => import("@/components/shared/LoginPage"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#5865f2]/30 border-t-[#5865f2] rounded-full animate-spin" />
    </div>
  ),
});

export default function Page() {
  return <LoginPage />;
}
