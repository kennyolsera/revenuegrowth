import type { Language } from "@/lib/i18n";
import type { KanbanProject, KanbanProjectStatus, KanbanTask } from "@/lib/types";
import { todayISO } from "@/lib/kanban";

/**
 * Kanban projects (ADR-005): progress and health are derived from the project's
 * cards, never stored, so they can't drift from the board.
 */

export const PROJECT_STATUSES: { value: KanbanProjectStatus; label: { id: string; en: string } }[] = [
  { value: "planning", label: { id: "Perencanaan", en: "Planning" } },
  { value: "active", label: { id: "Berjalan", en: "Active" } },
  { value: "on_hold", label: { id: "Ditunda", en: "On hold" } },
  { value: "done", label: { id: "Selesai", en: "Done" } },
  { value: "cancelled", label: { id: "Dibatalkan", en: "Cancelled" } },
];

export function projectStatusLabel(status: KanbanProjectStatus, language: Language) {
  return PROJECT_STATUSES.find((s) => s.value === status)?.label[language] ?? status;
}

/** The slice of a card the timeline needs (fetched for all time, not the 90-day board window). */
export type ProjectCard = Pick<KanbanTask, "project_id" | "stage" | "due_date" | "is_blocked">;

export interface ProjectProgress {
  total: number;
  done: number;
  blocked: number;
  overdue: number;
  /** 0–1; 0 when the project has no cards. */
  ratio: number;
}

export function projectProgress(projectId: string, cards: ProjectCard[], today = todayISO()): ProjectProgress {
  let total = 0, done = 0, blocked = 0, overdue = 0;
  for (const c of cards) {
    if (c.project_id !== projectId) continue;
    total++;
    if (c.stage === "done") done++;
    else {
      if (c.is_blocked) blocked++;
      if (c.due_date && c.due_date < today) overdue++;
    }
  }
  return { total, done, blocked, overdue, ratio: total ? done / total : 0 };
}

export type ProjectHealth = "done" | "cancelled" | "on_hold" | "not_started" | "no_cards" | "overdue" | "at_risk" | "on_track";

export const HEALTH_META: Record<ProjectHealth, { label: { id: string; en: string }; tone: "neutral" | "green" | "amber" | "red" }> = {
  done: { label: { id: "Selesai", en: "Done" }, tone: "neutral" },
  cancelled: { label: { id: "Dibatalkan", en: "Cancelled" }, tone: "neutral" },
  on_hold: { label: { id: "Ditunda", en: "On hold" }, tone: "amber" },
  not_started: { label: { id: "Belum mulai", en: "Not started" }, tone: "neutral" },
  no_cards: { label: { id: "Belum ada kartu", en: "No cards yet" }, tone: "neutral" },
  overdue: { label: { id: "Lewat tenggat", en: "Overdue" }, tone: "red" },
  at_risk: { label: { id: "Berisiko", en: "At risk" }, tone: "amber" },
  on_track: { label: { id: "Sesuai jadwal", en: "On track" }, tone: "green" },
};

/** Days between two ISO dates (b − a), date-only, timezone-safe. */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** Share of the project's calendar already passed, 0–1 (end date counts as a full day). */
export function expectedRatio(p: Pick<KanbanProject, "start_date" | "end_date">, today = todayISO()): number {
  const span = daysBetween(p.start_date, p.end_date) + 1;
  const passed = daysBetween(p.start_date, today) + 1;
  return Math.min(1, Math.max(0, passed / span));
}

/** How far progress may trail the calendar before a project counts as at risk. */
export const AT_RISK_GAP = 0.15;

export function projectHealth(p: KanbanProject, prog: ProjectProgress, today = todayISO()): ProjectHealth {
  if (p.status === "done") return "done";
  if (p.status === "cancelled") return "cancelled";
  if (p.status === "on_hold") return "on_hold";
  if (today < p.start_date) return "not_started";
  if (today > p.end_date && prog.ratio < 1) return "overdue";
  if (prog.total === 0) return "no_cards";
  if (prog.ratio + AT_RISK_GAP < expectedRatio(p, today) || prog.blocked > 0 || prog.overdue > 0) return "at_risk";
  return "on_track";
}

/* ───────────── Timeline window helpers (date-only, ISO strings) ───────────── */

export function addMonths(iso: string, months: number): string {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + months, 1));
  return d.toISOString().slice(0, 10);
}

export function monthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

/** First days of each month in [from, from + count). */
export function monthsFrom(from: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addMonths(monthStart(from), i));
}

/** Position of a date inside the window as 0–1 (may fall outside). */
export function positionIn(windowStart: string, windowEnd: string, iso: string): number {
  return daysBetween(windowStart, iso) / Math.max(1, daysBetween(windowStart, windowEnd));
}
