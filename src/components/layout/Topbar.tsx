"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  LogOut,
  User as UserIcon,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NAV_ITEMS } from "./nav-items";
import { useLanguage } from "@/lib/LanguageContext";
import { useSidebar } from "@/lib/SidebarContext";
import { cn } from "@/lib/utils";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { isCollapsed, toggleCollapsed, setMobileOpen } = useSidebar();
  const [email, setEmail] = useState<string | null>(null);

  const current = NAV_ITEMS.find(
    (i) => pathname === i.href || (i.href !== "/dashboard" && pathname.startsWith(i.href + "/"))
  );

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-surface px-4 sm:px-6">
      {/* Left section: Collapse Toggle & Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => (onMenuClick ? onMenuClick() : setMobileOpen(true))}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={toggleCollapsed}
          title={isCollapsed ? t("expand_sidebar") : t("collapse_sidebar")}
          className="hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy lg:flex items-center justify-center"
        >
          {isCollapsed ? (
            <PanelLeft className="h-5 w-5 text-accent" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-accent">
            {current?.icon ? <current.icon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-ink sm:text-[15px]">
            {current ? t(current.translationKey) : t("app_title")}
          </h1>
        </div>
      </div>

      {/* Right section: Language Switcher & User Controls (Pojok Kanan Atas) */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/90 p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => setLanguage("id")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                language === "id"
                  ? "bg-white text-navy shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-800"
              )}
              title="Bahasa Indonesia"
            >
              <span className="text-sm leading-none">🇮🇩</span>
              <span className="font-mono">ID</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                language === "en"
                  ? "bg-white text-navy shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-800"
              )}
              title="English"
            >
              <span className="text-sm leading-none">🇬🇧</span>
              <span className="font-mono">EN</span>
            </button>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 sm:flex">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
            {email ? email[0].toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
          </div>
          <span className="max-w-[140px] truncate text-xs font-medium text-slate-700">
            {email ?? t("user")}
          </span>
        </div>

        <button
          onClick={handleLogout}
          title={t("logout")}
          className="flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-status-danger"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t("logout")}</span>
        </button>
      </div>
    </header>
  );
}
