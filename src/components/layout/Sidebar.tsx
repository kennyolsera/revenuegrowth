"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, SidebarSimple as PanelLeftClose, SidebarSimple as PanelLeft } from "@/components/icons";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { NAV_GROUPS } from "./nav-items";
import { TimelineSubnav } from "./TimelineSubnav";
import { Fragment } from "react";
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
    <div className="relative flex h-full flex-col overflow-hidden border-r border-rail-line bg-rail text-rail-text-2">
      {/* Brand Header */}
      <div
        className={cn(
          "relative flex h-14 items-center px-3 transition-all",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link href="/dashboard" className={cn("flex items-center", isCollapsed && "justify-center")}>
          {isCollapsed ? <LogoMark size={26} tone="light" /> : <Logo tone="light" size={26} subtitle="Revenue Growth · VAS" />}
        </Link>

        {/* Mobile close button */}
        <button
          onClick={handleClose}
          className="rounded-md p-1.5 text-rail-muted hover:bg-rail-hover hover:text-rail-text lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Grouped Navigation List */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 pb-3 pt-1 scrollbar-thin">
        {NAV_GROUPS.map((group, groupIdx) => {
          const groupTitle = t(group.titleKey);

          return (
            <div key={group.id} className="space-y-px">
              {/* Group Section Header */}
              {!isCollapsed ? (
                <div className="px-2 pb-1 pt-1.5 text-[11.5px] font-medium text-rail-muted">{groupTitle}</div>
              ) : groupIdx > 0 ? (
                <div className="mx-2 my-2 border-t border-rail-line" />
              ) : null}

              {/* Group Items */}
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                const Icon = item.icon;
                const translatedLabel = t(item.translationKey);

                return (
                  <Fragment key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleClose}
                    title={isCollapsed ? translatedLabel : undefined}
                    className={cn(
                      "group relative flex h-[30px] items-center rounded-md px-2 text-sm transition-colors",
                      active
                        ? "bg-rail-active text-rail-text shadow-[0_0_0_1px_rgb(var(--c-rail-line)),0_1px_2px_rgb(13_20_36/0.05)]"
                        : "text-rail-text-2 hover:bg-rail-hover hover:text-rail-text",
                      isCollapsed && "h-9 justify-center px-2"
                    )}
                  >
                    <Icon
                      strokeWidth={active ? 2.2 : 1.8}
                      aria-hidden
                      className={cn(
                        "shrink-0",
                        active ? "text-rail-node" : "text-rail-muted group-hover:text-rail-text-2",
                        isCollapsed ? "h-[18px] w-[18px]" : "mr-2 h-[15px] w-[15px]"
                      )}
                    />

                    {!isCollapsed && (
                      <span className={cn("truncate", active ? "font-medium" : "font-side")}>
                        {translatedLabel}
                      </span>
                    )}

                    {isCollapsed && (
                      <div className="pointer-events-none absolute left-full ml-3 z-50 hidden rounded-md bg-text px-2 py-1 text-xs font-medium text-surface whitespace-nowrap shadow-pop group-hover:block">
                        {translatedLabel}
                      </div>
                    )}
                  </Link>
                  {item.href === "/kanban" && active && !isCollapsed && <TimelineSubnav onNavigate={handleClose} />}
                  </Fragment>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Branding & Collapse Button */}
      <div
        className={cn(
          "border-t border-rail-line px-3 py-2 flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && <span className="text-[11.5px] text-rail-muted">Olsera · VAS</span>}
        <button
          onClick={toggleCollapsed}
          title={isCollapsed ? t("expand_sidebar") : t("collapse_sidebar")}
          className="hidden rounded-md p-1.5 text-rail-muted transition-colors hover:bg-rail-hover hover:text-rail-text lg:flex items-center justify-center"
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 lg:block",
          isCollapsed ? "w-[52px]" : "w-[252px]"
        )}
      >
        {content}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-[var(--overlay)] transition-opacity"
            onClick={handleClose}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-pop animate-slide-right">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
