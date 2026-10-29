"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { List as Menu, SignOut as LogOut, User as UserIcon, SidebarSimple as PanelLeftClose, SidebarSimple as PanelLeft, Sun, Moon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { NAV_ITEMS } from "./nav-items";
import { useLanguage } from "@/lib/LanguageContext";
import { useSidebar } from "@/lib/SidebarContext";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

/** Reads/writes the theme knob (DESIGN.md › User-tunable knobs). Cached in localStorage. */
function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    if (next === "dark") root.dataset.theme = "dark";
    else delete root.dataset.theme;
    try {
      const prefs = JSON.parse(localStorage.getItem("rgd-prefs") || "{}");
      localStorage.setItem("rgd-prefs", JSON.stringify({ ...prefs, theme: next }));
    } catch {
      /* storage unavailable: the choice still applies for this visit */
    }
    setTheme(next);
  };

  return [theme, toggle];
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { isCollapsed, toggleCollapsed, setMobileOpen } = useSidebar();
  const [email, setEmail] = useState<string | null>(null);
  const [theme, toggleTheme] = useTheme();

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

  const iconBtn =
    "inline-flex h-[30px] w-[30px] items-center justify-center rounded-md text-text-2 transition-colors hover:bg-surface-2 hover:text-text";

  return (
    <header className="sticky top-0 z-30 flex h-[46px] shrink-0 items-center justify-between gap-3 border-b border-border bg-bg px-4 sm:px-6">
      {/* Left: menu / collapse, then breadcrumb */}
      <div className="flex min-w-0 items-center gap-1.5">
        <button
          onClick={() => (onMenuClick ? onMenuClick() : setMobileOpen(true))}
          className={cn(iconBtn, "lg:hidden")}
          aria-label="Buka menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <button
          onClick={toggleCollapsed}
          title={isCollapsed ? t("expand_sidebar") : t("collapse_sidebar")}
          aria-label={isCollapsed ? t("expand_sidebar") : t("collapse_sidebar")}
          className={cn(iconBtn, "hidden lg:inline-flex")}
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        <nav aria-label="Breadcrumb" className="ml-1 flex min-w-0 items-center text-[12.5px]">
          <span className="hidden text-text-3 sm:inline">{t("app_title")}</span>
          <span className="mx-1.5 hidden text-text-4 sm:inline">/</span>
          <span aria-current="page" className="truncate text-[12.5px] font-medium text-text">
            {current ? t(current.translationKey) : t("app_title")}
          </span>
        </nav>
      </div>

      {/* Right: language, theme, user, logout */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div role="radiogroup" aria-label="Language" className="inline-flex rounded-md bg-surface-3 p-0.5">
          {(["id", "en"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              role="radio"
              aria-checked={language === lang}
              onClick={() => setLanguage(lang)}
              title={lang === "id" ? "Bahasa Indonesia" : "English"}
              className={cn(
                "inline-flex h-6 items-center rounded-xs px-2 text-xs font-medium uppercase transition-colors",
                language === lang ? "bg-surface text-text shadow-sm" : "text-text-3 hover:text-text"
              )}
            >
              {lang}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className={iconBtn}
          aria-label={theme === "dark" ? "Mode terang" : "Mode gelap"}
          title={theme === "dark" ? "Mode terang" : "Mode gelap"}
        >
          {theme === "dark" ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
        </button>

        <div className="hidden items-center gap-2 pl-1 sm:flex">
          <span
            aria-hidden
            className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent"
          >
            {email ? email[0].toUpperCase() : <UserIcon className="h-3 w-3" />}
          </span>
          <span className="max-w-[140px] truncate text-xs text-text-2">{email ?? t("user")}</span>
        </div>

        <button
          onClick={handleLogout}
          title={t("logout")}
          className="inline-flex h-[30px] items-center gap-1.5 rounded-md px-2 text-xs font-medium text-text-2 transition-colors hover:bg-surface-2 hover:text-red"
        >
          <LogOut className="h-[15px] w-[15px]" />
          <span className="hidden sm:inline">{t("logout")}</span>
        </button>
      </div>
    </header>
  );
}
