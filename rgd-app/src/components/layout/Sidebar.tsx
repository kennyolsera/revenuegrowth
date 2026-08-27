"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  X,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { useLanguage } from "@/lib/LanguageContext";
import { useSidebar } from "@/lib/SidebarContext";
import { cn } from "@/lib/utils";

export function Sidebar({
  mobileOpen: propMobileOpen,
  onClose: propOnClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isCollapsed, toggleCollapsed, mobileOpen: ctxMobileOpen, setMobileOpen } = useSidebar();

  const isMobileOpen = propMobileOpen !== undefined ? propMobileOpen : ctxMobileOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    setMobileOpen(false);
  };

  const content = (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 border-r border-slate-800/80 shadow-xl">
      {/* Brand Header */}
      <div
        className={cn(
          "flex items-center border-b border-slate-800/60 px-4 py-4.5 transition-all",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/dashboard"
          className={cn("flex items-center gap-3 group", isCollapsed && "justify-center")}
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-blue-500 shadow-md shadow-accent/25 transition-transform group-hover:scale-105">
            <LayoutDashboard className="h-5 w-5 text-white" />
            <div className="absolute -inset-0.5 -z-10 rounded-xl bg-accent opacity-30 blur-sm group-hover:opacity-60" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-bold tracking-tight text-white leading-tight">
                Revenue Growth
              </span>
              <span className="block text-[11px] font-medium text-slate-400">
                VAS Operations Hub
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          onClick={handleClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Tutup menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          const Icon = item.icon;
          const translatedLabel = t(item.translationKey);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClose}
              title={isCollapsed ? translatedLabel : undefined}
              className={cn(
                "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-gradient-to-r from-accent to-accent/80 text-white shadow-md shadow-accent/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
                isCollapsed && "justify-center px-2 py-3"
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 transition-transform duration-150 group-hover:scale-110",
                  active ? "text-white" : "text-slate-400 group-hover:text-white",
                  isCollapsed ? "h-5 w-5" : "h-4.5 w-4.5 mr-3"
                )}
              />

              {!isCollapsed && (
                <span className="truncate">{translatedLabel}</span>
              )}

              {!isCollapsed && active && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg border border-slate-700 whitespace-nowrap group-hover:block">
                  {translatedLabel}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding & Toggle */}
      <div
        className={cn(
          "border-t border-slate-800/60 p-3 text-xs text-slate-400 flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-400">v1.0 • VAS Live</span>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          title={isCollapsed ? t("expand_sidebar") : t("collapse_sidebar")}
          className="hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:flex items-center justify-center"
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4 text-accent" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar with animated width transition */}
      <aside
        className={cn(
          "hidden shrink-0 transition-all duration-300 ease-in-out lg:block",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
          />
          <div className="absolute inset-y-0 left-0 w-72 shadow-2xl animate-slide-right">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
