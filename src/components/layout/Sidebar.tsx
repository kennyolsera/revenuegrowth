"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { NAV_GROUPS } from "./nav-items";
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
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 border-r border-slate-800/80 shadow-xl">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

      {/* Brand Header */}
      <div
        className={cn(
          "relative flex items-center border-b border-slate-800/60 px-4 py-4 transition-all",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/dashboard"
          className={cn("group flex items-center transition-transform hover:scale-[1.02]", isCollapsed && "justify-center")}
        >
          {isCollapsed ? (
            <LogoMark size={36} />
          ) : (
            <Logo tone="light" size={36} />
          )}
        </Link>

        {/* Mobile close button */}
        <button
          onClick={handleClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Grouped Navigation List */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 scrollbar-thin">
        {NAV_GROUPS.map((group, groupIdx) => {
          const groupTitle = t(group.titleKey);

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Section Header */}
              {!isCollapsed ? (
                <div className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {groupTitle}
                </div>
              ) : groupIdx > 0 ? (
                <div className="my-2 border-t border-slate-800/80" />
              ) : null}

              {/* Group Items */}
              {group.items.map((item) => {
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
                      "group relative flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-gradient-to-r from-accent to-accent-violet text-white shadow-glow"
                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                      isCollapsed && "justify-center px-2 py-2.5"
                    )}
                  >
                    {active && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white/80" />
                    )}
                    <Icon
                      className={cn(
                        "shrink-0 transition-transform duration-150 group-hover:scale-110",
                        active ? "text-white" : "text-slate-400 group-hover:text-white",
                        isCollapsed ? "h-5 w-5" : "mr-3 h-[18px] w-[18px]"
                      )}
                    />

                    {!isCollapsed && (
                      <span className="truncate text-xs font-semibold">{translatedLabel}</span>
                    )}

                    {!isCollapsed && active && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />
                    )}

                    {isCollapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg border border-slate-700 whitespace-nowrap group-hover:block">
                        {translatedLabel}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Branding & Collapse Button */}
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
      <aside
        className={cn(
          "hidden shrink-0 transition-all duration-300 ease-in-out lg:block",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {content}
      </aside>

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
