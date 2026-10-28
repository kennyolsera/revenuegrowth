"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

// Pages that render their own full-bleed app (no page padding or max width).
const FULL_BLEED = ["/kanban"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullBleed = FULL_BLEED.some((p) => pathname === p || pathname?.startsWith(p + "/"));
  return (
    <div className="flex h-screen overflow-hidden bg-bg antialiased">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        {fullBleed ? (
          <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
        ) : (
          <main className="flex-1 overflow-y-auto px-4 pb-16 pt-7 sm:px-6 scrollbar-thin">
            <div className="mx-auto max-w-[88rem] space-y-6 animate-fade-in">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
