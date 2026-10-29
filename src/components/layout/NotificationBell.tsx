"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, AtSign, UserPlus, MessageSquare } from "lucide-react";
import { ptGo, ptSend, usePtNav, type PtNotif } from "@/lib/pt-bridge";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

function ago(at: number, lang: string) {
  const s = Math.max(0, (Date.now() - at) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang === "id" ? "id" : "en", { numeric: "auto", style: "short" });
  if (s < 60) return rtf.format(0, "minute");
  if (s < 3600) return rtf.format(-Math.floor(s / 60), "minute");
  if (s < 86400) return rtf.format(-Math.floor(s / 3600), "hour");
  return rtf.format(-Math.floor(s / 86400), "day");
}

const ICON = { mention: AtSign, assign: UserPlus, comment: MessageSquare } as const;

/**
 * The one bell for the whole dashboard. Project Timeline notifications (mentions, assignments,
 * comments on your tasks) arrive through the kept-alive frame (ADR-014); the template's own bell is hidden.
 */
export function NotificationBell({ className }: { className?: string }) {
  const nav = usePtNav();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const unread = nav?.unread ?? 0;
  const items = nav?.notifs ?? [];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const verb = (n: PtNotif) =>
    n.type === "mention" ? t("notif_mentioned") : n.type === "assign" ? t("notif_assigned") : n.type === "comment" ? t("notif_commented") : n.text;

  const openItem = (n: PtNotif) => {
    setOpen(false);
    router.push("/kanban");
    ptSend({ type: "notif-open", id: n.id });
  };

  return (
    <div ref={box} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread ? `${t("notif_title")} (${unread})` : t("notif_title")}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={t("notif_title")}
        className="relative inline-flex h-[30px] w-[30px] items-center justify-center rounded-md text-text-2 transition-colors hover:bg-surface-2 hover:text-text"
      >
        <Bell className="h-[15px] w-[15px]" />
        {unread > 0 && (
          <span
            data-testid="notif-count"
            className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold tabular-nums text-white"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("notif_title")}
          className="absolute right-0 top-[36px] z-50 w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-[13px] font-semibold text-text">{t("notif_title")}</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => ptSend({ type: "notif-read-all" })}
                className="rounded-md px-1.5 py-0.5 text-xs font-medium text-accent hover:bg-accent/10"
              >
                {t("notif_mark_all")}
              </button>
            )}
          </div>
          <ul className="max-h-[380px] overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-6 text-center text-xs leading-relaxed text-text-3">{t("notif_empty")}</li>}
            {items.map((n) => {
              const Icon = ICON[n.type as keyof typeof ICON] ?? Bell;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    className={cn("flex w-full gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-surface-2", !n.read && "bg-accent/[0.06]")}
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] leading-snug text-text">
                        <b className="font-semibold">{n.by || "Someone"}</b> {verb(n)}
                        {n.title && (
                          <>
                            {" · "}
                            <span className="font-medium">{n.title}</span>
                          </>
                        )}
                      </span>
                      {n.snippet && <span className="mt-0.5 block truncate text-xs text-text-3">{n.snippet}</span>}
                      <span className="mt-0.5 block text-[11px] text-text-4">{ago(n.at, language)}</span>
                    </span>
                    {!n.read && <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/kanban");
              ptGo({ route: "inbox" });
            }}
            className="block w-full border-t border-border px-3 py-2 text-center text-xs font-medium text-text-2 hover:bg-surface-2 hover:text-text"
          >
            {t("notif_open_inbox")}
          </button>
        </div>
      )}
    </div>
  );
}
