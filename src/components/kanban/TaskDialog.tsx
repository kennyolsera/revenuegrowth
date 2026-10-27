"use client";

import { useEffect, useState } from "react";
import { WarningOctagon as AlertOctagon, ArrowRight, ChatCenteredText as MessageSquare, Plus, Trash as Trash2 } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/Input";
import {
  MODULE_OPTIONS,
  PRIORITY_OPTIONS,
  STAGES,
  cycleDays,
  stageLabel,
  syncSourceOnDone,
  syncSourceOnStart,
  validateMove,
  todayISO,
} from "@/lib/kanban";
import { addMonths } from "@/lib/kanban-projects";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";
import type { KanbanActivity, KanbanProject, KanbanStage, KanbanTask } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type ChecklistItem = { label: string; done: boolean };

/** Select value for "+ New project…": the project is created on save. */
const NEW_PROJECT = "__new__";

function emptyNewProject() {
  const start = todayISO();
  return { name: "", start_date: start, end_date: addMonths(start, 1) };
}

const emptyForm = {
  title: "",
  description: "",
  stage: "backlog" as KanbanStage,
  priority: "medium",
  module: "internal",
  assignee: "",
  merchant_partner: "",
  due_date: "",
  is_blocked: false,
  blocked_reason: "",
  project_id: "",
};

export function TaskDialog({
  open,
  task,
  defaultStage,
  nextPosition,
  projects = null,
  defaultProjectId = "",
  onClose,
  onSaved,
}: {
  open: boolean;
  /** null = create mode */
  task: KanbanTask | null;
  defaultStage: KanbanStage;
  nextPosition: (stage: KanbanStage) => number;
  /** null until the kanban_projects migration has run: the field is hidden and project_id is never written. */
  projects?: KanbanProject[] | null;
  /** Pre-selected project for new cards (e.g. when the board is filtered to one project). */
  defaultProjectId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const id = language === "id";

  const [tab, setTab] = useState<"details" | "activity">("details");
  const [form, setForm] = useState(emptyForm);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [activities, setActivities] = useState<KanbanActivity[]>([]);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [newProject, setNewProject] = useState(emptyNewProject);
  const creatingProject = form.project_id === NEW_PROJECT;

  useEffect(() => {
    if (!open) return;
    setTab("details");
    setNewItem("");
    setComment("");
    setNewProject(emptyNewProject());
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? "",
        stage: task.stage,
        priority: task.priority,
        module: task.module,
        assignee: task.assignee ?? "",
        merchant_partner: task.merchant_partner ?? "",
        due_date: task.due_date ?? "",
        is_blocked: task.is_blocked,
        blocked_reason: task.blocked_reason ?? "",
        project_id: task.project_id ?? "",
      });
      setChecklist(task.checklist ?? []);
      fetchActivities(task.id);
    } else {
      setForm({ ...emptyForm, stage: defaultStage, project_id: defaultProjectId });
      setChecklist([]);
      setActivities([]);
    }
  }, [open, task, defaultStage, defaultProjectId]);

  async function fetchActivities(taskId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("kanban_task_activities")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });
    setActivities((data ?? []) as KanbanActivity[]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const items = checklist.filter((c) => c.label.trim() !== "");
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      stage: form.stage,
      priority: form.priority,
      module: form.module,
      assignee: form.assignee.trim() || null,
      merchant_partner: form.merchant_partner || null,
      due_date: form.due_date || null,
      checklist: items,
      is_blocked: form.is_blocked,
      blocked_reason: form.is_blocked ? form.blocked_reason || null : null,
      ...(projects ? { project_id: (creatingProject ? null : form.project_id) || null } : {}),
    };

    const newName = newProject.name.trim();
    if (creatingProject) {
      if (!newName) return toast.error(t("proj_err_name"));
      if (!newProject.start_date || !newProject.end_date) return toast.error(t("proj_err_dates"));
      if (newProject.end_date < newProject.start_date) return toast.error(t("proj_err_end_before_start"));
    }

    // Same gates as drag & drop, evaluated against the edited values.
    const stageChanged = !task || task.stage !== form.stage;
    if (stageChanged) {
      const draft = { ...(task ?? ({} as KanbanTask)), ...payload } as KanbanTask;
      const blocked = validateMove(draft, form.stage, language);
      if (blocked) {
        toast.error(blocked);
        return;
      }
    }

    setSaving(true);
    try {
      const supabase = createClient();
      if (creatingProject && projects) {
        // Reuse a project with the same name instead of creating a duplicate.
        const existing = projects.find((p) => p.name.trim().toLowerCase() === newName.toLowerCase());
        if (existing) {
          payload.project_id = existing.id;
          toast.success(t("proj_existing_linked").replace("{name}", existing.name));
        } else {
          const { data: userRes } = await supabase.auth.getUser();
          const { data: proj, error: projErr } = await supabase
            .from("kanban_projects")
            .insert({
              name: newName,
              module: form.module,
              owner: form.assignee.trim() || null,
              start_date: newProject.start_date,
              end_date: newProject.end_date,
              status: "active",
              created_by: userRes.user?.email ?? null,
            })
            .select("id")
            .single();
          if (projErr) throw projErr;
          payload.project_id = proj.id;
          toast.success(t("proj_toast_created").replace("{name}", newName));
          // Later failures must not create the project twice on retry.
          setForm((f) => ({ ...f, project_id: proj.id }));
        }
      }
      let saved: KanbanTask;
      if (task) {
        const { data, error } = await supabase
          .from("kanban_tasks")
          .update({ ...payload, ...(stageChanged ? { position: nextPosition(form.stage) } : {}) })
          .eq("id", task.id)
          .select()
          .single();
        if (error) throw error;
        saved = data as KanbanTask;
      } else {
        const { data: userRes } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from("kanban_tasks")
          .insert({ ...payload, position: nextPosition(form.stage), created_by: userRes.user?.email ?? null })
          .select()
          .single();
        if (error) throw error;
        saved = data as KanbanTask;
      }
      if (stageChanged && saved.stage === "in_progress") await syncSourceOnStart(supabase, saved).catch(() => {});
      if (stageChanged && saved.stage === "done") await syncSourceOnDone(supabase, saved).catch(() => {});
      toast.success(task ? t("toast_updated") : t("toast_created"));
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(`${t("save_error")}: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task || !confirm(t("confirm_delete"))) return;
    const supabase = createClient();
    const { error } = await supabase.from("kanban_tasks").delete().eq("id", task.id);
    if (error) {
      toast.error(`${t("delete_error")}: ${error.message}`);
      return;
    }
    toast.success(t("toast_deleted"));
    onSaved();
    onClose();
  }

  async function postComment() {
    if (!task || !comment.trim()) return;
    setPosting(true);
    const supabase = createClient();
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase.from("kanban_task_activities").insert({
      task_id: task.id,
      kind: "comment",
      body: comment.trim(),
      actor: userRes.user?.email ?? "System",
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setComment("");
    fetchActivities(task.id);
  }

  function activityText(a: KanbanActivity) {
    switch (a.kind) {
      case "created":
        return id ? `membuat kartu di ${stageLabel(a.to_stage, language)}` : `created the card in ${stageLabel(a.to_stage, language)}`;
      case "moved":
        return `${stageLabel(a.from_stage, language)} → ${stageLabel(a.to_stage, language)}`;
      case "blocked":
        return id ? `menandai Blocked${a.body ? `: ${a.body}` : ""}` : `marked Blocked${a.body ? `: ${a.body}` : ""}`;
      case "unblocked":
        return id ? "melepas blocker" : "cleared the blocker";
      default:
        return a.body ?? "";
    }
  }

  const cycle = task ? cycleDays(task) : null;
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={task ? (id ? "Detail Kartu" : "Card Details") : id ? "Kartu Baru" : "New Card"}
      description={
        task
          ? `${stageLabel(task.stage, language)} · ${id ? "dibuat" : "created"} ${formatDate(task.created_at)}${
              cycle !== null ? ` · cycle time ${cycle.toFixed(1)} ${id ? "hari" : "days"}` : ""
            }`
          : undefined
      }
      width="max-w-2xl"
    >
      {task && (
        <div className="mb-4 flex gap-1 rounded-lg bg-surface-muted p-1 text-xs font-semibold">
          {(["details", "activity"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 transition-colors",
                tab === k ? "bg-white text-ink shadow-xs" : "text-ink-muted hover:text-ink"
              )}
            >
              {k === "details" ? (id ? "Detail" : "Details") : `${id ? "Aktivitas & Komentar" : "Activity & Comments"} (${activities.length})`}
            </button>
          ))}
        </div>
      )}

      {tab === "details" ? (
        <form onSubmit={handleSubmit}>
          <Field>
            <Label>{id ? "Judul Pekerjaan" : "Work Title"}</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={id ? "mis. Follow up dokumen aktivasi QRIS Merchant X" : "e.g. Follow up QRIS activation docs for Merchant X"}
            />
          </Field>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
            <Field>
              <Label>Stage</Label>
              <Select value={form.stage} onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value as KanbanStage }))}>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label[language]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label>{id ? "Prioritas" : "Priority"}</Label>
              <Select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label>{id ? "Modul / Fitur" : "Module / Feature"}</Label>
              <Select value={form.module} onChange={(e) => setForm((p) => ({ ...p, module: e.target.value }))}>
                {MODULE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label[language]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label>PIC</Label>
              <Input
                value={form.assignee}
                onChange={(e) => setForm((p) => ({ ...p, assignee: e.target.value }))}
                placeholder={id ? "Nama PIC" : "PIC name"}
              />
            </Field>
            <Field>
              <Label>{id ? "Tenggat" : "Due Date"}</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} />
            </Field>
            <Field>
              <Label>Merchant / Partner</Label>
              <Input
                value={form.merchant_partner}
                onChange={(e) => setForm((p) => ({ ...p, merchant_partner: e.target.value }))}
                placeholder={t("mom_partner_ph")}
              />
            </Field>
          </div>
          {projects && (
            <Field>
              <Label htmlFor="task-project">{t("proj_field")}</Label>
              <Select
                id="task-project"
                value={form.project_id}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((p) => ({ ...p, project_id: v }));
                  if (v === NEW_PROJECT && form.due_date) {
                    // Make the default window cover the card's due date.
                    setNewProject((np) => ({
                      ...np,
                      end_date: form.due_date > np.end_date ? form.due_date : np.end_date,
                      start_date: form.due_date < np.start_date ? form.due_date : np.start_date,
                    }));
                  }
                }}
              >
                <option value="">{t("proj_none")}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
                <option value={NEW_PROJECT}>{t("proj_new_inline")}</option>
              </Select>
              {creatingProject && (
                <div className="mt-2 space-y-3 rounded-md border border-border bg-surface-2 p-3">
                  <div>
                    <Label htmlFor="task-new-project-name">{t("proj_name")}</Label>
                    <Input
                      id="task-new-project-name"
                      autoFocus
                      maxLength={160}
                      value={newProject.name}
                      placeholder={id ? "mis. Onboarding partner Bank X" : "e.g. Bank X partner onboarding"}
                      onChange={(e) => setNewProject((np) => ({ ...np, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="task-new-project-start">{t("proj_start")}</Label>
                      <Input
                        id="task-new-project-start"
                        type="date"
                        value={newProject.start_date}
                        onChange={(e) => setNewProject((np) => ({ ...np, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-new-project-end">{t("proj_end")}</Label>
                      <Input
                        id="task-new-project-end"
                        type="date"
                        min={newProject.start_date}
                        value={newProject.end_date}
                        onChange={(e) => setNewProject((np) => ({ ...np, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-text-3">{t("proj_new_inline_hint")}</p>
                </div>
              )}
              {(() => {
                const proj = projects.find((p) => p.id === form.project_id);
                if (!proj || !form.due_date) return null;
                if (form.due_date >= proj.start_date && form.due_date <= proj.end_date) return null;
                return (
                  <p className="mt-1 text-xs text-amber">
                    {id
                      ? `Tenggat kartu di luar jadwal proyek (${proj.start_date} s.d. ${proj.end_date}).`
                      : `The card's due date is outside the project dates (${proj.start_date} to ${proj.end_date}).`}
                  </p>
                );
              })()}
            </Field>
          )}
          <Field>
            <Label>{id ? "Deskripsi / Konteks" : "Description / Context"}</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </Field>

          <Field>
            <Label>
              {id ? "Checklist (Definition of Done)" : "Checklist (Definition of Done)"}
              {checklist.length > 0 && (
                <span className="ml-1.5 font-normal text-ink-muted">
                  {doneCount}/{checklist.length}
                </span>
              )}
            </Label>
            <div className="space-y-1.5">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(e) =>
                      setChecklist((prev) => prev.map((c, i) => (i === idx ? { ...c, done: e.target.checked } : c)))
                    }
                    className="h-4 w-4 cursor-pointer accent-accent"
                  />
                  <Input
                    value={item.label}
                    onChange={(e) =>
                      setChecklist((prev) => prev.map((c, i) => (i === idx ? { ...c, label: e.target.value } : c)))
                    }
                    className={cn(item.done && "text-ink-muted line-through")}
                  />
                  <button
                    type="button"
                    onClick={() => setChecklist((prev) => prev.filter((_, i) => i !== idx))}
                    className="rounded-md p-1.5 text-ink-faint hover:bg-rose-50 hover:text-rose-600"
                    aria-label={t("delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newItem.trim()) {
                        setChecklist((prev) => [...prev, { label: newItem.trim(), done: false }]);
                        setNewItem("");
                      }
                    }
                  }}
                  placeholder={id ? "Tambah item checklist lalu Enter" : "Add a checklist item and press Enter"}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!newItem.trim()) return;
                    setChecklist((prev) => [...prev, { label: newItem.trim(), done: false }]);
                    setNewItem("");
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Field>

          <div className={cn("mb-4 rounded-lg border p-3", form.is_blocked ? "border-rose-200 bg-rose-50/50" : "border-surface-border")}>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-body">
              <input
                type="checkbox"
                checked={form.is_blocked}
                onChange={(e) => setForm((p) => ({ ...p, is_blocked: e.target.checked }))}
                className="h-4 w-4 accent-rose-600"
              />
              <AlertOctagon className={cn("h-4 w-4", form.is_blocked ? "text-rose-600" : "text-ink-faint")} />
              {id ? "Tandai Blocked (menunggu pihak lain / kendala)" : "Mark as Blocked (waiting on others / impediment)"}
            </label>
            {form.is_blocked && (
              <Input
                className="mt-2"
                required
                value={form.blocked_reason}
                onChange={(e) => setForm((p) => ({ ...p, blocked_reason: e.target.value }))}
                placeholder={id ? "Alasan blocker, mis. menunggu dokumen NIB dari merchant" : "Blocker reason, e.g. waiting for merchant's NIB document"}
              />
            )}
          </div>

          {task && task.source_type !== "manual" && (
            <p className="mb-4 flex items-center gap-1.5 text-xs text-ink-muted">
              <ArrowRight className="h-3.5 w-3.5" />
              {task.source_type === "mom"
                ? id
                  ? "Berasal dari Action Item MOM. Otomatis dicentang saat kartu Selesai."
                  : "Sourced from a MOM action item. It is ticked automatically when the card is Done."
                : id
                ? "Berasal dari Request Form. Status tiket ikut berubah saat kartu dikerjakan atau selesai."
                : "Sourced from the Request Form. The ticket status follows when the card starts or finishes."}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            {task && (
              <Button type="button" variant="danger" onClick={handleDelete} className="mr-auto">
                {t("delete")}
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="accent" loading={saving}>
              {t("save")}
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <div className="mb-4 flex items-start gap-2">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[64px]"
              placeholder={id ? "Tulis update / komentar..." : "Write an update / comment..."}
            />
            <Button type="button" variant="accent" onClick={postComment} loading={posting} disabled={!comment.trim()}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
          {activities.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-muted">{id ? "Belum ada aktivitas." : "No activity yet."}</p>
          ) : (
            <ol className="relative space-y-4 border-l border-surface-border pl-4">
              {activities.map((a) => (
                <li key={a.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                      a.kind === "comment"
                        ? "bg-accent"
                        : a.kind === "blocked"
                        ? "bg-rose-500"
                        : a.to_stage === "done"
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    )}
                  />
                  <p className="text-xs text-ink-muted">
                    <span className="font-semibold text-ink-body">{a.actor ?? "System"}</span> · {formatDate(a.created_at, true)}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-sm",
                      a.kind === "comment" ? "whitespace-pre-wrap rounded-lg bg-surface-muted px-3 py-2 text-ink" : "text-ink-body"
                    )}
                  >
                    {activityText(a)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </Dialog>
  );
}
