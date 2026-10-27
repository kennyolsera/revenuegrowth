"use client";

import { useEffect, useMemo, useState } from "react";
import { WarningOctagon as AlertOctagon, CalendarCheck as CalendarClock, CheckCircle as CheckCircle2, DownloadSimple as Download, FolderPlus, Gauge, ChartBarHorizontal as GanttChart, GridFour as LayoutGrid, Stack as Layers, Plus, ArrowsClockwise as RefreshCw, MagnifyingGlass as Search, Timer } from "@phosphor-icons/react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { SupabaseNotice, ErrorNotice } from "@/components/shared/SupabaseNotice";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { TaskDialog } from "@/components/kanban/TaskDialog";
import { ImportSourcesDialog } from "@/components/kanban/ImportSourcesDialog";
import { ProjectDialog } from "@/components/kanban/ProjectDialog";
import { ProjectTimeline } from "@/components/kanban/ProjectTimeline";
import type { ProjectCard } from "@/lib/kanban-projects";
import {
  MODULE_OPTIONS,
  PRIORITY_OPTIONS,
  STAGES,
  cycleDays,
  isOverdue,
  positionAt,
  syncSourceOnDone,
  syncSourceOnStart,
  validateMove,
} from "@/lib/kanban";
import type { KanbanProject, KanbanStage, KanbanTask } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

const DONE_WINDOW_DAYS = 14;

/** True when the error means the kanban_projects migration hasn't run yet. */
function isMissingProjectsTable(err: { code?: string; message?: string } | null) {
  if (!err) return false;
  return err.code === "42P01" || err.code === "PGRST205" || /kanban_projects|project_id/.test(err.message ?? "");
}

export default function KanbanPage() {
  const { t, language } = useLanguage();
  const toast = useToast();
  const id = language === "id";

  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showAllDone, setShowAllDone] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KanbanTask | null>(null);
  const [createStage, setCreateStage] = useState<KanbanStage>("backlog");
  const [importOpen, setImportOpen] = useState(false);

  const [view, setView] = useState<"board" | "timeline">("timeline");
  const [projects, setProjects] = useState<KanbanProject[]>([]);
  const [projectCards, setProjectCards] = useState<ProjectCard[]>([]);
  /** null = still checking; false = migration not run yet (board works as before). */
  const [projectsReady, setProjectsReady] = useState<boolean | null>(null);
  const [projectFilter, setProjectFilter] = useState("");
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<KanbanProject | null>(null);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ stage: KanbanStage; index: number } | null>(null);

  async function fetchTasks() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      // Done cards older than 90 days are archived out of the board query.
      const since = new Date(Date.now() - 90 * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("kanban_tasks")
        .select("*")
        .or(`stage.neq.done,completed_at.gte.${since}`)
        .order("position", { ascending: true });
      if (error) throw error;
      setTasks((data ?? []) as KanbanTask[]);
    } catch (err: any) {
      setError(err?.message ?? "Error loading board");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjects() {
    const supabase = createClient();
    const { data, error } = await supabase.from("kanban_projects").select("*").order("start_date", { ascending: true });
    if (error) {
      setProjectsReady(isMissingProjectsTable(error) ? false : true);
      if (!isMissingProjectsTable(error)) toast.error(`${t("save_error")}: ${error.message}`);
      return;
    }
    setProjects((data ?? []) as KanbanProject[]);
    setProjectsReady(true);
    // All-time slice for progress (the board query hides Done cards older than 90 days).
    const { data: cardRows } = await supabase
      .from("kanban_tasks")
      .select("project_id, stage, due_date, is_blocked")
      .not("project_id", "is", null);
    setProjectCards((cardRows ?? []) as ProjectCard[]);
  }

  function refreshAll() {
    fetchTasks();
    fetchProjects();
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const assignees = useMemo(
    () => Array.from(new Set(tasks.map((x) => x.assignee).filter(Boolean) as string[])).sort(),
    [tasks]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const doneCutoff = Date.now() - DONE_WINDOW_DAYS * 86_400_000;
    return tasks.filter((x) => {
      if (q && ![x.title, x.description, x.merchant_partner, x.assignee].some((v) => v?.toLowerCase().includes(q)))
        return false;
      if (assigneeFilter && x.assignee !== assigneeFilter) return false;
      if (moduleFilter && x.module !== moduleFilter) return false;
      if (priorityFilter && x.priority !== priorityFilter) return false;
      if (projectFilter === "none" && x.project_id) return false;
      if (projectFilter && projectFilter !== "none" && x.project_id !== projectFilter) return false;
      if (!showAllDone && x.stage === "done" && x.completed_at && new Date(x.completed_at).getTime() < doneCutoff)
        return false;
      return true;
    });
  }, [tasks, search, assigneeFilter, moduleFilter, priorityFilter, projectFilter, showAllDone]);

  const columns = useMemo(() => {
    const byStage = {} as Record<KanbanStage, KanbanTask[]>;
    for (const s of STAGES) byStage[s.id] = [];
    for (const x of filtered) byStage[x.stage]?.push(x);
    for (const s of STAGES) {
      byStage[s.id].sort((a, b) =>
        s.id === "done"
          ? (b.completed_at ?? "").localeCompare(a.completed_at ?? "")
          : a.position - b.position
      );
    }
    return byStage;
  }, [filtered]);

  // Flow metrics are computed on the whole board, not the filtered view.
  const metrics = useMemo(() => {
    const open = tasks.filter((x) => x.stage !== "done");
    const weekAgo = Date.now() - 7 * 86_400_000;
    const monthAgo = Date.now() - 30 * 86_400_000;
    const doneWeek = tasks.filter((x) => x.stage === "done" && x.completed_at && new Date(x.completed_at).getTime() >= weekAgo);
    const cycles = tasks
      .filter((x) => x.stage === "done" && x.completed_at && new Date(x.completed_at).getTime() >= monthAgo)
      .map(cycleDays)
      .filter((d): d is number => d !== null);
    return {
      open: open.length,
      wip: open.filter((x) => x.stage === "in_progress" || x.stage === "review").length,
      overdue: open.filter(isOverdue).length,
      blocked: open.filter((x) => x.is_blocked).length,
      doneWeek: doneWeek.length,
      avgCycle: cycles.length ? cycles.reduce((a, b) => a + b, 0) / cycles.length : null,
    };
  }, [tasks]);

  function stageCount(stage: KanbanStage) {
    return tasks.filter((x) => x.stage === stage).length;
  }

  function topPosition(stage: KanbanStage) {
    const list = tasks.filter((x) => x.stage === stage);
    return list.length ? Math.min(...list.map((x) => x.position)) - 1000 : 1000;
  }

  function openCreate(stage: KanbanStage) {
    setEditing(null);
    setCreateStage(stage);
    setDialogOpen(true);
  }

  function openEdit(task: KanbanTask) {
    setEditing(task);
    setDialogOpen(true);
  }

  async function moveTask(taskId: string, to: KanbanStage, index: number) {
    const task = tasks.find((x) => x.id === taskId);
    if (!task) return;

    const siblings = columns[to].filter((x) => x.id !== taskId);
    const position = positionAt(siblings, Math.min(index, siblings.length));
    const stageChanged = task.stage !== to;

    if (stageChanged) {
      const blocked = validateMove(task, to, language);
      if (blocked) {
        toast.error(blocked);
        return;
      }
      const limit = STAGES.find((s) => s.id === to)?.wip;
      if (limit && stageCount(to) >= limit) {
        toast.info(
          id
            ? `WIP limit kolom terlampaui (${stageCount(to) + 1}/${limit}). Selesaikan pekerjaan berjalan dulu.`
            : `Column WIP limit exceeded (${stageCount(to) + 1}/${limit}). Finish in-flight work first.`
        );
      }
    } else if (position === task.position) {
      return;
    }

    // Optimistic update; the DB trigger records history + cycle timestamps.
    const previous = tasks;
    setTasks((prev) => prev.map((x) => (x.id === taskId ? { ...x, stage: to, position } : x)));

    const supabase = createClient();
    const { data, error } = await supabase
      .from("kanban_tasks")
      .update({ stage: to, position })
      .eq("id", taskId)
      .select()
      .single();
    if (error) {
      setTasks(previous);
      toast.error(`${t("save_error")}: ${error.message}`);
      return;
    }
    const saved = data as KanbanTask;
    setTasks((prev) => prev.map((x) => (x.id === taskId ? saved : x)));

    if (stageChanged) {
      if (to === "in_progress") await syncSourceOnStart(supabase, saved).catch(() => {});
      if (to === "done") await syncSourceOnDone(supabase, saved).catch(() => {});
      toast.success(t("toast_status_updated"));
    }
  }

  function handleCardDragOver(e: React.DragEvent, stage: KanbanStage, index: number) {
    if (!dragId) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    const next = { stage, index: after ? index + 1 : index };
    if (dropTarget?.stage !== next.stage || dropTarget?.index !== next.index) setDropTarget(next);
  }

  function handleColumnDragOver(e: React.DragEvent, stage: KanbanStage) {
    if (!dragId) return;
    e.preventDefault();
    if (dropTarget?.stage !== stage) setDropTarget({ stage, index: columns[stage].length });
  }

  function handleDrop(e: React.DragEvent, stage: KanbanStage) {
    e.preventDefault();
    const taskId = dragId;
    const target = dropTarget?.stage === stage ? dropTarget.index : columns[stage].length;
    setDragId(null);
    setDropTarget(null);
    if (!taskId) return;
    // Indices were computed with the dragged card still in its column.
    const visible = columns[stage];
    const from = visible.findIndex((x) => x.id === taskId);
    moveTask(taskId, stage, from !== -1 && from < target ? target - 1 : target);
  }

  const kpis = [
    { icon: Layers, label: id ? "Kartu Aktif" : "Open Cards", value: metrics.open, tone: "text-ink" },
    { icon: Gauge, label: id ? "WIP (Dikerjakan + Review)" : "WIP (In Progress + Review)", value: metrics.wip, tone: "text-accent" },
    { icon: CalendarClock, label: id ? "Lewat Tenggat" : "Overdue", value: metrics.overdue, tone: metrics.overdue ? "text-rose-600" : "text-ink" },
    { icon: AlertOctagon, label: "Blocked", value: metrics.blocked, tone: metrics.blocked ? "text-rose-600" : "text-ink" },
    { icon: CheckCircle2, label: id ? "Selesai 7 Hari" : "Done (7 days)", value: metrics.doneWeek, tone: "text-emerald-600" },
    {
      icon: Timer,
      label: id ? "Rata-rata Cycle Time (30h)" : "Avg Cycle Time (30d)",
      value: metrics.avgCycle === null ? "-" : `${metrics.avgCycle.toFixed(1)} ${id ? "hr" : "d"}`,
      tone: "text-ink",
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("kanban_title")}
        description={t("kanban_desc")}
        action={
          <>
            <Button size="sm" variant="secondary" onClick={refreshAll} aria-label="Refresh">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            {view === "board" ? (
              <>
                <Button size="sm" variant="secondary" onClick={() => setImportOpen(true)}>
                  <Download className="h-4 w-4" /> {id ? "Tarik dari MOM / Request" : "Pull from MOM / Requests"}
                </Button>
                <Button size="sm" variant="accent" onClick={() => openCreate("backlog")}>
                  <Plus className="h-4 w-4" /> {t("kanban_add")}
                </Button>
              </>
            ) : (
              projectsReady && (
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => {
                    setEditingProject(null);
                    setProjectDialogOpen(true);
                  }}
                >
                  <FolderPlus className="h-4 w-4" /> {t("proj_new")}
                </Button>
              )
            )}
          </>
        }
      />

      {!isSupabaseConfigured && <SupabaseNotice />}
      {isSupabaseConfigured && error && <ErrorNotice message={error} />}

      <div role="tablist" aria-label="View" className="inline-flex rounded-md bg-surface-3 p-0.5">
        {([
          { key: "timeline", label: t("kanban_view_timeline"), icon: GanttChart },
          { key: "board", label: t("kanban_view_board"), icon: LayoutGrid },
        ] as const).map((v) => (
          <button
            key={v.key}
            role="tab"
            aria-selected={view === v.key}
            onClick={() => setView(v.key)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-xs px-3 text-[12.5px] font-medium transition-colors",
              view === v.key ? "bg-surface text-text shadow-sm" : "text-text-3 hover:text-text"
            )}
          >
            <v.icon className="h-3.5 w-3.5" />
            {v.label}
          </button>
        ))}
      </div>

      {view === "timeline" &&
        (projectsReady === false ? (
          <div className="rounded-lg border border-border bg-surface p-5">
            <h3 className="text-base font-semibold text-text">{t("proj_setup_title")}</h3>
            <p className="mt-1 max-w-2xl text-sm text-text-3">{t("proj_setup_desc")}</p>
          </div>
        ) : projectsReady === null ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-12" />
            ))}
          </div>
        ) : (
          <ProjectTimeline
            projects={projects}
            cards={projectCards}
            onNew={() => {
              setEditingProject(null);
              setProjectDialogOpen(true);
            }}
            onEdit={(p) => {
              setEditingProject(p);
              setProjectDialogOpen(true);
            }}
            onViewCards={(p) => {
              setProjectFilter(p.id);
              setView("board");
            }}
          />
        ))}

      {view === "board" && (
      <>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-surface-border bg-white px-4 py-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              <k.icon className="h-3.5 w-3.5" />
              <span className="truncate">{k.label}</span>
            </div>
            <p className={cn("mt-1 text-2xl font-bold tracking-tight", k.tone)}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 rounded-lg border border-surface-border bg-white p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            placeholder={id ? "Cari judul, merchant, PIC..." : "Search title, merchant, PIC..."}
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:flex">
          <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="lg:w-40">
            <option value="">{id ? "Semua PIC" : "All PICs"}</option>
            {assignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
          {projectsReady && (
            <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="lg:w-48" aria-label={t("proj_field")}>
              <option value="">{t("proj_filter_all")}</option>
              <option value="none">{t("proj_filter_none")}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}
          <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="lg:w-44">
            <option value="">{id ? "Semua Modul" : "All Modules"}</option>
            {MODULE_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label[language]}
              </option>
            ))}
          </Select>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="lg:w-36">
            <option value="">{id ? "Semua Prioritas" : "All Priorities"}</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-xs font-semibold text-ink-body">
          <input
            type="checkbox"
            checked={showAllDone}
            onChange={(e) => setShowAllDone(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          {id ? `Tampilkan Selesai > ${DONE_WINDOW_DAYS} hari` : `Show Done > ${DONE_WINDOW_DAYS} days`}
        </label>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 scrollbar-thin sm:mx-0 sm:px-0">
        <div className="grid min-w-[1100px] grid-cols-5 gap-3">
          {STAGES.map((stage) => {
            const cards = columns[stage.id];
            const count = stageCount(stage.id);
            const overLimit = stage.wip !== null && count > stage.wip;
            const isTarget = dropTarget?.stage === stage.id;
            return (
              <section
                key={stage.id}
                onDragOver={(e) => handleColumnDragOver(e, stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={cn(
                  "flex min-h-[420px] flex-col rounded-lg border bg-surface-muted/70 transition-colors",
                  isTarget ? "border-accent-line bg-accent-light" : "border-surface-border",
                  overLimit && "border-amber-300"
                )}
              >
                <header className="px-3 pb-2 pt-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", stage.dot)} />
                    <h3 className="text-sm font-bold text-ink">{stage.label[language]}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-bold",
                        overLimit ? "bg-amber-100 text-amber-800" : "bg-white text-ink-muted"
                      )}
                      title={stage.wip ? `WIP limit ${stage.wip}` : undefined}
                    >
                      {stage.wip ? `${count}/${stage.wip}` : count}
                    </span>
                    <button
                      onClick={() => openCreate(stage.id)}
                      className="ml-auto rounded-md p-1 text-ink-faint transition-colors hover:bg-white hover:text-accent"
                      aria-label={t("kanban_add")}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{stage.hint[language]}</p>
                </header>

                <div className="flex-1 space-y-2 px-2 pb-3">
                  {cards.map((task, idx) => (
                    <div key={task.id} onDragOver={(e) => handleCardDragOver(e, stage.id, idx)}>
                      {isTarget && dropTarget?.index === idx && <DropLine />}
                      <KanbanCard
                        task={task}
                        projectName={task.project_id ? projectById.get(task.project_id)?.name : undefined}
                        dragging={dragId === task.id}
                        onOpen={() => openEdit(task)}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", task.id);
                          setDragId(task.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setDropTarget(null);
                        }}
                      />
                    </div>
                  ))}
                  {isTarget && dropTarget?.index === cards.length && <DropLine />}
                  {!loading && cards.length === 0 && !isTarget && (
                    <p className="rounded-lg border border-dashed border-surface-border px-3 py-6 text-center text-xs text-ink-faint">
                      {id ? "Tarik kartu ke sini" : "Drop cards here"}
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      </>
      )}

      <TaskDialog
        open={dialogOpen}
        task={editing}
        defaultStage={createStage}
        nextPosition={topPosition}
        projects={projectsReady ? projects : null}
        defaultProjectId={projectFilter && projectFilter !== "none" ? projectFilter : ""}
        onClose={() => setDialogOpen(false)}
        onSaved={refreshAll}
      />
      <ProjectDialog
        open={projectDialogOpen}
        project={editingProject}
        assignees={assignees}
        onClose={() => setProjectDialogOpen(false)}
        onSaved={refreshAll}
      />
      <ImportSourcesDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={refreshAll}
        topPosition={topPosition}
      />
    </div>
  );
}

function DropLine() {
  return <div className="my-1 h-1 rounded-full bg-accent" />;
}
