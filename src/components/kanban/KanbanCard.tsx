"use client";

import { WarningOctagon as AlertOctagon, CalendarCheck as CalendarClock, Kanban as FolderKanban, ListChecks, NotePencil as NotebookPen, Tray as Inbox } from "@/components/icons";
import { StatusBadge } from "@/components/ui/Badge";
import { checklistProgress, isOverdue, moduleLabel } from "@/lib/kanban";
import { useLanguage } from "@/lib/LanguageContext";
import type { KanbanTask } from "@/lib/types";
import { cn, formatDate, initials } from "@/lib/utils";

export function KanbanCard({
  task,
  projectName,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  task: KanbanTask;
  /** Name of the card's project, when it has one. */
  projectName?: string;
  dragging: boolean;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const { language } = useLanguage();
  const overdue = isOverdue(task);
  const progress = checklistProgress(task);

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "group cursor-grab rounded-lg border bg-white p-3 transition-all active:cursor-grabbing",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        task.is_blocked ? "border-rose-200 bg-rose-50/40" : "border-surface-border",
        dragging && "opacity-40"
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={task.priority} />
        <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
          {moduleLabel(task.module, language)}
        </span>
        {task.source_type === "mom" && (
          <NotebookPen className="h-3.5 w-3.5 text-ink-faint" aria-label="MOM" />
        )}
        {task.source_type === "request" && <Inbox className="h-3.5 w-3.5 text-ink-faint" aria-label="Request" />}
      </div>

      <p className="text-sm font-semibold leading-snug text-ink line-clamp-3">{task.title}</p>
      {projectName && (
        <p className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-ink-muted" title={projectName}>
          <FolderKanban className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{projectName}</span>
        </p>
      )}
      {task.merchant_partner && <p className="mt-0.5 truncate text-xs text-ink-muted">{task.merchant_partner}</p>}

      {task.is_blocked && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-rose-100/70 px-2 py-1 text-[11px] font-medium text-rose-700">
          <AlertOctagon className="mt-px h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{task.blocked_reason || "Blocked"}</span>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-muted">
        {task.due_date && (
          <span className={cn("inline-flex items-center gap-1", overdue && "font-semibold text-rose-600")}>
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDate(task.due_date)}
          </span>
        )}
        {progress.total > 0 && (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              progress.done === progress.total && "font-semibold text-emerald-600"
            )}
          >
            <ListChecks className="h-3.5 w-3.5" />
            {progress.done}/{progress.total}
          </span>
        )}
        <span className="ml-auto">
          {task.assignee ? (
            <span
              title={task.assignee}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-[10px] font-bold text-accent"
            >
              {initials(task.assignee)}
            </span>
          ) : (
            <span className="text-[10px] italic text-ink-faint">{language === "id" ? "Tanpa PIC" : "No PIC"}</span>
          )}
        </span>
      </div>
    </div>
  );
}
