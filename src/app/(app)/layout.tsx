"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-canvas antialiased">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 scrollbar-thin">
          <div className="mx-auto max-w-[88rem] space-y-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
