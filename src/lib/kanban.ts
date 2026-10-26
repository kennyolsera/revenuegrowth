import type { SupabaseClient } from "@supabase/supabase-js";
import type { KanbanModule, KanbanStage, KanbanTask } from "@/lib/types";
import type { Language } from "@/lib/i18n";

/**
 * Kanban flow definition — single source of truth for the board.
 * See docs/KANBAN_FLOW.md for the end-to-end process these rules encode.
 */
export interface StageDef {
  id: KanbanStage;
  label: { id: string; en: string };
  hint: { id: string; en: string };
  /** Work-in-progress limit; null = unlimited. Exceeding it is allowed but flagged. */
  wip: number | null;
  dot: string;
}

export const STAGES: StageDef[] = [
  {
    id: "backlog",
    label: { id: "Backlog", en: "Backlog" },
    hint: { id: "Ide & permintaan masuk, belum diprioritaskan", en: "Incoming ideas & requests, not yet prioritised" },
    wip: null,
    dot: "bg-slate-400",
  },
  {
    id: "todo",
    label: { id: "To Do", en: "To Do" },
    hint: { id: "Sudah diprioritaskan & punya PIC", en: "Prioritised and owned by a PIC" },
    wip: 15,
    dot: "bg-sky-500",
  },
  {
    id: "in_progress",
    label: { id: "Dikerjakan", en: "In Progress" },
    hint: { id: "Sedang dikerjakan aktif", en: "Actively being worked on" },
    wip: 8,
    dot: "bg-blue-600",
  },
  {
    id: "review",
    label: { id: "Review", en: "Review" },
    hint: { id: "Menunggu pengecekan Head / requester", en: "Awaiting Head / requester check" },
    wip: 5,
    dot: "bg-amber-500",
  },
  {
    id: "done",
    label: { id: "Selesai", en: "Done" },
    hint: { id: "Disetujui & ditutup", en: "Approved and closed" },
    wip: null,
    dot: "bg-emerald-500",
  },
];

export const STAGE_ORDER: KanbanStage[] = STAGES.map((s) => s.id);

export function stageLabel(stage: KanbanStage | null | undefined, language: Language) {
  return STAGES.find((s) => s.id === stage)?.label[language] ?? stage ?? "-";
}

export const MODULE_OPTIONS: { value: KanbanModule; label: { id: string; en: string } }[] = [
  { value: "qris", label: { id: "QRIS", en: "QRIS" } },
  { value: "online_order", label: { id: "Online Order", en: "Online Order" } },
  { value: "financing", label: { id: "Financing", en: "Financing" } },
  { value: "network_partner", label: { id: "Network Partner", en: "Network Partner" } },
  { value: "commission", label: { id: "Klaim Komisi", en: "Commission Claim" } },
  { value: "request", label: { id: "Request Form", en: "Request Form" } },
  { value: "internal", label: { id: "Internal", en: "Internal" } },
];

export function moduleLabel(value: string, language: Language) {
  return MODULE_OPTIONS.find((m) => m.value === value)?.label[language] ?? value;
}

export const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const PRIORITY_RANK: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export function comparePriority(a: string, b: string) {
  return (PRIORITY_RANK[a] ?? 9) - (PRIORITY_RANK[b] ?? 9);
}

export function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isOverdue(task: Pick<KanbanTask, "due_date" | "stage">) {
  return !!task.due_date && task.stage !== "done" && task.due_date < todayISO();
}

export function checklistProgress(task: Pick<KanbanTask, "checklist">) {
  const items = task.checklist ?? [];
  return { done: items.filter((c) => c.done).length, total: items.length };
}

/** Days between start of work and completion (cycle time). */
export function cycleDays(task: Pick<KanbanTask, "started_at" | "completed_at">) {
  if (!task.started_at || !task.completed_at) return null;
  const ms = new Date(task.completed_at).getTime() - new Date(task.started_at).getTime();
  return Math.max(0, ms / 86_400_000);
}

/**
 * Transition rules (the "definition of ready / done" gates).
 * Returns an error message when the move is not allowed, otherwise null.
 */
export function validateMove(task: KanbanTask, to: KanbanStage, language: Language): string | null {
  const id = language === "id";
  if (to !== "backlog" && to !== "done" && !task.assignee?.trim()) {
    return id
      ? "Tentukan PIC terlebih dahulu sebelum kartu keluar dari Backlog."
      : "Assign a PIC before moving the card out of Backlog.";
  }
  if ((to === "review" || to === "done") && task.is_blocked) {
    return id ? "Kartu masih Blocked. Lepas blocker dulu." : "Card is still blocked. Clear the blocker first.";
  }
  if (to === "done") {
    const { done, total } = checklistProgress(task);
    if (total > 0 && done < total) {
      return id
        ? `Checklist belum lengkap (${done}/${total}). Selesaikan sebelum ditutup.`
        : `Checklist incomplete (${done}/${total}). Finish it before closing.`;
    }
  }
  return null;
}

/** Position for a card dropped at `index` among `siblings` (already sorted, excluding the card). */
export function positionAt(siblings: Pick<KanbanTask, "position">[], index: number) {
  const before = siblings[index - 1]?.position;
  const after = siblings[index]?.position;
  if (before === undefined && after === undefined) return 1000;
  if (before === undefined) return after! - 1000;
  if (after === undefined) return before + 1000;
  return (before + after) / 2;
}

/**
 * Close the loop with the module the card came from: a MOM action item gets
 * ticked, a Request Form ticket is marked "selesai". Best-effort — the board
 * move itself has already succeeded.
 */
export async function syncSourceOnDone(supabase: SupabaseClient, task: KanbanTask) {
  if (!task.source_id) return;
  if (task.source_type === "request") {
    await supabase.from("requests").update({ status: "selesai" }).eq("id", task.source_id);
    return;
  }
  if (task.source_type === "mom" && task.source_ref !== null) {
    const { data } = await supabase
      .from("meeting_minutes")
      .select("action_items")
      .eq("id", task.source_id)
      .single();
    const items = (data?.action_items ?? []) as { done: boolean }[];
    if (!items[task.source_ref]) return;
    const next = items.map((a, i) => (i === task.source_ref ? { ...a, done: true } : a));
    await supabase.from("meeting_minutes").update({ action_items: next }).eq("id", task.source_id);
  }
}

/** Starting a request-sourced card moves the ticket to "diproses". */
export async function syncSourceOnStart(supabase: SupabaseClient, task: KanbanTask) {
  if (task.source_type === "request" && task.source_id) {
    await supabase
      .from("requests")
      .update({ status: "diproses", assigned_pic: task.assignee })
      .eq("id", task.source_id)
      .in("status", ["baru", "ditugaskan"]);
  }
}
