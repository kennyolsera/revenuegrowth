"use client";

import { useMemo, useState } from "react";
import { CaretLeft as ChevronLeft, CaretRight as ChevronRight, Kanban as FolderKanban, PencilSimple as Pencil, Plus, Kanban as SquareKanban } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { moduleLabel, todayISO } from "@/lib/kanban";
import {
  HEALTH_META,
  addMonths,
  monthStart,
  monthsFrom,
  positionIn,
  projectHealth,
  projectProgress,
  type ProjectCard,
  type ProjectHealth,
} from "@/lib/kanban-projects";
import type { KanbanProject } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

const TONE_BAR: Record<"neutral" | "green" | "amber" | "red", { track: string; fill: string; dot: string }> = {
  neutral: { track: "bg-slate-200", fill: "bg-slate-500", dot: "bg-slate-500" },
  green: { track: "bg-accent/15", fill: "bg-accent", dot: "bg-accent" },
  amber: { track: "bg-amber/15", fill: "bg-amber", dot: "bg-amber" },
  red: { track: "bg-red/15", fill: "bg-red", dot: "bg-red" },
};

const RANGES = [3, 6, 12] as const;

/**
 * Project timeline (ADR-005): one row per project, a bar from start to end date,
 * filled to the share of Done cards and coloured by health.
 */
export function ProjectTimeline({
  projects,
  cards,
  onNew,
  onEdit,
  onViewCards,
}: {
  projects: KanbanProject[];
  cards: ProjectCard[];
  onNew: () => void;
  onEdit: (p: KanbanProject) => void;
  onViewCards: (p: KanbanProject) => void;
}) {
  const { t, language } = useLanguage();
  const today = todayISO();
  const [months, setMonths] = useState<(typeof RANGES)[number]>(6);
  const [from, setFrom] = useState(() => addMonths(monthStart(today), -1));
  const [showAll, setShowAll] = useState(false);

  const windowEnd = addMonths(from, months);
  const monthCols = monthsFrom(from, months);
  const monthFmt = new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", {
    month: "short",
    year: months > 6 ? "2-digit" : undefined,
  });
  const dateFmt = new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const fmtDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00`));

  const rows = useMemo(() => {
    return projects
      .map((p) => {
        const progress = projectProgress(p.id, cards, today);
        const health = projectHealth(p, progress, today);
        return { p, progress, health };
      })
      .filter((r) => showAll || (r.health !== "done" && r.health !== "cancelled"))
      .sort((a, b) => a.p.start_date.localeCompare(b.p.start_date) || a.p.name.localeCompare(b.p.name));
  }, [projects, cards, today, showAll]);

  const counts = useMemo(() => {
    const c: Partial<Record<ProjectHealth, number>> = {};
    for (const r of rows) c[r.health] = (c[r.health] ?? 0) + 1;
    return c;
  }, [rows]);

  const todayPos = positionIn(from, windowEnd, today);
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label={t("proj_range")} className="inline-flex rounded-md bg-surface-3 p-0.5">
            {RANGES.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={months === m}
                onClick={() => setMonths(m)}
                className={cn(
                  "h-6 rounded-xs px-2.5 text-xs font-medium transition-colors",
                  months === m ? "bg-surface text-text shadow-sm" : "text-text-3 hover:text-text"
                )}
              >
                {t("proj_months").replace("{n}", String(m))}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-1">
            <Button variant="ghost" size="sm" aria-label={t("proj_prev")} onClick={() => setFrom(addMonths(from, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setFrom(addMonths(monthStart(today), -1))}>
              {t("proj_today")}
            </Button>
            <Button variant="ghost" size="sm" aria-label={t("proj_next")} onClick={() => setFrom(addMonths(from, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-text-2">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-4 w-4 accent-accent" />
            {t("proj_show_closed")}
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-3" aria-label={t("proj_legend")}>
          {(["on_track", "at_risk", "overdue"] as ProjectHealth[]).map((h) => (
            <span key={h} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", TONE_BAR[HEALTH_META[h].tone].dot)} />
              {HEALTH_META[h].label[language]} <span className="num text-text-2">{counts[h] ?? 0}</span>
            </span>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-border bg-surface px-6 py-14 text-center">
          <FolderKanban className="h-6 w-6 text-text-4" aria-hidden />
          <h3 className="mt-3 text-base font-semibold text-text">{t("proj_empty_title")}</h3>
          <p className="mt-1 max-w-sm text-sm text-text-3">{t("proj_empty_desc")}</p>
          <Button className="mt-4" variant="accent" onClick={onNew}>
            <Plus className="h-4 w-4" /> {t("proj_new")}
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface scrollbar-thin">
          <div className="min-w-[900px]">
            {/* Month header */}
            <div className="flex border-b border-border bg-surface-2">
              <div className="sticky left-0 z-[2] w-[300px] shrink-0 border-r border-border bg-surface-2 px-4 py-2 text-xs font-medium text-text-3">
                {t("proj_col_project")}
              </div>
              <div className="relative flex flex-1">
                {monthCols.map((m) => (
                  <div key={m} className="flex-1 border-l border-divider px-2 py-2 text-xs font-medium text-text-3 first:border-l-0">
                    {monthFmt.format(new Date(`${m}T00:00:00`))}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            <ul>
              {rows.map(({ p, progress, health }) => {
                const meta = HEALTH_META[health];
                const tone = TONE_BAR[meta.tone];
                const left = Math.max(0, positionIn(from, windowEnd, p.start_date));
                const right = Math.min(1, positionIn(from, windowEnd, addDay(p.end_date)));
                const visible = right > 0 && left < 1 && right > left;
                const clippedStart = positionIn(from, windowEnd, p.start_date) < 0;
                const clippedEnd = positionIn(from, windowEnd, addDay(p.end_date)) > 1;
                return (
                  <li key={p.id} className="flex border-b border-divider last:border-b-0 hover:bg-surface-2/60">
                    <div className="sticky left-0 z-[1] w-[300px] shrink-0 border-r border-border bg-surface px-4 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(p)}
                          className="group min-w-0 text-left"
                          title={t("proj_edit")}
                        >
                          <span className="block truncate text-sm font-medium text-text group-hover:underline">{p.name}</span>
                          <span className="block truncate text-xs text-text-3">
                            {p.owner || t("proj_no_owner")} · {moduleLabel(p.module, language)}
                          </span>
                        </button>
                        <div className="flex shrink-0 items-center">
                          <button
                            type="button"
                            onClick={() => onViewCards(p)}
                            className="rounded-md p-1 text-text-3 hover:bg-surface-3 hover:text-text"
                            aria-label={`${t("proj_view_cards")}: ${p.name}`}
                            title={t("proj_view_cards")}
                          >
                            <SquareKanban className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(p)}
                            className="rounded-md p-1 text-text-3 hover:bg-surface-3 hover:text-text"
                            aria-label={`${t("proj_edit")}: ${p.name}`}
                            title={t("proj_edit")}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        <span className="inline-flex h-5 items-center gap-1.5 rounded-xs border border-border bg-surface-2 px-1.5 font-medium text-text-2">
                          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
                          {meta.label[language]}
                        </span>
                        <span className="num text-text-3">
                          {t("proj_cards_done").replace("{done}", String(progress.done)).replace("{total}", String(progress.total))} · {pct(progress.ratio)}
                        </span>
                      </div>
                    </div>

                    <div className="relative flex-1">
                      {/* month grid */}
                      <div className="pointer-events-none absolute inset-0 flex">
                        {monthCols.map((m) => (
                          <div key={m} className="flex-1 border-l border-divider first:border-l-0" />
                        ))}
                      </div>
                      {/* today */}
                      {todayPos >= 0 && todayPos <= 1 && (
                        <div aria-hidden className="absolute inset-y-0 w-px bg-highlight" style={{ left: pct(todayPos) }} />
                      )}
                      {visible ? (
                        <div
                          className={cn("absolute top-1/2 h-5 -translate-y-1/2 overflow-hidden", tone.track, clippedStart ? "rounded-l-none" : "rounded-l-md", clippedEnd ? "rounded-r-none" : "rounded-r-md")}
                          style={{ left: pct(left), width: pct(right - left) }}
                          title={`${p.name}: ${fmtDate(p.start_date)} - ${fmtDate(p.end_date)} · ${pct(progress.ratio)}`}
                          role="img"
                          aria-label={`${p.name}, ${fmtDate(p.start_date)} - ${fmtDate(p.end_date)}, ${pct(progress.ratio)} ${t("proj_complete")}, ${meta.label[language]}`}
                        >
                          <div className={cn("h-full", tone.fill)} style={{ width: pct(progress.ratio) }} />
                        </div>
                      ) : (
                        <span className="absolute inset-y-0 left-3 flex items-center text-xs text-text-4">
                          {positionIn(from, windowEnd, p.start_date) >= 1 ? t("proj_later") : t("proj_earlier")} · {fmtDate(p.start_date)} - {fmtDate(p.end_date)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      <p className="text-xs text-text-3">{t("proj_footnote")}</p>
    </div>
  );
}

function addDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}
