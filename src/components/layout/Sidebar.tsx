"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, PanelLeftClose, PanelLeft } from "lucide-react";
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
    <div className="relative flex h-full flex-col overflow-hidden bg-surface text-ink-body border-r border-surface-border">
      {/* Brand Header */}
      <div
        className={cn(
          "relative flex items-center border-b border-surface-border px-4 py-4 h-16 transition-all",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link href="/dashboard" className={cn("flex items-center", isCollapsed && "justify-center")}>
          {isCollapsed ? <LogoMark size={30} /> : <Logo tone="dark" size={30} />}
        </Link>

        {/* Mobile close button */}
        <button
          onClick={handleClose}
          className="rounded-md p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Grouped Navigation List */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {NAV_GROUPS.map((group, groupIdx) => {
          const groupTitle = t(group.titleKey);

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Section Header */}
              {!isCollapsed ? (
                <div className="label-mono px-3 pb-1.5 pt-1 text-ink-faint">{groupTitle}</div>
              ) : groupIdx > 0 ? (
                <div className="my-2 border-t border-surface-border" />
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
                      "group relative flex items-center rounded-lg px-3 py-2 text-sm transition-colors duration-100",
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-ink-body hover:bg-surface-muted hover:text-ink",
                      isCollapsed && "justify-center px-2 py-2.5"
                    )}
                  >
                    <Icon
                      className={cn(
                        "shrink-0",
                        active ? "text-accent" : "text-ink-muted group-hover:text-ink-body",
                        isCollapsed ? "h-5 w-5" : "mr-3 h-[18px] w-[18px]"
                      )}
                    />

                    {!isCollapsed && (
                      <span className={cn("truncate text-[13px]", active ? "font-semibold" : "font-medium")}>
                        {translatedLabel}
                      </span>
                    )}

                    {isCollapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-ink px-2.5 py-1 text-xs font-medium text-white whitespace-nowrap group-hover:block">
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
          "border-t border-surface-border p-3 flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-success" />
            <span className="label-mono text-ink-faint">v1.0 · VAS Live</span>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          title={isCollapsed ? t("expand_sidebar") : t("collapse_sidebar")}
          className="hidden rounded-md p-1.5 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink lg:flex items-center justify-center"
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4 text-accent" /> : <PanelLeftClose className="h-4 w-4" />}
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
